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
    // Get the bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (bundleError) {
      console.error('Error fetching bundle:', bundleError);
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Get bundle-guide relationships with guide details
    const { data: bundleGuides, error: guidesError } = await supabase
      .from('bundle_guides')
      .select(`
        guide:guide_id(id, title, description, price, file_path, discount)
      `)
      .eq('bundle_id', params.id);

    if (guidesError) {
      console.error('Error fetching bundle guides:', guidesError);
      return NextResponse.json({ error: 'Failed to fetch bundle guides' }, { status: 500 });
    }

    // Transform the data to include guides array
    const guides = bundleGuides?.map(bg => bg.guide).filter(Boolean) || [];
    const transformedBundle = {
      ...bundle,
      guides
    };

    return NextResponse.json({ bundle: transformedBundle });
  } catch (error) {
    console.error('Error in bundle GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, price, guide_ids } = await request.json();

    // Validate required fields
    if (!name || !price || !guide_ids || !Array.isArray(guide_ids) || guide_ids.length === 0) {
      return NextResponse.json(
        { error: 'Name, price, and at least one guide ID are required' },
        { status: 400 }
      );
    }

    // Update bundle basic info
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .update({
        name,
        description,
        price: parseFloat(price),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (bundleError) {
      console.error('Error updating bundle:', bundleError);
      return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 });
    }

    // Delete existing bundle-guide relationships
    const { error: deleteError } = await supabase
      .from('bundle_guides')
      .delete()
      .eq('bundle_id', params.id);

    if (deleteError) {
      console.error('Error deleting existing bundle-guide relationships:', deleteError);
      return NextResponse.json({ error: 'Failed to update bundle guides' }, { status: 500 });
    }

    // Create new bundle-guide relationships
    const bundleGuideInserts = guide_ids.map(guide_id => ({
      bundle_id: params.id,
      guide_id: guide_id
    }));

    const { error: relationError } = await supabase
      .from('bundle_guides')
      .insert(bundleGuideInserts);

    if (relationError) {
      console.error('Error creating new bundle-guide relationships:', relationError);
      return NextResponse.json({ error: 'Failed to update bundle guides' }, { status: 500 });
    }

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error('Error in bundle update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete bundle guides relationships first
    await supabase
      .from('bundle_guides')
      .delete()
      .eq('bundle_id', params.id);

    // Delete the bundle
    const { error } = await supabase
      .from('bundles')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting bundle:', error);
      // Provide more informative error for FK violations
      const message = 'Failed to delete bundle';
      if (
        // Postgres foreign key violation
        (error as any).code === '23503' ||
        ((error as any).message && (error as any).message.toLowerCase().includes('foreign key'))
      ) {
        return NextResponse.json(
          { error: 'Cannot delete bundle because it is referenced by other records (e.g., purchases or relationships). Please remove those references first.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Bundle deleted successfully' });
  } catch (error) {
    console.error('Error in bundle delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}