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

    // Check if file_path exists
    if (!guide.file_path) {
      console.error('Guide has no file path:', guide.id);
      return NextResponse.json(
        { error: 'Guide file path is missing' },
        { status: 404 }
      );
    }

    // If email is provided, verify purchase
    if (email) {
      // First check direct purchase
      const { data: directPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('email', email)
        .eq('guide_id', guideId)
        .single();

      // If not found, check bundle purchases
      let hasAccess = !!directPurchase;
      
      if (!hasAccess) {
        // Get all bundles purchased by this email
        const { data: bundlesPurchased } = await supabase
          .from('purchases')
          .select('bundle_id')
          .eq('email', email)
          .eq('item_type', 'bundle');
          
        if (bundlesPurchased && bundlesPurchased.length > 0) {
          const bundleIds = bundlesPurchased.map(p => p.bundle_id).filter(Boolean);
          
          // Check if any of these bundles contain the guide
          // We need to check bundle_guides table
          const { data: bundleGuides } = await supabase
            .from('bundle_guides')
            .select('id')
            .in('bundle_id', bundleIds)
            .eq('guide_id', guideId)
            .limit(1);
            
          if (bundleGuides && bundleGuides.length > 0) {
            hasAccess = true;
          }
        }
      }

      if (!hasAccess) {
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

    // Sanitize filename
    const safeTitle = guide.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim();
    const filename = `${safeTitle || 'guide'}.pdf`;

    // Set appropriate headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Length', buffer.byteLength.toString());

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error in download API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}