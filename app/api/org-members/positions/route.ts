import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return Boolean(session?.value);
}

interface PositionUpdate {
  id: string;
  custom_x: number;
  custom_y: number;
}

// PATCH - Update multiple org member positions in batch
export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { positions, use_custom_layout, structure_id } = body as {
      positions: PositionUpdate[];
      use_custom_layout?: boolean;
      structure_id?: string;
    };

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'positions array is required' },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin as any;

    // If structure_id is provided and use_custom_layout is true,
    // update ALL members in the structure to use custom layout
    if (structure_id && use_custom_layout) {
      await admin
        .from('org_members')
        .update({ use_custom_layout: true })
        .eq('structure_id', structure_id);
    }

    // Update positions in batch
    const updatePromises = positions.map((pos) =>
      admin
        .from('org_members')
        .update({
          custom_x: pos.custom_x,
          custom_y: pos.custom_y,
          use_custom_layout: use_custom_layout !== undefined ? use_custom_layout : true,
        })
        .eq('id', pos.id)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error('Position update errors:', errors);
      return NextResponse.json(
        { error: 'Some positions failed to update', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      updated: positions.length 
    });
  } catch (error) {
    console.error('Failed to update positions:', error);
    return NextResponse.json(
      { error: 'Failed to update positions' },
      { status: 500 }
    );
  }
}

// POST - Reset to auto layout (clear custom positions)
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { structure_id } = body;

    if (!structure_id) {
      return NextResponse.json(
        { error: 'structure_id is required' },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin as any;
    const { error } = await admin
      .from('org_members')
      .update({
        custom_x: null,
        custom_y: null,
        use_custom_layout: false,
      })
      .eq('structure_id', structure_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reset layout:', error);
    return NextResponse.json(
      { error: 'Failed to reset layout' },
      { status: 500 }
    );
  }
}
