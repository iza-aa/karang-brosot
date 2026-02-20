'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { OrgMember, OrgTreeNode } from '@/types';
import ButtonActionPlus from '@/components/ui/button-action-plus';

type MemberLike = OrgTreeNode | OrgMember;

type FlatNode = {
  id: string;
  parentId?: string;
  name?: string | null;
  position?: string | null;
  role?: string | null;
  photo_url?: string | null;
  level?: number | null;
  _raw: MemberLike;
};

interface OrgChartD3Props {
  members: OrgTreeNode[];
  isAdmin?: boolean;
  onAddMember?: (parentId?: string) => void;
  onEditMember?: (member: OrgTreeNode | OrgMember) => void;
  onDeleteMember?: (memberId: string) => void;
}

function flattenTree(roots: OrgTreeNode[]) {
  const flat: FlatNode[] = [];
  const byId = new Map<string, MemberLike>();

  const visit = (node: OrgTreeNode, parentId?: string) => {
    flat.push({
      id: node.id,
      parentId,
      name: node.name,
      position: node.position,
      role: node.role,
      photo_url: node.photo_url,
      level: node.level,
      _raw: node,
    });
    byId.set(node.id, node);

    for (const child of node.children ?? []) {
      visit(child, node.id);
    }
  };

  for (const root of roots) {
    visit(root);
  }

  return { flat, byId };
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function initials(name?: string | null) {
  const clean = (name ?? '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase();
}

export default function OrgChartD3({
  members,
  isAdmin = false,
  onAddMember,
  onEditMember,
  onDeleteMember,
}: OrgChartD3Props) {
  const nodeWidth = 280;
  const nodeHeight = isAdmin ? 110 : 73;
  const EXTRA_ZOOM_OUT_FACTOR = 0.85;
  const FIT_NUDGE_UP_PX = 80;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const hasRenderedOnceRef = useRef(false);

  const { flat, byId } = useMemo(() => flattenTree(members ?? []), [members]);

  const fitAndAdjust = useCallback((chart: any, animate: boolean) => {
    const shouldScale = flat.length > 1;

    const nudgeUp = () => {
      if (!shouldScale) return;
      try {
        const state = chart?.getChartState?.();
        const svg = state?.svg;
        const zoomBehavior = state?.zoomBehavior;
        const lastTransform = state?.lastTransform;
        if (!svg || !zoomBehavior?.transform || !lastTransform?.translate) return;

        const nextTransform = lastTransform.translate(0, -(FIT_NUDGE_UP_PX / (lastTransform.k || 1)));
        svg
          .transition()
          .duration(animate ? 150 : 0)
          .call(zoomBehavior.transform, nextTransform);
      } catch {
        // ignore
      }
    };

    const applyExtraZoomOut = () => {
      if (!shouldScale) return;
      try {
        const state = chart?.getChartState?.();
        const svg = state?.svg;
        const zoomBehavior = state?.zoomBehavior;
        if (!svg || !zoomBehavior?.scaleBy) {
          nudgeUp();
          return;
        }

        svg
          .transition()
          .duration(animate ? 150 : 0)
          .call(zoomBehavior.scaleBy, EXTRA_ZOOM_OUT_FACTOR)
          .on('end', nudgeUp);
      } catch {
        // ignore
      }
    };

    try {
      chart?.fit?.({ animate, scale: shouldScale, onCompleted: applyExtraZoomOut });
    } catch {
      // ignore
    }
  }, [EXTRA_ZOOM_OUT_FACTOR, FIT_NUDGE_UP_PX, flat.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDownCapture = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const actionEl = target.closest<HTMLElement>('[data-action]');
      if (!actionEl) return;

      event.stopPropagation();
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const actionEl = target.closest<HTMLElement>('[data-action]');
      if (!actionEl) return;

      const nodeEl = target.closest<HTMLElement>('[data-node-id]');
      const nodeId = nodeEl?.dataset.nodeId;
      const action = actionEl.dataset.action;
      if (!nodeId || !action) return;

      event.preventDefault();
      event.stopPropagation();

      if (action === 'add' && onAddMember) {
        onAddMember(nodeId);
        return;
      }

      if (action === 'edit' && onEditMember) {
        const raw = byId.get(nodeId);
        if (raw) onEditMember(raw);
        return;
      }

      if (action === 'delete' && onDeleteMember) {
        onDeleteMember(nodeId);
        return;
      }
    };

    container.addEventListener('pointerdown', handlePointerDownCapture, true);
    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('pointerdown', handlePointerDownCapture, true);
      container.removeEventListener('click', handleClick);
    };
  }, [byId, onAddMember, onDeleteMember, onEditMember]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    (async () => {
      // Clear previous SVG to avoid stacked renders.
      container.innerHTML = '';

      if (!flat.length) {
        chartRef.current = null;
        return;
      }

      const mod = await import('d3-org-chart');
      if (cancelled) return;

      const ChartCtor = (mod as any).OrgChart as any;
      const chart = new ChartCtor();
      chartRef.current = chart;

      // Show all levels by default (user can collapse manually).
      if (typeof (chart as any).initialExpandLevel === 'function') {
        (chart as any).initialExpandLevel(99);
      }

      chart
        .container(container)
        .data(flat)
        .nodeId((d: any) => d.id)
        .parentNodeId((d: any) => d.parentId)
        .nodeWidth(() => nodeWidth)
        .nodeHeight(() => nodeHeight)
        .childrenMargin(() => 60)
        .compactMarginBetween(() => 40)
        .compactMarginPair(() => 120)
        .nodeContent((d: any) => {
          const data = d.data as FlatNode;
          const name = escapeHtml(String(data.name ?? ''));
          const position = escapeHtml(String(data.position ?? ''));
          const role = escapeHtml(String(data.role ?? ''));
          const avatarUrl = data.photo_url ? escapeHtml(data.photo_url) : '';
          const avatarText = escapeHtml(initials(data.name));

          const compact = nodeHeight <= 80;
          const avatarSize = compact ? 32 : 36;
          const nameClass = compact ? 'text-sm' : 'text-base';
          const metaClass = compact ? 'text-xs' : 'text-sm';
          const metaMt = compact ? 'mt-0' : 'mt-0.5';
          const hasPosition = Boolean((data.position ?? '').trim());
          const hasRole = Boolean((data.role ?? '').trim());

          const avatar = avatarUrl
            ? `<img src="${avatarUrl}" alt="${name}" style="width:${avatarSize}px;height:${avatarSize}px;" class="rounded-full object-cover border border-gray-200 dark:border-gray-700" />`
            : `<div style="width:${avatarSize}px;height:${avatarSize}px;" class="rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-semibold text-xs">${avatarText}</div>`;

          const hasActions = Boolean(onAddMember || onEditMember || onDeleteMember);

          const buttons = hasActions
            ? `
              <div class="mt-2 flex items-center gap-2">
                ${onAddMember ? `<button data-action="add" class="px-2.5 py-1 rounded-lg bg-[var(--color-blue-uii)] text-white text-[11px] font-semibold">Tambah</button>` : ''}
                ${onEditMember ? `<button data-action="edit" class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-200">Edit</button>` : ''}
                ${onDeleteMember ? `<button data-action="delete" class="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/30 text-[11px] font-semibold text-red-700 dark:text-red-200">Hapus</button>` : ''}
              </div>
            `
            : '';

          return `
            <div data-node-id="${escapeHtml(data.id)}" style="width:${nodeWidth}px;height:${nodeHeight}px;" class="overflow-hidden">
              <div class="h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2.5">
                <div class="flex items-start gap-2.5">
                  ${avatar}
                  <div class="min-w-0 flex-1">
                    <div class="font-semibold ${nameClass} text-gray-900 dark:text-gray-100 truncate leading-tight">${name || '(Tanpa Nama)'}</div>
                    ${hasPosition ? `<div class="${metaClass} text-gray-600 dark:text-gray-300 ${metaMt} truncate leading-tight">${position}</div>` : ''}
                    ${hasRole ? `<div class="${metaClass} text-gray-600 dark:text-gray-300 ${metaMt} truncate leading-tight">${role}</div>` : ''}
                    ${buttons}
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .render();

      // Initial fit on render.
      try {
        const animate = hasRenderedOnceRef.current;
        fitAndAdjust(chart, animate);
      } catch {
        // ignore
      }

      hasRenderedOnceRef.current = true;
    })();

    return () => {
      cancelled = true;
      container.innerHTML = '';
      chartRef.current = null;
    };
  }, [fitAndAdjust, flat, nodeHeight, nodeWidth, onAddMember, onDeleteMember, onEditMember]);

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-35 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Belum Ada Anggota
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Mulai tambahkan anggota untuk struktur organisasi ini
        </p>
        {onAddMember && (
          <ButtonActionPlus addLabel="Tambah Anggota Pertama" onAdd={() => onAddMember()} showIcon={true} />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ contain: 'paint', isolation: 'isolate' }}
    >
      <button
        type="button"
        onClick={() => {
          try {
            const chart = chartRef.current;
            if (!chart) return;
            fitAndAdjust(chart, true);
          } catch {
            // ignore
          }
        }}
        className="absolute top-4 right-4 z-10 px-4 py-2 rounded-lg bg-[var(--color-blue-uii)] hover:opacity-90 text-white transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
        title="Reposition"
      >
        Reposition
      </button>

      <div ref={containerRef} className="w-full h-full" style={{ transform: 'translateZ(0)' }} />
    </div>
  );
}
