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
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid updates format' },
        { status: 400 }
      );
    }

    // Update all cards based on updates array
    const promises = updates.map(async (update: any) => {
      const { error } = await supabaseAdmin
        .from('about_contents')
        // @ts-expect-error - Supabase type issue with update
        .update({
          title: update.title,
          description: update.description,
          content: update.content,
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
