import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

// GET - Fetch active about contents (public)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('about_contents')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching about contents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about contents' },
      { status: 500 }
    );
  }
}

// PUT - Update about contents (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      ultraThinTitle,
      ultraThinDescription,
      ultraThinContent,
      thinTitle,
      thinDescription,
      thinContent,
      regularTitle,
      regularDescription,
      regularContent,
    } = body;

    // Update all three cards
    const updates = [
      {
        card_type: 'ultra_thin',
        title: ultraThinTitle,
        description: ultraThinDescription,
        content: ultraThinContent,
      },
      {
        card_type: 'thin',
        title: thinTitle,
        description: thinDescription,
        content: thinContent,
      },
      {
        card_type: 'regular',
        title: regularTitle,
        description: regularDescription,
        content: regularContent,
      },
    ];

    const promises = updates.map(async (update) => {
      const { error } = await supabaseAdmin
        .from('about_contents')
        // @ts-expect-error - Supabase type issue with update
        .update({
          ...update,
          updated_by: adminSession.value,
        } as any)
        .eq('card_type', update.card_type)
        .eq('is_active', true);

      if (error) throw error;
    });

    await Promise.all(promises);

    // Fetch updated data
    const { data, error } = await supabaseAdmin
      .from('about_contents')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'About contents updated successfully' 
    });
  } catch (error) {
    console.error('Error updating about contents:', error);
    return NextResponse.json(
      { error: 'Failed to update about contents' },
      { status: 500 }
    );
  }
}
