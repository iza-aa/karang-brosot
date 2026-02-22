'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';
import type { OrgTreeNode, OrgConnection } from '@/types';

interface Position {
  id: string;
  x: number;
  y: number;
}

interface Waypoint {
  x: number;
  y: number;
}

interface VisualConnection {
  fromId: string;
  toId: string;
  type: 'solid' | 'dashed' | 'dotted';
  color: string;
  waypoints?: Waypoint[];
}

interface CustomOrgChartViewerProps {
  members: OrgTreeNode[];
  structureId: string;
  isAdmin?: boolean;
}

export default function CustomOrgChartViewer({
  members,
  structureId,
  isAdmin,
}: CustomOrgChartViewerProps) {
  const router = useRouter();
  const [connections, setConnections] = useState<VisualConnection[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isInitialFit, setIsInitialFit] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 160;
  const PADDING = 100; // Padding around content when fitting to view
  const VERTICAL_OFFSET = 40; // Shift content up to avoid TabsFlying at bottom

  // Debug: log admin status
  useEffect(() => {
    console.log('CustomOrgChartViewer - isAdmin:', isAdmin, 'structureId:', structureId);
  }, [isAdmin, structureId]);

  // Redirect to customize page if no members and user is admin
  useEffect(() => {
    if (members.length === 0 && isAdmin && structureId) {
      router.push(`/kelembagaan/customize?structure_id=${structureId}`);
    }
  }, [members.length, isAdmin, structureId, router]);

  // Initialize positions from member data using useMemo
  const positions = useMemo(() => {
    const newPositions = new Map<string, Position>();

    const initializePositions = (nodes: OrgTreeNode[], parentPos?: Position, level = 0) => {
      nodes.forEach((node, index) => {
        if (
          node.use_custom_layout &&
          node.custom_x !== null &&
          node.custom_x !== undefined &&
          node.custom_y !== null &&
          node.custom_y !== undefined
        ) {
          // Use saved custom position
          newPositions.set(node.id, {
            id: node.id,
            x: node.custom_x,
            y: node.custom_y,
          });
        } else {
          // Use default layout
          let x, y;
          if (parentPos) {
            x = parentPos.x + (index * (NODE_WIDTH + 60)) - ((nodes.length - 1) * (NODE_WIDTH + 60)) / 2;
            y = parentPos.y + NODE_HEIGHT + 80;
          } else {
            x = 400 + (index * (NODE_WIDTH + 120));
            y = 30;
          }
          newPositions.set(node.id, { id: node.id, x, y });
        }

        if (node.children && node.children.length > 0) {
          const nodePos = newPositions.get(node.id)!;
          initializePositions(node.children, nodePos, level + 1);
        }
      });
    };

    initializePositions(members);
    console.log('Initialized positions:', newPositions.size, 'nodes');
    
    return newPositions;
  }, [members]);

  // Fetch connections
  useEffect(() => {
    if (!structureId) return;

    const fetchConnections = async () => {
      try {
        const response = await fetch(`/api/org-connections?structure_id=${structureId}`);
        if (!response.ok) {
          // If no connections exist yet, just use default layout
          console.log('No connections found for structure:', structureId);
          return;
        }
        const data: OrgConnection[] = await response.json();

        console.log('Fetched connections for viewer:', data);
        setConnections(
          data.map((conn) => ({
            fromId: conn.from_member_id,
            toId: conn.to_member_id,
            type: conn.connection_type,
            color: conn.color,
            waypoints: conn.waypoints || [],
          }))
        );
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };

    fetchConnections();
  }, [structureId]);

  // Debug connections state changes
  useEffect(() => {
    console.log('Connections state updated:', connections);
  }, [connections]);

  // Calculate bounding box of all nodes
  const calculateBoundingBox = useCallback(() => {
    if (positions.size === 0) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    positions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + NODE_WIDTH);
      maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
    });

    return { minX, minY, maxX, maxY };
  }, [positions]);

  // Fit all nodes to viewport
  const fitToView = useCallback(() => {
    const bbox = calculateBoundingBox();
    if (!bbox || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const contentWidth = bbox.maxX - bbox.minX;
    const contentHeight = bbox.maxY - bbox.minY;

    // Calculate scale to fit with padding
    const scaleX = (container.width - PADDING * 2) / contentWidth;
    const scaleY = (container.height - PADDING * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

    // Center the content
    const centerX = (bbox.minX + bbox.maxX) / 2;
    const centerY = (bbox.minY + bbox.maxY) / 2;
    
    const newOffset = {
      x: container.width / 2 - centerX * newScale,
      y: container.height / 2 - centerY * newScale - VERTICAL_OFFSET,
    };

    setIsAnimating(true);
    setScale(newScale);
    setOffset(newOffset);
    setTimeout(() => setIsAnimating(false), 300);
  }, [calculateBoundingBox]);

  // Zoom to 100% actual size, centered on content
  const zoomToActualSize = useCallback(() => {
    const bbox = calculateBoundingBox();
    if (!bbox || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const centerX = (bbox.minX + bbox.maxX) / 2;
    const centerY = (bbox.minY + bbox.maxY) / 2;
    
    const newOffset = {
      x: container.width / 2 - centerX,
      y: container.height / 2 - centerY - VERTICAL_OFFSET,
    };

    setIsAnimating(true);
    setScale(1);
    setOffset(newOffset);
    setTimeout(() => setIsAnimating(false), 300);
  }, [calculateBoundingBox]);

  // Zoom to specific node
  const zoomToNode = useCallback((nodeId: string) => {
    const pos = positions.get(nodeId);
    if (!pos || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    
    // Center of the node
    const nodeCenterX = pos.x + NODE_WIDTH / 2;
    const nodeCenterY = pos.y + NODE_HEIGHT / 2;
    
    // Desired scale: 1.2x for better visibility
    const targetScale = 1.2;
    
    const newOffset = {
      x: container.width / 2 - nodeCenterX * targetScale,
      y: container.height / 2 - nodeCenterY * targetScale,
    };

    setIsAnimating(true);
    setScale(targetScale);
    setOffset(newOffset);
    setTimeout(() => setIsAnimating(false), 300);
  }, [positions]);

  // Auto-fit to view on initial load
  useEffect(() => {
    if (positions.size > 0 && !isInitialFit && containerRef.current) {
      // Use setTimeout to avoid cascading renders
      const timer = setTimeout(() => {
        fitToView();
        setIsInitialFit(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [positions, isInitialFit, fitToView]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Slower zoom speed (reduced from 0.9/1.1 to 0.95/1.05)
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    const newScale = Math.max(0.1, Math.min(3, scale * delta));
    const scaleChange = newScale / scale;
    
    // Zoom towards mouse cursor
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * scaleChange,
      y: mouseY - (mouseY - offset.y) * scaleChange,
    };
    
    setScale(newScale);
    setOffset(newOffset);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Slower zoom (reduced from 1.2 to 1.1)
    const newScale = Math.min(3, scale * 1.1);
    const scaleChange = newScale / scale;
    
    const newOffset = {
      x: centerX - (centerX - offset.x) * scaleChange,
      y: centerY - (centerY - offset.y) * scaleChange,
    };
    
    setIsAnimating(true);
    setScale(newScale);
    setOffset(newOffset);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Slower zoom (reduced from 1.2 to 1.1)
    const newScale = Math.max(0.1, scale / 1.1);
    const scaleChange = newScale / scale;
    
    const newOffset = {
      x: centerX - (centerX - offset.x) * scaleChange,
      y: centerY - (centerY - offset.y) * scaleChange,
    };
    
    setIsAnimating(true);
    setScale(newScale);
    setOffset(newOffset);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const renderNode = (node: OrgTreeNode) => {
    const pos = positions.get(node.id);
    if (!pos) return null;

    return (
      <div
        key={node.id}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          zoomToNode(node.id);
        }}
        title="Double-click untuk zoom ke node ini"
      >
        <div className="h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-4 shadow-lg hover:shadow-xl transition-shadow flex flex-col cursor-pointer">
          {/* Bagian Atas: Foto + Nama */}
          <div className="flex items-center gap-3 pb-1">
            {node.photo_url ? (
              <img
                src={node.photo_url}
                alt={node.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 font-bold text-xl flex-shrink-0">
                {node.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100 break-words leading-tight">
                {node.name || '(Tanpa Nama)'}
              </div>
            </div>
          </div>

          {/* Garis Pemisah */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Bagian Bawah: Jabatan & Peran */}
          <div className="flex-1 space-y-1.5">
            {node.position && (
              <div className="text-base font-semibold text-gray-700 dark:text-gray-200 truncate">
                {node.position}
              </div>
            )}
            {node.role && (
              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {node.role}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAllNodes = (nodes: OrgTreeNode[]): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];

    const traverse = (nodeList: OrgTreeNode[]) => {
      nodeList.forEach((node) => {
        const element = renderNode(node);
        if (element) elements.push(element);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(nodes);
    return elements;
  };

  const renderConnections = () => {
    const lines: React.ReactElement[] = [];

    console.log('Rendering connections, count:', connections.length);
    connections.forEach((conn, idx) => {
      const fromPos = positions.get(conn.fromId);
      const toPos = positions.get(conn.toId);

      if (!fromPos || !toPos) {
        console.log('Missing position for connection:', conn.fromId, '->', conn.toId);
        return;
      }

      const fromX = fromPos.x + NODE_WIDTH / 2;
      const fromY = fromPos.y + NODE_HEIGHT / 2; // Center of card
      const toX = toPos.x + NODE_WIDTH / 2;
      const toY = toPos.y + NODE_HEIGHT / 2; // Center of card

      const strokeDasharray =
        conn.type === 'dashed' ? '10,5' : conn.type === 'dotted' ? '2,3' : 'none';

      console.log(`Drawing connection ${idx}:`, { fromX, fromY, toX, toY, color: conn.color, waypoints: conn.waypoints });
      
      // Build path with waypoints if they exist
      let pathData = `M ${fromX} ${fromY}`;
      
      if (conn.waypoints && conn.waypoints.length > 0) {
        // Path through all waypoints
        conn.waypoints.forEach(wp => {
          pathData += ` L ${wp.x} ${wp.y}`;
        });
        pathData += ` L ${toX} ${toY}`;
      } else {
        // Default orthogonal path
        const midY = (fromY + toY) / 2;
        pathData = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
      }
      
      lines.push(
        <path
          key={`conn-${idx}`}
          d={pathData}
          stroke={conn.color}
          strokeWidth="2"
          strokeDasharray={strokeDasharray}
          fill="none"
        />
      );
    });

    return lines;
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-15 right-4 z-10 flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-800">
        <button
          onClick={handleZoomIn}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold text-sm text-gray-900 dark:text-gray-100"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold text-sm text-gray-900 dark:text-gray-100"
          title="Zoom Out"
        >
          −
        </button>
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
        <button
          onClick={fitToView}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold text-xs text-gray-900 dark:text-gray-100"
          title="Fit All Nodes"
        >
          ⊡
        </button>
        <button
          onClick={zoomToActualSize}
          className="px-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold text-xs text-gray-900 dark:text-gray-100"
          title="100% Actual Size"
        >
          100%
        </button>
        <div className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
          {Math.round(scale * 100)}%
        </div>
        {isAdmin && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              onClick={() => router.push(`/kelembagaan/customize?structure_id=${structureId}`)}
              className="px-3 py-2 rounded-lg bg-[var(--color-blue-uii)] hover:opacity-90 transition-colors flex items-center justify-center"
              title="Customize Layout"
            >
              <PencilIcon className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : isAnimating ? 'transform 0.3s ease-out' : 'transform 0.1s ease-out',
            position: 'relative',
            width: '3000px',
            height: '3000px',
          }}
        >
          {/* SVG for connections */}
          <svg 
            className="absolute inset-0 pointer-events-none" 
            style={{ zIndex: 0, width: '100%', height: '100%' }}
            width="3000" 
            height="3000"
          >
            {renderConnections()}
          </svg>

          {/* Nodes */}
          <div className="relative" style={{ zIndex: 1 }}>
            {renderAllNodes(members)}
          </div>
        </div>
      </div>
    </div>
  );
}
