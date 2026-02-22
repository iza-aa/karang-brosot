import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET - Fetch all connections for a structure
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const structureId = searchParams.get('structure_id');

    if (!structureId) {
      return NextResponse.json(
        { error: 'structure_id is required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await (supabaseAdmin
      .from('org_connections') as any)
      .select('*')
      .eq('structure_id', structureId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

// POST - Add new connection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { structure_id, from_member_id, to_member_id, connection_type, color, waypoints } = body;

    if (!structure_id || !from_member_id || !to_member_id) {
      return NextResponse.json(
        { error: 'structure_id, from_member_id, and to_member_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await (supabaseAdmin
      .from('org_connections') as any)
      .insert({
        structure_id,
        from_member_id,
        to_member_id,
        connection_type: connection_type || 'solid',
        color: color || '#000000',
        waypoints: waypoints || [],
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Connection already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

// PATCH - Update connection (mainly for waypoints)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, waypoints, connection_type, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (waypoints !== undefined) updates.waypoints = waypoints;
    if (connection_type) updates.connection_type = connection_type;
    if (color) updates.color = color;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await (supabaseAdmin
      .from('org_connections') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json(
      { error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}

// DELETE - Remove connection
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get('id');
    const fromMemberId = searchParams.get('from_member_id');
    const toMemberId = searchParams.get('to_member_id');

    let query = (supabaseAdmin.from('org_connections') as any).delete();

    if (connectionId) {
      query = query.eq('id', connectionId);
    } else if (fromMemberId && toMemberId) {
      query = query.eq('from_member_id', fromMemberId).eq('to_member_id', toMemberId);
    } else {
      return NextResponse.json(
        { error: 'Either id or both from_member_id and to_member_id are required' },
        { status: 400 }
      );
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}
