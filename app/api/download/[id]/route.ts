import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = params.id;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Fetch guide details
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('*')
      .eq('id', guideId)
      .single();

    if (guideError || !guide) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    // If email is provided, verify purchase
    if (email) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('email', email)
        .or(`guide_id.eq.${guideId},bundles.guide1_id.eq.${guideId},bundles.guide2_id.eq.${guideId}`)
        .single();

      if (purchaseError || !purchase) {
        return NextResponse.json(
          { error: 'Purchase not found or access denied' },
          { status: 403 }
        );
      }
    }

    // Get file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('guides')
      .download(guide.file_path);

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json(
        { error: 'File not found or download failed' },
        { status: 404 }
      );
    }

    // Convert blob to buffer
    const buffer = await fileData.arrayBuffer();

    // Set appropriate headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${guide.title}.pdf"`);
    headers.set('Content-Length', buffer.byteLength.toString());

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error in download API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}