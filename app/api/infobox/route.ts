import { NextRequest, NextResponse } from 'next/server';
import { getActiveInfoboxStats, updateInfoboxStats } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

// GET - Fetch active infobox stats (public)
export async function GET() {
  try {
    const data = await getActiveInfoboxStats();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching infobox stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch infobox stats' },
      { status: 500 }
    );
  }
}

// PUT - Update infobox stats (admin only)
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
      luas_wilayah,
      kartu_keluarga,
      total_penduduk,
      rt_rw,
      fasilitas_umum,
      fasilitas_umum_detail,
      organisasi_aktif,
      organisasi_aktif_detail,
    } = body;

    // Update data
    const data = await updateInfoboxStats({
      luas_wilayah,
      kartu_keluarga,
      total_penduduk,
      rt_rw,
      fasilitas_umum,
      fasilitas_umum_detail,
      organisasi_aktif,
      organisasi_aktif_detail,
      updated_by: adminSession.value,
    });

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Infobox stats updated successfully' 
    });
  } catch (error) {
    console.error('Error updating infobox stats:', error);
    return NextResponse.json(
      { error: 'Failed to update infobox stats' },
      { status: 500 }
    );
  }
}
