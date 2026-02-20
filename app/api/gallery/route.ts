import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

// GET - Fetch all active gallery photos (public)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery_photos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery photos' },
      { status: 500 }
    );
  }
}

// POST - Add new photo (admin only)
export async function POST(request: NextRequest) {
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
      title,
      description,
      image_url,
      image_path,
      thumbnail_url,
      alt_text,
      display_order = 0,
      is_featured = false,
    } = body;

    if (!image_url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Insert new photo
    const { data, error } = await supabaseAdmin
      .from('gallery_photos')
      .insert({
        title,
        description,
        image_url,
        image_path,
        thumbnail_url,
        alt_text,
        display_order,
        is_featured,
        is_active: true,
        uploaded_by: adminSession.value,
      } as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Photo added successfully' 
    });
  } catch (error) {
    console.error('Error adding photo:', error);
    return NextResponse.json(
      { error: 'Failed to add photo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete photo (admin only)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Soft delete (set is_active to false)
    const { error } = await supabaseAdmin
      .from('gallery_photos')
      // @ts-expect-error - Supabase type issue with update
      .update({ is_active: false } as any)
      .eq('id', photoId);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Photo deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
