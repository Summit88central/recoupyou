import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // First get all bundles
    const { data: bundles, error: bundlesError } = await supabase
      .from('bundles')
      .select('*')
      .order('created_at', { ascending: false });

    if (bundlesError) {
      console.error('Error fetching bundles:', bundlesError);
      return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
    }

    // Then get all bundle-guide relationships with guide details
    const { data: bundleGuides, error: guidesError } = await supabase
      .from('bundle_guides')
      .select(`
        bundle_id,
        guide:guide_id(id, title, description, price, file_path, discount)
      `);

    if (guidesError) {
      console.error('Error fetching bundle guides:', guidesError);
      return NextResponse.json({ error: 'Failed to fetch bundle guides' }, { status: 500 });
    }

    // Transform the data to include guides array for each bundle
    const transformedBundles = bundles?.map(bundle => {
      const bundleGuideRelations = bundleGuides?.filter(bg => bg.bundle_id === bundle.id) || [];
      const guides = bundleGuideRelations.map(bg => bg.guide).filter(Boolean);
      
      return {
        ...bundle,
        guides
      };
    });

    return NextResponse.json({ bundles: transformedBundles });
  } catch (error) {
    console.error('Error in bundles API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, price, guide_ids } = await request.json();

    // Validate required fields
    if (!name || !price || !guide_ids || !Array.isArray(guide_ids) || guide_ids.length === 0) {
      return NextResponse.json(
        { error: 'Name, price, and at least one guide ID are required' },
        { status: 400 }
      );
    }

    // Create the bundle first
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .insert({
        name,
        description,
        price: parseFloat(price),
      })
      .select()
      .single();

    if (bundleError) {
      console.error('Error creating bundle:', bundleError);
      return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 });
    }

    // Create bundle-guide relationships
    const bundleGuideInserts = guide_ids.map(guide_id => ({
      bundle_id: bundle.id,
      guide_id: guide_id
    }));

    const { error: relationError } = await supabase
      .from('bundle_guides')
      .insert(bundleGuideInserts);

    if (relationError) {
      console.error('Error creating bundle-guide relationships:', relationError);
      // Clean up the bundle if relationship creation fails
      await supabase.from('bundles').delete().eq('id', bundle.id);
      return NextResponse.json({ error: 'Failed to create bundle-guide relationships' }, { status: 500 });
    }

    return NextResponse.json({ bundle }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/bundles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}