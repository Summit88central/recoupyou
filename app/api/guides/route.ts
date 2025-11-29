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

    if (!title || !description || !price || !pdf) {
      return NextResponse.json({ error: 'Missing required fields (title, description, price, pdf)' }, { status: 400 });
    }

    // Validate PDF type before upload (allow .pdf even if MIME is missing)
    const isPdfMime = pdf.type ? pdf.type === 'application/pdf' : false;
    const hasPdfExt = typeof (pdf as any).name === 'string' && (pdf as any).name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !hasPdfExt) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a .pdf file.' }, { status: 400 });
    }

    // Handle PDF upload (required)
    const pdfFileName = `guide-${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
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

    // Create guide record
    const guideData = {
      title,
      description,
      price,
      file_path: pdfFileName,
      discount: 0
    };

    const { data: guide, error } = await supabase
      .from('guides')
      .insert([guideData])
      .select()
      .single();

    if (error) {
      console.error('Error creating guide:', error);
      return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
    }

    return NextResponse.json({ guide }, { status: 201 });
  } catch (error) {
    console.error('Error in guides POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
