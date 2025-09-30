import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/nodejs';

// EmailJS configuration for server-side usage
// Note: EmailJS init is not needed for server-side, keys are passed directly to send()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, items, paymentReference } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !items || !paymentReference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch guide details and file paths for all items
    const guideDetails = [];
    const bundleDetails = [];

    for (const item of items) {
      if (item.type === 'guide') {
        const { data: guide, error } = await supabase
          .from('guides')
          .select('*')
          .eq('id', item.id)
          .single();

        if (error) {
          console.error('Error fetching guide:', error);
          continue;
        }

        guideDetails.push({
          ...guide,
          quantity: item.quantity
        });
      } else if (item.type === 'bundle') {
        // Fetch bundle with its guides using the new junction table
        const { data: bundle, error: bundleError } = await supabase
          .from('bundles')
          .select('*')
          .eq('id', item.id)
          .single();

        if (bundleError) {
          console.error('Error fetching bundle:', bundleError);
          continue;
        }

        // Fetch guides for this bundle from the junction table
        const { data: bundleGuides, error: guidesError } = await supabase
          .from('bundle_guides')
          .select(`
            guides (
              id,
              title,
              description,
              price,
              file_path
            )
          `)
          .eq('bundle_id', item.id);

        if (guidesError) {
          console.error('Error fetching bundle guides:', guidesError);
          continue;
        }

        // Extract guides from the junction table result
        const guides = bundleGuides.map(bg => bg.guides).filter(Boolean);

        bundleDetails.push({
          ...bundle,
          quantity: item.quantity,
          guides: guides
        });
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.item.price * item.quantity), 0);
    
    // Format price in ZAR
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
      }).format(price);
    };

    // Prepare guides data for template
    const guidesData = guideDetails.map(guide => ({
      title: guide.title,
      description: guide.description || 'No description available',
      quantity: guide.quantity,
      download_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${guide.id}`
    }));

    // Prepare bundles data for template
    const bundlesData = bundleDetails.map(bundle => ({
      name: bundle.name,
      quantity: bundle.quantity,
      guide_count: bundle.guides.length,
      guides: bundle.guides.map((guide: any) => ({
        title: guide.title,
        description: guide.description || 'No description available',
        download_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${guide.id}`
      }))
    }));

    // Determine which template to use based on purchase type
    const isBundle = bundleDetails.length > 0;
    const isSingleGuide = guideDetails.length > 0 && bundleDetails.length === 0;
    
    // Template IDs
    const BUNDLE_TEMPLATE = 'template_zygixmg'; // Bundle template as requested
    const SINGLE_GUIDE_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_TEMPLATE!; // Single guide template
    
    const templateId = isBundle ? BUNDLE_TEMPLATE : SINGLE_GUIDE_TEMPLATE;
    
    // Debug: Log EmailJS configuration
    console.log('🔧 EmailJS Configuration Debug:');
    console.log('Service ID:', process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_SERVICE);
    console.log('Template ID:', templateId);
    console.log('Purchase Type:', isBundle ? 'Bundle' : 'Single Guide');
    console.log('Public Key:', process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_PUBLIC_KEY ? 'Present' : 'Missing');
    console.log('Private Key:', process.env.EMAILJS_PURCHASE_PRIVATE_KEY ? 'Present' : 'Missing');

    let emailParams;

    if (isBundle) {
      // Bundle email parameters (flexible for any number of guides)
      const bundle = bundleDetails[0]; // Assuming one bundle per purchase
      emailParams = {
        to_email: email,
        customer_name: `${firstName} ${lastName}`,
        bundle_name: bundle.name,
        bundle_quantity: bundle.quantity,
        guide_count: bundle.guides.length,
        guides: bundle.guides.map((guide: any) => ({
          title: guide.title,
          description: guide.description || 'No description available',
          download_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${guide.id}`
        })),
        payment_reference: paymentReference,
        total_amount: formatPrice(totalAmount),
        from_name: 'RecoupYou Fitness',
        subject: 'Your Fitness Bundle - Download Links'
      };
    } else {
      // Single guide email parameters (simplified for single guide template)
      const guide = guideDetails[0]; // Assuming one guide per purchase
      emailParams = {
        to_email: email,
        customer_name: `${firstName} ${lastName}`,
        guide_title: guide.title,
        guide_description: guide.description || 'No description available',
        guide_quantity: guide.quantity,
        guide_download_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${guide.id}`,
        payment_reference: paymentReference,
        total_amount: formatPrice(totalAmount),
        from_name: 'RecoupYou Fitness',
        subject: 'Your Fitness Guide - Download Link'
      };
    }

    console.log('📧 Attempting to send email with EmailJS...');
    console.log('Email params:', JSON.stringify(emailParams, null, 2));

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_SERVICE!, // Purchase email service ID
      templateId, // Use appropriate template based on purchase type
      emailParams,
      {
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PURCHASE_PUBLIC_KEY!,
        privateKey: process.env.EMAILJS_PURCHASE_PRIVATE_KEY!,
      }
    );

    console.log('✅ Email sent successfully!');

    return NextResponse.json({ 
      message: 'Guides sent successfully',
      guidesCount: guideDetails.length,
      bundlesCount: bundleDetails.length
    });

  } catch (error) {
    console.error('Error sending guides:', error);
    return NextResponse.json(
      { error: 'Failed to send guides' },
      { status: 500 }
    );
  }
}