'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FloatingTabsBar } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';
import CustomOrgChartViewer from '@/components/modules/kelembagaan/custom-org-chart-viewer';

import AddStructureModal from '@/components/modules/kelembagaan/add-structure-modal';
import AddMemberModal from '@/components/modules/kelembagaan/add-member-modal';
import EditMemberModal from '@/components/modules/kelembagaan/edit-member-modal';
import { OrgStructure, OrgTreeNode, AddOrgStructureForm, AddOrgMemberForm } from '@/types';
import { useAdmin } from '@/lib/admin-context';
import { supabase } from '@/lib/supabase';

export default function KelembagaanPage() {
  const { isAdmin } = useAdmin();
  const toast = useToast();
  const router = useRouter();

  // Disable page scroll while on this page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;
    const prevOverscroll = (body.style as any).overscrollBehavior;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.height = '100%';
    (body.style as any).overscrollBehavior = 'none';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
      (body.style as any).overscrollBehavior = prevOverscroll;
    };
  }, []);

  // State
  const [structures, setStructures] = useState<OrgStructure[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [members, setMembers] = useState<OrgTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddStructure, setShowAddStructure] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [parentMemberId, setParentMemberId] = useState<string | undefined>();
  const [showEditMember, setShowEditMember] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgTreeNode | null>(null);

  // Confirmation
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete-structure' | 'delete-member' | null;
    targetId: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    targetId: null,
    title: '',
    message: '',
  });

  // Fetch structures
  const fetchStructures = async () => {
    try {
      const response = await fetch('/api/org-structures');
      if (!response.ok) throw new Error('Failed to fetch structures');
      const data = await response.json();
      
      // Jika bukan admin, filter hanya struktur yang sudah punya members
      if (!isAdmin && data.length > 0) {
        // Check each structure for members
        const structuresWithMembers = await Promise.all(
          data.map(async (structure: OrgStructure) => {
            try {
              const membersResponse = await fetch(`/api/org-members?structure_id=${structure.id}`);
              if (!membersResponse.ok) return null;
              const members = await membersResponse.json();
              // Hanya return structure jika ada members
              return members && members.length > 0 ? structure : null;
            } catch {
              return null;
            }
          })
        );
        
        // Filter out null values (structures without members)
        const filteredStructures = structuresWithMembers.filter((s): s is OrgStructure => s !== null);
        setStructures(filteredStructures);
        
        if (filteredStructures.length > 0 && !activeTab) {
          setActiveTab(filteredStructures[0].id);
        }
      } else {
        // Admin tetap lihat semua struktur
        setStructures(data);
        
        if (data.length > 0 && !activeTab) {
          setActiveTab(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast.error('Gagal memuat struktur organisasi');
    }
  };

  // Fetch members for active structure
  const fetchMembers = async (structureId: string) => {
    if (!structureId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/org-members?structure_id=${structureId}`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Gagal memuat anggota');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStructures();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load members when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchMembers(activeTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Add structure
  const handleAddStructure = async (data: AddOrgStructureForm) => {
    try {
      const response = await fetch('/api/org-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to add structure');
      
      const newStructure = await response.json();
      toast.success('Struktur berhasil ditambahkan!');
      
      await fetchStructures();
      setActiveTab(newStructure.id);
    } catch (error) {
      console.error('Error adding structure:', error);
      toast.error('Gagal menambahkan struktur');
    }
  };

  // Delete structure
  const handleDeleteStructure = async (structureId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete-structure',
      targetId: structureId,
      title: 'Hapus Struktur?',
      message: 'Semua anggota dalam struktur ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.',
    });
  };

  // Add member
  const handleAddMember = async (data: AddOrgMemberForm, photoFile?: File) => {
    try {
      let photoUrl = null;

      // Upload photo if exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `org-members/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const response = await fetch('/api/org-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photo_url: photoUrl }),
      });

      if (!response.ok) {
        let message = 'Failed to add member';
        try {
          const err = await response.json();
          if (err?.error) message = String(err.error);
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      toast.success('Anggota berhasil ditambahkan!');
      await fetchMembers(activeTab);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan anggota');
    }
  };

  // Delete member
  const handleDeleteMember = async (memberId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete-member',
      targetId: memberId,
      title: 'Hapus Anggota?',
      message: 'Anggota ini akan dihapus dari struktur. Tindakan ini tidak dapat dibatalkan.',
    });
  };

  // Edit member
  const handleEditMember = async (
    memberId: string,
    values: { name: string; position: string; role: string; manual_level?: number | null; order?: number },
    photoFile?: File
  ) => {
    try {
      let photoUrl: string | null | undefined = undefined;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `org-members/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('photos').getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const response = await fetch('/api/org-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId,
          name: values.name,
          position: values.position,
          role: values.role,
          manual_level: values.manual_level !== undefined ? values.manual_level : undefined,
          order: values.order,
          ...(photoUrl ? { photo_url: photoUrl } : {}),
        }),
      });

      if (!response.ok) throw new Error('Failed to update member');

      toast.success('Anggota berhasil diperbarui!');
      await fetchMembers(activeTab);
    } catch (error) {
      console.error('Error editing member:', error);
      toast.error('Gagal memperbarui anggota');
    }
  };

  // Confirm action
  const handleConfirmAction = async () => {
    if (!confirmDialog.targetId) return;

    try {
      if (confirmDialog.type === 'delete-structure') {
        const response = await fetch(`/api/org-structures?id=${confirmDialog.targetId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete structure');
        
        toast.success('Struktur berhasil dihapus');
        await fetchStructures();
        
        if (activeTab === confirmDialog.targetId) {
          setActiveTab(structures[0]?.id || '');
        }
      } else if (confirmDialog.type === 'delete-member') {
        const response = await fetch(`/api/org-members?id=${confirmDialog.targetId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete member');
        
        toast.success('Anggota berhasil dihapus');
        await fetchMembers(activeTab);
      }
    } catch (error) {
      console.error('Error in confirm action:', error);
      toast.error('Gagal menghapus');
    } finally {
      setConfirmDialog({ isOpen: false, type: null, targetId: null, title: '', message: '' });
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

  const currentMember = parentMemberId ? findMemberInTree(members, parentMemberId) : undefined;

  return (
    <div className="h-[calc(100vh-2.5rem)] overflow-hidden flex flex-col">
      {/* Hero Section */}
      <div className="text-white pt-16 shrink-0">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Struktur Kelembagaan</h1>
          <p className="text-lg md:text-xl text-blue-100">Padukuhan Karangbrosot</p>
        </div>
      </div>

      {/* Floating Tabs (Bottom) */}
      <FloatingTabsBar
        tabs={structures.map((s) => ({
          id: s.id,
          label: s.name,
          color: s.color,
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTab={isAdmin ? () => setShowAddStructure(true) : undefined}
        onRemoveTab={isAdmin ? handleDeleteStructure : undefined}
        showAdd={isAdmin}
        showRemove={isAdmin}
        variant="navbar"
        placement="bottom"
        bottomOffset={24}
      />

      {/* Content */}
      <div className="flex-1 min-h-0 mx-auto w-full">
        {structures.length === 0 && !loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-900 dark:text-white text-lg">
                {isAdmin 
                  ? 'Belum ada struktur organisasi. Klik tombol + untuk menambahkan.'
                  : 'Struktur organisasi belum tersedia.'}
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="xl" text="Memuat data..." />
          </div>
        ) : members.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-900 dark:text-white text-lg">
                {isAdmin 
                  ? 'Belum ada anggota di struktur ini. Mulai tambahkan anggota untuk membangun organisasi.'
                  : 'Data anggota belum tersedia.'}
              </p>
            </div>
          </div>
        ) : (
          <CustomOrgChartViewer
            members={members}
            structureId={activeTab}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Modals */}
      <AddStructureModal
        isOpen={showAddStructure}
        onClose={() => setShowAddStructure(false)}
        onSave={handleAddStructure}
      />

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => {
          setShowAddMember(false);
          setParentMemberId(undefined);
        }}
        onSave={handleAddMember}
        structureId={activeTab}
        parentId={parentMemberId}
        parentMember={currentMember}
      />

      <EditMemberModal
        isOpen={showEditMember}
        onClose={() => {
          setShowEditMember(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSave={handleEditMember}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
}
