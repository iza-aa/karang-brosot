'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  HandRaisedIcon, 
  LinkIcon, 
  ScissorsIcon, 
  ArrowDownTrayIcon,
  LightBulbIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { OrgTreeNode, OrgConnection, AddOrgMemberForm } from '@/types';
import { useAdmin } from '@/lib/admin-context';
import AddMemberModal from '@/components/modules/kelembagaan/add-member-modal';
import EditMemberModal from '@/components/modules/kelembagaan/edit-member-modal';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';

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
  id?: string;
  fromId: string;
  toId: string;
  type: 'solid' | 'dashed' | 'dotted';
  color: string;
  waypoints?: Waypoint[];
}

type EditorMode = 'move' | 'connect' | 'delete-connection';

function CustomizeLayoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const structureId = searchParams.get('structure_id');

  const [members, setMembers] = useState<OrgTreeNode[]>([]);
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const [connections, setConnections] = useState<VisualConnection[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [editorMode, setEditorMode] = useState<EditorMode>('move');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [connectionType, setConnectionType] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [connectionColor, setConnectionColor] = useState('#000000');
  const [isInitialCentered, setIsInitialCentered] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Waypoint dragging state
  const [draggedWaypoint, setDraggedWaypoint] = useState<{ connectionIndex: number; waypointIndex: number } | null>(null);

  // Member management states
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [parentMemberId, setParentMemberId] = useState<string | undefined>(undefined);
  const [autoCreateConnection, setAutoCreateConnection] = useState(false); // Flag untuk auto-create connection
  const [editingMember, setEditingMember] = useState<OrgTreeNode | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const GRID_SIZE = 20;
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 160;

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/kelembagaan');
    }
  }, [isAdmin, router]);

  // Fetch members
  useEffect(() => {
    if (!structureId) return;

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/org-members?structure_id=${structureId}`);
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [structureId]);

  // Fetch connections
  useEffect(() => {
    if (!structureId) return;

    const fetchConnections = async () => {
      try {
        const response = await fetch(`/api/org-connections?structure_id=${structureId}`);
        if (!response.ok) {
          console.warn('Failed to fetch connections, may not exist yet');
          setConnections([]);
          return;
        }
        const data: OrgConnection[] = await response.json();
        
        console.log('Fetched connections:', data);
        setConnections(
          data.map((conn) => ({
            id: conn.id,
            fromId: conn.from_member_id,
            toId: conn.to_member_id,
            type: conn.connection_type,
            color: conn.color,
            waypoints: conn.waypoints || [],
          }))
        );
      } catch (error) {
        console.error('Error fetching connections:', error);
        setConnections([]);
      }
    };

    fetchConnections();
  }, [structureId]);

  // Initialize positions
  useEffect(() => {
    const newPositions = new Map<string, Position>();
    
    const initializePositions = (nodes: OrgTreeNode[], parentPos?: Position, level = 0) => {
      nodes.forEach((node, index) => {
        if (node.custom_x !== null && node.custom_x !== undefined && 
            node.custom_y !== null && node.custom_y !== undefined &&
            node.use_custom_layout) {
          // Use saved custom position
          newPositions.set(node.id, {
            id: node.id,
            x: node.custom_x,
            y: node.custom_y,
          });
        } else {
          // Use default grid layout
          let x, y;
          if (parentPos) {
            // Position below and centered relative to parent
            x = parentPos.x + (index * (NODE_WIDTH + 60)) - ((nodes.length - 1) * (NODE_WIDTH + 60)) / 2;
            y = parentPos.y + NODE_HEIGHT + 80;
          } else {
            // Root nodes - center them in canvas (3000px wide)
            const totalWidth = nodes.length * (NODE_WIDTH + 120);
            const startX = Math.max(400, (3000 - totalWidth) / 2); // Center horizontally with minimum margin
            x = startX + (index * (NODE_WIDTH + 120));
            y = 400; // Good margin from top
          }
          // Snap to grid for alignment
          x = Math.round(x / GRID_SIZE) * GRID_SIZE;
          y = Math.round(y / GRID_SIZE) * GRID_SIZE;
          newPositions.set(node.id, { id: node.id, x, y });
        }

        // Initialize children recursively
        if (node.children && node.children.length > 0) {
          const nodePos = newPositions.get(node.id)!;
          initializePositions(node.children, nodePos, level + 1);
        }
      });
    };

    initializePositions(members);
    setPositions(newPositions);
  }, [members]);

  // Auto-center nodes on initial load
  useEffect(() => {
    if (positions.size > 0 && !isInitialCentered && scrollContainerRef.current && canvasRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        if (!scrollContainerRef.current) return;
        
        // Calculate bounding box of all nodes
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        positions.forEach((pos) => {
          minX = Math.min(minX, pos.x);
          minY = Math.min(minY, pos.y);
          maxX = Math.max(maxX, pos.x + NODE_WIDTH);
          maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
        });

        // Calculate center of content
        const contentCenterX = (minX + maxX) / 2;
        const contentCenterY = (minY + maxY) / 2;

        // Get viewport dimensions
        const viewportWidth = scrollContainerRef.current.clientWidth;
        const viewportHeight = scrollContainerRef.current.clientHeight;

        // Calculate scroll position to center content
        const scrollLeft = contentCenterX - viewportWidth / 2;
        const scrollTop = contentCenterY - viewportHeight / 2;

        console.log('Auto-centering customize page:', { 
          contentCenterX, 
          contentCenterY, 
          scrollLeft, 
          scrollTop,
          viewportWidth,
          viewportHeight
        });

        // Scroll to center
        scrollContainerRef.current.scrollTo({
          left: Math.max(0, scrollLeft),
          top: Math.max(0, scrollTop),
          behavior: 'auto', // Changed to 'auto' for immediate centering
        });

        setIsInitialCentered(true);
      }, 200); // Increased delay to ensure DOM is ready
      
      return () => clearTimeout(timer);
    }
  }, [positions, isInitialCentered]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdownId !== null) {
        const target = e.target as HTMLElement;
        if (!target.closest('.dropdown-menu') && !target.closest('button')) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  // Close dropdown when editor mode changes
  useEffect(() => {
    setOpenDropdownId(null);
  }, [editorMode]);

  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleMouseDown = async (e: React.MouseEvent, nodeId: string) => {
    if (editorMode === 'connect') {
      e.stopPropagation();
      console.log('Connect mode - clicked node:', nodeId, 'connectingFrom:', connectingFrom);
      if (!connectingFrom) {
        // Start connection
        console.log('Starting connection from:', nodeId);
        setConnectingFrom(nodeId);
      } else if (connectingFrom !== nodeId) {
        // Complete connection
        console.log('Completing connection from', connectingFrom, 'to', nodeId);
        
        try {
          // Save to database immediately
          const response = await fetch('/api/org-connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              structure_id: structureId,
              from_member_id: connectingFrom,
              to_member_id: nodeId,
              connection_type: connectionType,
              color: connectionColor,
              waypoints: [],
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save connection');
          }

          const savedConnection = await response.json();
          console.log('Connection saved to database:', savedConnection);

          // Add to state with ID from database
          const newConnection: VisualConnection = {
            id: savedConnection.id,
            fromId: connectingFrom,
            toId: nodeId,
            type: connectionType,
            color: connectionColor,
            waypoints: [],
          };
          setConnections([...connections, newConnection]);
        } catch (error) {
          console.error('Failed to create connection:', error);
          alert('Gagal membuat koneksi');
        }
        
        setConnectingFrom(null);
      } else {
        // Clicked same node, cancel
        console.log('Clicked same node, canceling connection');
        setConnectingFrom(null);
      }
      return;
    }

    if (editorMode === 'delete-connection') {
      return;
    }

    // Move mode
    const pos = positions.get(nodeId);
    if (!pos) return;

    // Close dropdown when starting to drag
    setOpenDropdownId(null);

    if (!scrollContainerRef.current) return;
    
    const scrollParent = scrollContainerRef.current;
    const scrollRect = scrollParent.getBoundingClientRect();
    
    // Calculate where mouse is on canvas
    const viewportX = e.clientX - scrollRect.left;
    const viewportY = e.clientY - scrollRect.top;
    const canvasX = viewportX + scrollParent.scrollLeft;
    const canvasY = viewportY + scrollParent.scrollTop;
    
    // Calculate offset from node position
    const offsetX = canvasX - pos.x;
    const offsetY = canvasY - pos.y;

    setDraggedNode(nodeId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current || !scrollContainerRef.current) return;

      const scrollParent = scrollContainerRef.current;
      const scrollRect = scrollParent.getBoundingClientRect();
      
      // Calculate position relative to scroll container viewport
      const viewportX = e.clientX - scrollRect.left;
      const viewportY = e.clientY - scrollRect.top;
      
      // Add scroll offset to get position on canvas
      const x = viewportX + scrollParent.scrollLeft;
      const y = viewportY + scrollParent.scrollTop;
      
      setMousePos({ x, y });
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && editorMode === 'connect') {
      canvas.addEventListener('mousemove', handleCanvasMouseMove);
      return () => {
        canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      };
    }
  }, [editorMode, handleCanvasMouseMove]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!scrollContainerRef.current) return;

      const scrollParent = scrollContainerRef.current;
      const scrollRect = scrollParent.getBoundingClientRect();
      
      // Calculate position on canvas
      const viewportX = e.clientX - scrollRect.left;
      const viewportY = e.clientY - scrollRect.top;
      
      const canvasX = viewportX + scrollParent.scrollLeft;
      const canvasY = viewportY + scrollParent.scrollTop;

      // Handle waypoint dragging
      if (draggedWaypoint) {
        const x = snapToGrid(canvasX);
        const y = snapToGrid(canvasY);
        
        setConnections(prev => prev.map((conn, idx) => {
          if (idx === draggedWaypoint.connectionIndex && conn.waypoints) {
            const newWaypoints = [...conn.waypoints];
            newWaypoints[draggedWaypoint.waypointIndex] = { x, y };
            return { ...conn, waypoints: newWaypoints };
          }
          return conn;
        }));
        return;
      }

      // Handle node dragging
      if (draggedNode) {
        const x = canvasX - dragOffset.x;
        const y = canvasY - dragOffset.y;

        const snappedX = snapToGrid(x);
        const snappedY = snapToGrid(y);

        setPositions((prev) => {
          const newPositions = new Map(prev);
          newPositions.set(draggedNode, { id: draggedNode, x: snappedX, y: snappedY });
          return newPositions;
        });
      }
    },
    [draggedNode, draggedWaypoint, dragOffset]
  );

  const handleMouseUp = useCallback(async () => {
    // Save waypoints to database if we were dragging a waypoint
    if (draggedWaypoint) {
      const connection = connections[draggedWaypoint.connectionIndex];
      if (connection.id) {
        try {
          const response = await fetch('/api/org-connections', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: connection.id,
              waypoints: connection.waypoints || [],
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save waypoints');
          }
          console.log('Waypoints saved to database:', connection.id);
        } catch (error) {
          console.error('Failed to save waypoints:', error);
          alert('Gagal menyimpan waypoints');
        }
      }
    }

    setDraggedNode(null);
    setDraggedWaypoint(null);
  }, [draggedWaypoint, connections]);

  useEffect(() => {
    if (draggedNode || draggedWaypoint) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, draggedWaypoint, handleMouseMove, handleMouseUp]);

  const handleSaveLayout = async () => {
    try {
      setIsSaving(true);

      // Save positions only (connections are already saved immediately when created/deleted)
      const positionsArray = Array.from(positions.values()).map((pos) => ({
        id: pos.id,
        custom_x: pos.x,
        custom_y: pos.y,
      }));

      const posResponse = await fetch('/api/org-members/positions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          positions: positionsArray, 
          use_custom_layout: true,
          structure_id: structureId,
        }),
      });

      if (!posResponse.ok) {
        throw new Error('Failed to save positions');
      }

      alert('Layout berhasil disimpan!');
      router.push('/kelembagaan');
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('Gagal menyimpan layout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConnection = async (connectionIndex: number) => {
    const connection = connections[connectionIndex];
    
    try {
      // If connection has an ID, delete from database immediately
      if (connection.id) {
        const response = await fetch(`/api/org-connections?id=${connection.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete connection from database');
        }
        console.log('Connection deleted from database:', connection.id);
      }

      // Remove from local state
      setConnections(connections.filter((_, i) => i !== connectionIndex));
      console.log('Connection removed from state');
    } catch (error) {
      console.error('Failed to delete connection:', error);
      alert('Gagal menghapus koneksi');
    }
  };

  const handleResetLayout = async () => {
    if (!confirm('Reset semua posisi ke layout default?')) {
      return;
    }

    try {
      const response = await fetch('/api/org-members/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structure_id: structureId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset layout');
      }

      alert('Layout berhasil direset!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset layout:', error);
      alert('Gagal reset layout');
    }
  };

  // Member management handlers
  const handleAddMember = async (data: AddOrgMemberForm, photoFile?: File) => {
    try {
      // Upload photo if provided
      let photoUrl = null;
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('folder', 'org-members');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoUrl = uploadData.data.url;
        }
      }

      const response = await fetch('/api/org-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          structure_id: structureId,
          parent_id: parentMemberId,
          ...(photoUrl && { photo_url: photoUrl }),
        }),
      });

      if (!response.ok) throw new Error('Failed to add member');

      const newMember = await response.json();
      toast.success('Member berhasil ditambahkan!');
      
      // Auto-create connection if adding from a parent node
      if (autoCreateConnection && parentMemberId && newMember.id) {
        try {
          const connectionResponse = await fetch('/api/org-connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              structure_id: structureId,
              from_member_id: parentMemberId,
              to_member_id: newMember.id,
              connection_type: 'solid',
              color: '#000000',
              waypoints: [],
            }),
          });

          if (connectionResponse.ok) {
            const newConnection = await connectionResponse.json();
            setConnections(prev => [...prev, {
              id: newConnection.id,
              fromId: parentMemberId,
              toId: newMember.id,
              type: 'solid',
              color: '#000000',
              waypoints: [],
            }]);
            toast.success('Koneksi otomatis berhasil dibuat!');
          }
        } catch (error) {
          console.error('Failed to auto-create connection:', error);
          // Don't show error toast, main operation succeeded
        }
      }

      setShowAddMember(false);
      setParentMemberId(undefined);
      setAutoCreateConnection(false);
      
      // Reload members
      const membersResponse = await fetch(`/api/org-members?structure_id=${structureId}`);
      const membersData = await membersResponse.json();
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error('Gagal menambahkan member');
    }
  };

  const handleEditMember = async (memberId: string, values: { name: string; position: string; role: string }, photoFile?: File) => {
    try {
      // Upload photo if provided
      let photoUrl = null;
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('folder', 'org-members');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoUrl = uploadData.data.url;
        }
      }

      const response = await fetch('/api/org-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId,
          ...values,
          ...(photoUrl && { photo_url: photoUrl }),
        }),
      });

      if (!response.ok) throw new Error('Failed to update member');

      toast.success('Member berhasil diupdate!');
      setShowEditMember(false);
      setEditingMember(null);
      
      // Reload members
      const membersResponse = await fetch(`/api/org-members?structure_id=${structureId}`);
      const membersData = await membersResponse.json();
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to update member:', error);
      toast.error('Gagal mengupdate member');
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMemberId) return;

    try {
      const response = await fetch(`/api/org-members?id=${deletingMemberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete member');

      toast.success('Member berhasil dihapus!');
      setShowDeleteConfirm(false);
      setDeletingMemberId(null);
      
      // Reload members
      const membersResponse = await fetch(`/api/org-members?structure_id=${structureId}`);
      const membersData = await membersResponse.json();
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to delete member:', error);
      toast.error('Gagal menghapus member');
    }
  };

  // Helper function to find member in tree structure
  const findMemberInTree = (nodes: OrgTreeNode[], memberId: string): OrgTreeNode | undefined => {
    for (const node of nodes) {
      if (node.id === memberId) return node;
      if (node.children && node.children.length > 0) {
        const found = findMemberInTree(node.children, memberId);
        if (found) return found;
      }
    }
    return undefined;
  };

  const parentMember = parentMemberId ? findMemberInTree(members, parentMemberId) : undefined;

  const renderNode = (node: OrgTreeNode) => {
    const pos = positions.get(node.id);
    if (!pos) return null;

    const isDragging = draggedNode === node.id;
    const isConnectingFrom = connectingFrom === node.id;
    const isConnectMode = editorMode === 'connect';

    let borderColor = 'border-gray-200 dark:border-gray-800';
    let ringClass = '';
    
    if (isConnectingFrom) {
      borderColor = 'border-blue-500 dark:border-blue-400';
      ringClass = 'ring-4 ring-blue-300 dark:ring-blue-600';
    } else if (isConnectMode) {
      borderColor = 'border-green-300 dark:border-green-600';
      ringClass = 'hover:ring-2 hover:ring-green-200 dark:hover:ring-green-700';
    }

    return (
      <div
        key={node.id}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          cursor: editorMode === 'move' ? 'move' : editorMode === 'connect' ? 'crosshair' : 'default',
          opacity: isDragging ? 0.7 : 1,
          zIndex: isDragging ? 1000 : isConnectingFrom ? 999 : openDropdownId === node.id ? 998 : 1,
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => handleMouseDown(e, node.id)}
        onClick={() => {
          console.log('Node clicked:', node.id, 'mode:', editorMode);
        }}
      >
        {/* Three-dot Menu - Outside overflow-hidden card */}
        <div className="absolute top-2 right-2 z-[9998]">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdownId(openDropdownId === node.id ? null : node.id);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-colors"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* Dropdown Menu */}
          {openDropdownId === node.id && (
            <div 
              className="dropdown-menu absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  setParentMemberId(node.id);
                  setAutoCreateConnection(true); // Auto-create connection from parent
                  setShowAddMember(true);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-3 rounded-t-xl transition-colors group border-b border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <PlusIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-gray-100 font-semibold flex items-center gap-1.5">
                    <span>Tambah Anggota</span>
                    <LinkIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                    Otomatis buat garis penghubung
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  setEditingMember(node);
                  setShowEditMember(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
              >
                <PencilIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  setDeletingMemberId(node.id);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 rounded-b-xl transition-colors"
              >
                <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-200 font-medium">Hapus</span>
              </button>
            </div>
          )}
        </div>

        <div className={`h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border-2 ${borderColor} p-4 shadow-lg hover:shadow-xl transition-all ${ringClass} flex flex-col relative`}>

          {/* Bagian Atas: Foto + Nama */}
          <div className="flex items-center gap-3 pb-1 pr-8">
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
              <div className="font-bold text-base text-gray-900 dark:text-gray-100 break-words leading-tight">
                {node.name || '(Tanpa Nama)'}
              </div>
            </div>
          </div>

          {/* Garis Pemisah */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Bagian Bawah: Jabatan & Peran */}
          <div className="flex-1 space-y-1.5">
            {node.position && (
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                {node.position}
              </div>
            )}
            {node.role && (
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
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

  // Calculate connections
  const renderConnections = () => {
    const lines: React.ReactElement[] = [];

    // Render saved connections
    connections.forEach((conn, idx) => {
      const fromPos = positions.get(conn.fromId);
      const toPos = positions.get(conn.toId);

      if (!fromPos || !toPos) return;

      const fromX = fromPos.x + NODE_WIDTH / 2;
      const fromY = fromPos.y + NODE_HEIGHT / 2;
      const toX = toPos.x + NODE_WIDTH / 2;
      const toY = toPos.y + NODE_HEIGHT / 2;

      const strokeDasharray =
        conn.type === 'dashed' ? '10,5' : conn.type === 'dotted' ? '2,3' : 'none';

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
        <g key={`conn-${idx}`}>
          <path
            d={pathData}
            stroke={conn.color}
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            fill="none"
            className="transition-all"
          />
          
          {/* Render delete button */}
          {editorMode === 'delete-connection' && (
            <circle
              cx={(fromX + toX) / 2}
              cy={(fromY + toY) / 2}
              r="8"
              fill="red"
              style={{ pointerEvents: 'auto' }}
              className="cursor-pointer hover:r-10 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteConnection(idx);
              }}
            />
          )}

          {/* Render waypoint controls */}
          {editorMode === 'move' && conn.waypoints && conn.waypoints.map((wp, wpIdx) => (
            <circle
              key={`wp-${idx}-${wpIdx}`}
              cx={wp.x}
              cy={wp.y}
              r="6"
              fill="#4F46E5"
              stroke="white"
              strokeWidth="2"
              style={{ pointerEvents: 'auto', cursor: 'move' }}
              className="hover:r-8 transition-all"
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggedWaypoint({ connectionIndex: idx, waypointIndex: wpIdx });
              }}
              onContextMenu={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove waypoint
                const updatedWaypoints = conn.waypoints!.filter((_, i) => i !== wpIdx);
                
                // Update local state
                setConnections(prev => prev.map((c, i) => 
                  i === idx ? { ...c, waypoints: updatedWaypoints } : c
                ));

                // Save to database if connection has an ID
                if (conn.id) {
                  try {
                    const response = await fetch('/api/org-connections', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: conn.id,
                        waypoints: updatedWaypoints,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to delete waypoint');
                    }
                    console.log('Waypoint deleted and saved:', conn.id);
                  } catch (error) {
                    console.error('Failed to delete waypoint:', error);
                    alert('Gagal menghapus waypoint');
                  }
                }
              }}
            />
          ))}

          {/* Add waypoint buttons between each segment */}
          {editorMode === 'move' && (() => {
            const segments: { x: number; y: number }[] = [];
            
            // Create segments: from -> wp1 -> wp2 -> ... -> to
            const points = [
              { x: fromX, y: fromY },
              ...(conn.waypoints || []),
              { x: toX, y: toY }
            ];

            // Add midpoint buttons between each consecutive pair
            for (let i = 0; i < points.length - 1; i++) {
              const midX = (points[i].x + points[i + 1].x) / 2;
              const midY = (points[i].y + points[i + 1].y) / 2;
              segments.push({ x: midX, y: midY });
            }

            return segments.map((seg, segIdx) => (
              <circle
                key={`add-wp-${idx}-${segIdx}`}
                cx={seg.x}
                cy={seg.y}
                r="5"
                fill="#10B981"
                stroke="white"
                strokeWidth="2"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                className="hover:r-7 transition-all opacity-50 hover:opacity-100"
                onClick={async (e) => {
                  e.stopPropagation();
                  // Add waypoint at this segment's midpoint
                  const newWaypoint: Waypoint = { x: seg.x, y: seg.y };
                  const updatedWaypoints = [...(conn.waypoints || [])];
                  updatedWaypoints.splice(segIdx, 0, newWaypoint);
                  
                  // Update local state
                  setConnections(prev => prev.map((c, i) => 
                    i === idx ? { ...c, waypoints: updatedWaypoints } : c
                  ));

                  // Save to database if connection has an ID
                  if (conn.id) {
                    try {
                      const response = await fetch('/api/org-connections', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: conn.id,
                          waypoints: updatedWaypoints,
                        }),
                      });

                      if (!response.ok) {
                        throw new Error('Failed to save waypoint');
                      }
                      console.log('Waypoint added and saved:', conn.id);
                    } catch (error) {
                      console.error('Failed to save waypoint:', error);
                      alert('Gagal menyimpan waypoint');
                    }
                  }
                }}
              />
            ));
          })()}
        </g>
      );
    });

    // Render connection preview while drawing
    if (editorMode === 'connect' && connectingFrom) {
      const fromPos = positions.get(connectingFrom);
      if (fromPos) {
        const fromX = fromPos.x + NODE_WIDTH / 2;
        const fromY = fromPos.y + NODE_HEIGHT / 2;

        const midY = (fromY + mousePos.y) / 2;
        const strokeDasharray =
          connectionType === 'dashed' ? '10,5' : connectionType === 'dotted' ? '2,3' : 'none';

        const previewPath = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${mousePos.x} ${midY} L ${mousePos.x} ${mousePos.y}`;

        lines.push(
          <path
            key="preview"
            d={previewPath}
            stroke={connectionColor}
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            fill="none"
            opacity="0.5"
          />
        );
      }
    }

    return lines;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden z-50">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/kelembagaan')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          >
            <span className="text-lg">←</span>
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Customize Organization Chart
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetLayout}
            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors font-semibold"
          >
            Reset All
          </button>
          <button
            onClick={handleSaveLayout}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditorMode('move');
                  setConnectingFrom(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
                  editorMode === 'move'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <HandRaisedIcon className="w-5 h-5" />
                <span>Move Nodes</span>
              </button>
              <button
                onClick={() => {
                  setEditorMode('connect');
                  setDraggedNode(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
                  editorMode === 'connect'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                <span>Draw Connections</span>
                {connections.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                    {connections.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setEditorMode('delete-connection');
                  setConnectingFrom(null);
                  setDraggedNode(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
                  editorMode === 'delete-connection'
                    ? 'bg-red-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <ScissorsIcon className="w-5 h-5" />
                <span>Delete Connections</span>
              </button>
            </div>



            {/* Add Member Button */}
            <button
              onClick={() => {
                setParentMemberId(undefined);
                setAutoCreateConnection(false); // No auto-connection for toolbar button
                setShowAddMember(true);
              }}
              className="px-4 py-2 rounded-lg bg-[var(--color-blue-uii)] hover:opacity-90 text-white font-semibold text-sm transition-opacity flex items-center gap-2"
              title="Tambah anggota baru (tanpa koneksi otomatis)"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Tambah Anggota Baru</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {editorMode === 'connect' && (
              <>
                <label className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <select
                    value={connectionType}
                    onChange={(e) => setConnectionType(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
                  <input
                    type="color"
                    value={connectionColor}
                    onChange={(e) => setConnectionColor(e.target.value)}
                    className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                </label>
              </>
            )}
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-700 cursor-pointer border border-gray-300 dark:border-gray-600">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Show Grid</span>
            </label>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className={`border-b px-6 py-2 ${connectingFrom ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
        <div className="flex items-center gap-2 text-sm">
          {connectingFrom ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
          <span className={`font-medium ${connectingFrom ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'}`}>
            {editorMode === 'move' && 'Drag nodes to reposition them. Click green dot on connections to add waypoint, drag blue dots to adjust path, right-click blue dots to delete waypoint.'}
            {editorMode === 'connect' && !connectingFrom && 'Click a node to start drawing a connection.'}
            {editorMode === 'connect' && connectingFrom && 'Now click another node to complete the connection, or click the same node to cancel.'}
            {editorMode === 'delete-connection' && 'Click the red dot on a connection line to delete it.'}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto scrollbar-hide"
      >
        <div
          ref={canvasRef}
          className="relative"
          style={{
            width: '3000px',
            height: '3000px',
            backgroundImage: showGrid
              ? `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent ${GRID_SIZE - 1}px,
                  rgba(0, 0, 0, 0.05) ${GRID_SIZE - 1}px,
                  rgba(0, 0, 0, 0.05) ${GRID_SIZE}px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent ${GRID_SIZE - 1}px,
                  rgba(0, 0, 0, 0.05) ${GRID_SIZE - 1}px,
                  rgba(0, 0, 0, 0.05) ${GRID_SIZE}px
                )
              `
              : undefined,
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
          
          {/* Empty State - No Members Yet */}
          {members.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-300 dark:border-gray-700 p-12 max-w-lg text-center">
                <div className="mb-6">
                  <svg
                    className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Belum Ada Anggota
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Struktur organisasi ini masih kosong. Mulai dengan menambahkan anggota pertama untuk membangun struktur organisasi Anda.
                </p>
                <button
                  onClick={() => {
                    setParentMemberId(undefined);
                    setAutoCreateConnection(false);
                    setShowAddMember(true);
                  }}
                  className="px-8 py-4 bg-[var(--color-blue-uii)] hover:opacity-90 text-white font-bold rounded-lg transition-opacity inline-flex items-center gap-3 text-lg shadow-lg"
                >
                  <PlusIcon className="w-6 h-6" />
                  Tambah Anggota Pertama
                </button>
              </div>
            </div>
          )}
          
          {/* Nodes */}
          <div className="relative" style={{ zIndex: 1 }}>
            {renderAllNodes(members)}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => {
          setShowAddMember(false);
          setParentMemberId(undefined);
          setAutoCreateConnection(false);
        }}
        onSave={handleAddMember}
        structureId={structureId || ''}
        parentId={parentMemberId}
        parentMember={parentMember}
      />

      <EditMemberModal
        isOpen={showEditMember}
        onClose={() => {
          setShowEditMember(false);
          setEditingMember(null);
        }}
        onSave={handleEditMember}
        member={editingMember}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingMemberId(null);
        }}
        onConfirm={handleDeleteMember}
        title="Hapus Member"
        message="Apakah Anda yakin ingin menghapus member ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        type="danger"
      />
    </div>
  );
}

export default function CustomizeLayoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CustomizeLayoutContent />
    </Suspense>
  );
}
