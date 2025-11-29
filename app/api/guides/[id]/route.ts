import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const image = formData.get('image') as File | null;
    const pdf = formData.get('pdf') as File | null;
    const promo_code = formData.get('promo_code') as string | null;
    const discountStr = formData.get('discount') as string | null;
    const discount = discountStr ? parseFloat(discountStr) : null;

    if (!title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let image_url = null;
    let file_path = null;

    // Handle image upload if provided
    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `guide-${params.id}-image-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      image_url = publicUrl;
    }

    // Handle PDF upload or provided file_path
    const providedFilePath = formData.get('file_path') as string | null;
    if (providedFilePath) {
      file_path = providedFilePath;
    } else if (pdf) {
      const isPdfMime = pdf.type ? pdf.type === 'application/pdf' : false;
      const hasPdfExt = typeof (pdf as any).name === 'string' && (pdf as any).name.toLowerCase().endsWith('.pdf');
      if (!isPdfMime && !hasPdfExt) {
        return NextResponse.json({ error: 'Invalid file type. Please upload a .pdf file.' }, { status: 400 });
      }

      const fileName = `guide-${params.id}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(fileName, pdf, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        });
      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        return NextResponse.json({ error: `Failed to upload PDF: ${(uploadError as any).message || 'unknown error'}` }, { status: 500 });
      }
      file_path = fileName;
    }

    // Update guide
    const updateData: any = {
      title,
      description,
      price
    };

    if (promo_code !== null) {
      updateData.promo_code = promo_code || null;
    }

    if (discount !== null) {
      const clamped = Math.max(0, Math.min(100, discount));
      updateData.discount = clamped;
    }

    if (image_url) {
      updateData.image_url = image_url;
    }

    if (file_path) {
      updateData.file_path = file_path;
    }

    const { data: guide, error } = await supabase
      .from('guides')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating guide:', error);
      return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
    }

    return NextResponse.json({ guide });
  } catch (error) {
    console.error('Error in guide update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get guide details first to delete associated files
    const { data: guide, error: fetchError } = await supabase
      .from('guides')
      .select('file_path')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching guide:', fetchError);
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Parse force flag
    const force = request.nextUrl.searchParams.get('force') === 'true';

    // If forcing, remove dependent purchases first to satisfy FK constraints
    if (force) {
      const { error: purchaseDeleteError } = await supabase
        .from('purchases')
        .delete()
        .eq('guide_id', params.id);

      if (purchaseDeleteError) {
        console.error('Error deleting purchases for guide:', purchaseDeleteError);
        return NextResponse.json({ error: 'Failed to remove guide purchases' }, { status: 500 });
      }
    }

    // Remove bundle-guide relationships referencing this guide to satisfy FK constraints
    const { error: bundleGuideDeleteError } = await supabase
      .from('bundle_guides')
      .delete()
      .eq('guide_id', params.id);

    if (bundleGuideDeleteError) {
      console.error('Error deleting bundle-guide relationships for guide:', bundleGuideDeleteError);
      return NextResponse.json({ error: 'Failed to remove guide relationships' }, { status: 500 });
    }

    // Delete the guide from database
    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting guide:', error);
      // Provide more informative error for FK violations
      const message = 'Failed to delete guide';
      if (
        (error as any).code === '23503' ||
        ((error as any).message && (error as any).message.toLowerCase().includes('foreign key'))
      ) {
        return NextResponse.json(
          { error: 'Cannot delete guide because it is referenced by other records (e.g., purchases). Please remove those references first.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    // Delete associated files from storage (optional - you might want to keep them)
    if (guide.file_path) {
      await supabase.storage
        .from('guides')
        .remove([guide.file_path]);
    }

    return NextResponse.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error('Error in guide delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
