import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return Boolean(session?.value);
}

// GET - Fetch org members by structure_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const structureId = searchParams.get('structure_id');

    if (!structureId) {
      return NextResponse.json(
        { error: 'structure_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('org_members')
      .select('*')
      .eq('structure_id', structureId)
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build tree structure
    const treeData = buildTree(data || []);

    return NextResponse.json(treeData);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch org members' },
      { status: 500 }
    );
  }
}

// POST - Create new org member
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      structure_id,
      parent_id,
      name,
      position,
      role,
      photo_url,
      description,
      phone,
      email,
      manual_level,
      order,
    } = body;

    if (!structure_id || !name || !position || !role) {
      return NextResponse.json(
        { error: 'structure_id, name, position, and role are required' },
        { status: 400 }
      );
    }

    // Calculate level based on manual_level or parent
    let level = 0;
    if (manual_level !== undefined && manual_level !== null) {
      // Use manual level if provided
      level = manual_level;
    } else if (parent_id) {
      // Auto-calculate from parent
      const admin = supabaseAdmin as any;
      const { data: parentDataRaw } = await admin
        .from('org_members')
        .select('level')
        .eq('id', parent_id)
        .single();
      
      const parentData = parentDataRaw as unknown as { level: number | null } | null;
      level = (parentData?.level || 0) + 1;
    }

    // Use provided order or calculate new order for this level
    let finalOrder = order;
    if (!finalOrder) {
      const admin = supabaseAdmin as any;
      const { data: maxOrderDataRaw } = await admin
        .from('org_members')
        .select('order')
        .eq('structure_id', structure_id)
        .eq('level', level)
        .order('order', { ascending: false })
        .limit(1)
        .single();

      const maxOrderData = maxOrderDataRaw as unknown as { order: number | null } | null;
      finalOrder = (maxOrderData?.order || 0) + 1;
    }

    const admin = supabaseAdmin as any;
    const { data, error } = await admin
      .from('org_members')
      .insert({
        structure_id,
        parent_id: parent_id || null,
        name,
        position,
        role,
        level,
        order: finalOrder,
        manual_level: manual_level !== undefined && manual_level !== null ? manual_level : null,
        photo_url: photo_url || null,
        description,
        phone,
        email,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create org member:', error);
    return NextResponse.json(
      { error: 'Failed to create org member' },
      { status: 500 }
    );
  }
}

// PATCH - Update org member
export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin as any;
    const { data, error } = await admin
      .from('org_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update org member:', error);
    return NextResponse.json(
      { error: 'Failed to update org member' },
      { status: 500 }
    );
  }
}

// DELETE - Delete org member (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    const admin = supabaseAdmin as any;
    const { error } = await admin
      .from('org_members')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete org member:', error);
    return NextResponse.json(
      { error: 'Failed to delete org member' },
      { status: 500 }
    );
  }
}

// Helper function to build tree
function buildTree(items: any[]): any[] {
  const map = new Map();
  const roots: any[] = [];

  // Create a map of all items
  items.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  // Build the tree
  items.forEach(item => {
    const node = map.get(item.id);
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
