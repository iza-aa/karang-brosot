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
}

export interface OrgMemberWithStructure extends OrgMember {
  structure?: OrgStructure;
}

export interface OrgTreeNode extends OrgMember {
  children: OrgTreeNode[];
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
