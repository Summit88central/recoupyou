import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      payment_reference, 
      amount, 
      item_type, 
      guide_id, 
      bundle_id 
    } = body;

    // Validate required fields
    if (!email || !payment_reference || !amount || !item_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate item_type and corresponding ID
    if (item_type === 'guide' && !guide_id) {
      return NextResponse.json(
        { error: 'guide_id is required for guide purchases' },
        { status: 400 }
      );
    }

    if (item_type === 'bundle' && !bundle_id) {
      return NextResponse.json(
        { error: 'bundle_id is required for bundle purchases' },
        { status: 400 }
      );
    }

    // Insert purchase record
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          email,
          payment_reference,
          amount,
          item_type,
          guide_id: item_type === 'guide' ? guide_id : null,
          bundle_id: item_type === 'bundle' ? bundle_id : null,
        }
      ])
      .select();

    if (error) {
      console.error('Error creating purchase:', error);
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ purchase: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Error in purchases API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let query = supabase
      .from('purchases')
      .select(`
        *,
        guides (
          id,
          title,
          description,
          price,
          file_path
        ),
        bundles (
          id,
          name,
          price,
          guide1_id,
          guide2_id
        )
      `)
      .order('created_at', { ascending: false });

    if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching purchases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch purchases' },
        { status: 500 }
      );
    }

    return NextResponse.json({ purchases: data });
  } catch (error) {
    console.error('Error in purchases API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}