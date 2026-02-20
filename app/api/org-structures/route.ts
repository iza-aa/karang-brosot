import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return Boolean(session?.value);
}

// GET - Fetch all org structures
export async function GET() {
  try {
    
    const { data, error } = await supabase
      .from('org_structures')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch org structures' },
      { status: 500 }
    );
  }
}

// POST - Create new org structure
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { name, description, color, icon } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    // Get max order
    const admin = supabaseAdmin as any;
    const { data: maxOrderData } = await admin
      .from('org_structures')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrderData?.order || 0) + 1;

    const { data, error } = await admin
      .from('org_structures')
      .insert({
        name,
        description,
        color,
        icon,
        order: newOrder,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create org structure:', error);
    return NextResponse.json(
      { error: 'Failed to create org structure' },
      { status: 500 }
    );
  }
}

// PATCH - Update org structure
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
      .from('org_structures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update org structure:', error);
    return NextResponse.json(
      { error: 'Failed to update org structure' },
      { status: 500 }
    );
  }
}

// DELETE - Delete org structure (soft delete)
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
      .from('org_structures')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete org structure:', error);
    return NextResponse.json(
      { error: 'Failed to delete org structure' },
      { status: 500 }
    );
  }
}
