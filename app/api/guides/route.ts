import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guides:', error);
      return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
    }

    return NextResponse.json({ guides });
  } catch (error) {
    console.error('Error in guides API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const pdf = formData.get('pdf') as File | null;
    const providedFilePath = formData.get('file_path') as string | null;
    const image_url = formData.get('image_url') as string | null;
    const inStockStr = formData.get('in_stock') as string | null;
    const in_stock = inStockStr ? inStockStr === 'true' : true;

    if (!title || !description || isNaN(price) || (!pdf && !providedFilePath)) {
      return NextResponse.json({ error: 'Missing required fields (title, description, valid price, and either pdf or file_path)' }, { status: 400 });
    }

    // If uploading through API, validate type in the branch below when pdf is present

    // Determine file_path: either client-provided or upload here
    let file_path: string | null = null;
    if (providedFilePath) {
      file_path = providedFilePath;
    } else if (pdf) {
      const isPdfMime = pdf.type ? pdf.type === 'application/pdf' : false;
      const hasPdfExt = typeof (pdf as any).name === 'string' && (pdf as any).name.toLowerCase().endsWith('.pdf');
      if (!isPdfMime && !hasPdfExt) {
        return NextResponse.json({ error: 'Invalid file type. Please upload a .pdf file.' }, { status: 400 });
      }

      const pdfFileName = `guide-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(pdfFileName, pdf, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        });
      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        return NextResponse.json({ error: `Failed to upload PDF: ${(uploadError as any).message || 'unknown error'}` }, { status: 500 });
      }
      file_path = pdfFileName;
    } else {
      return NextResponse.json({ error: 'No PDF uploaded or file_path provided' }, { status: 400 });
    }

    // Create guide record
    const guideData: any = {
      title,
      description,
      price,
      file_path,
      discount: 0,
      in_stock
    };
    if (image_url) guideData.image_url = image_url;

    let { data: guide, error } = await supabase
      .from('guides')
      .insert([guideData])
      .select()
      .single();

    if (error) {
      const msg = (error as any)?.message || String(error);
      console.error('Error creating guide:', error);
      // Fallback: retry without optional fields if schema not yet migrated
      if (msg.includes('in_stock') || msg.includes('column') && msg.includes('in_stock')) {
        const fallback = { ...guideData };
        delete (fallback as any).in_stock;
        const retry = await supabase.from('guides').insert([fallback]).select().single();
        if (!retry.error) {
          guide = retry.data;
        } else {
          return NextResponse.json({ error: retry.error.message || 'Failed to create guide' }, { status: 500 });
        }
      } else if (msg.includes('image_url') || msg.includes('column') && msg.includes('image_url')) {
        const fallback = { ...guideData };
        delete (fallback as any).image_url;
        const retry = await supabase.from('guides').insert([fallback]).select().single();
        if (!retry.error) {
          guide = retry.data;
        } else {
          return NextResponse.json({ error: retry.error.message || 'Failed to create guide' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: msg || 'Failed to create guide' }, { status: 500 });
      }
    }

    return NextResponse.json({ guide }, { status: 201 });
  } catch (error) {
    console.error('Error in guides POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
