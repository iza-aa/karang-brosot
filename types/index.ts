// Organizational Structure Types
export interface OrgStructure {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  structure_id: string;
  parent_id?: string | null;
  name: string;
  position: string;
  role: string;
  level: number;
  order: number;
  photo_url?: string | null;
  description?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: OrgMember[];
  custom_x?: number | null;
  custom_y?: number | null;
  use_custom_layout?: boolean;
}

export interface OrgMemberWithStructure extends OrgMember {
  structure?: OrgStructure;
}

export interface OrgTreeNode extends OrgMember {
  children: OrgTreeNode[];
}

export interface OrgConnection {
  id: string;
  structure_id: string;
  from_member_id: string;
  to_member_id: string;
  connection_type: 'solid' | 'dashed' | 'dotted';
  color: string;
  waypoints?: { x: number; y: number }[];
  created_at: string;
  updated_at: string;
}

// Form types
export interface AddOrgStructureForm {
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface AddOrgMemberForm {
  structure_id: string;
  parent_id?: string | null;
  name: string;
  position: string;
  role: string;
  level: number;
  photo?: File | null;
  description?: string;
  phone?: string;
  email?: string;
}

export interface UpdateOrgMemberForm extends Partial<AddOrgMemberForm> {
  id: string;
}
