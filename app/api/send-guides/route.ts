import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'recoupyou@summit88.co.za';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, items, paymentReference, totalAmount: providedTotalAmount, promoCode } = body;

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

    // Calculate total amount (prefer client-provided discounted total)
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + (item.item.price * item.quantity), 0);
    const totalAmount = typeof providedTotalAmount === 'number' ? providedTotalAmount : calculatedTotal;
    
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
    
    let subject = '';
    let htmlContent = '';

    if (isBundle) {
      const bundle = bundleDetails[0]; // Assuming one bundle per purchase
      subject = 'Your Fitness Bundle - Download Links';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
            .header { background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #fc9dca; }
            .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
            .logo span { color: #fc9dca; }
            .content { padding: 35px 25px; }
            .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 15px; }
            .text { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 25px; }
            .guide-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 15px; border-left: 4px solid #fc9dca; }
            .guide-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
            .guide-desc { font-size: 13px; color: #64748b; margin: 0 0 15px 0; line-height: 1.4; }
            .btn-sm { background-color: #fc9dca; color: #ffffff !important; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block; }
            .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 25px; }
            .details-title { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; margin-bottom: 10px; }
            .details-text { font-size: 13px; color: #64748b; margin: 0 0 8px 0; }
            .footer { background-color: #f8fafc; padding: 20px 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">RECOUP<span>YOU</span></h1>
            </div>
            <div class="content">
              <h2 class="title">Your Fitness Bundle is Ready!</h2>
              <p class="text">Hi ${firstName} ${lastName},</p>
              <p class="text">Thank you for purchasing the <strong>${bundle.name}</strong> from RecoupYou Fitness! Your download links are ready below:</p>
              
              <div style="margin: 25px 0;">
                ${bundle.guides.map((guide: any) => `
                  <div class="guide-card">
                    <h4 class="guide-title">${guide.title}</h4>
                    <p class="guide-desc">${guide.description || 'No description available'}</p>
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${guide.id}" class="btn-sm">Download Guide</a>
                  </div>
                `).join('')}
              </div>
              
              <div class="details-box">
                <div class="details-title">Order Details</div>
                <p class="details-text"><strong>Bundle:</strong> ${bundle.name}</p>
                <p class="details-text"><strong>Payment Reference:</strong> ${paymentReference}</p>
                <p class="details-text"><strong>Amount Paid:</strong> ${formatPrice(totalAmount)}</p>
              </div>
            </div>
            <div class="footer">
              If you have any questions, reply directly to this email.
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      const guide = guideDetails[0]; // Assuming one guide per purchase
      subject = 'Your Fitness Guide - Download Link';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
            .header { background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #fc9dca; }
            .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
            .logo span { color: #fc9dca; }
            .content { padding: 35px 25px; }
            .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 15px; }
            .text { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 25px; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { background-color: #fc9dca; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; border-bottom: 3px solid #f472b6; display: inline-block; transition: all 0.2s ease; }
            .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 25px; }
            .details-title { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; margin-bottom: 10px; }
            .details-text { font-size: 13px; color: #64748b; margin: 0 0 8px 0; }
            .footer { background-color: #f8fafc; padding: 20px 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">RECOUP<span>YOU</span></h1>
            </div>
            <div class="content">
              <h2 class="title">Your Fitness Guide is Ready!</h2>
              <p class="text">Hi ${firstName} ${lastName},</p>
              <p class="text">Thank you for purchasing <strong>${guide.title}</strong> from RecoupYou Fitness! Click the button below to download your copy and start your journey.</p>
              
              <div class="btn-container">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${guide.id}" class="btn">Download Your Guide</a>
              </div>
              
              <div class="details-box">
                <div class="details-title">Order Details</div>
                <p class="details-text"><strong>Item:</strong> ${guide.title}</p>
                <p class="details-text"><strong>Description:</strong> ${guide.description || 'No description available'}</p>
                <p class="details-text"><strong>Payment Reference:</strong> ${paymentReference}</p>
                <p class="details-text"><strong>Amount Paid:</strong> ${formatPrice(totalAmount)}</p>
              </div>
            </div>
            <div class="footer">
              If you have any questions, reply directly to this email.
            </div>
          </div>
        </body>
        </html>
      `;
    }

    console.log('📧 Attempting to send email with Resend...');
    const { data, error: resendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    if (resendError) {
      console.error('Resend API Error:', resendError);
      throw new Error(resendError.message);
    }

    console.log('✅ Email sent successfully via Resend!');

    return NextResponse.json({ 
      message: 'Guides sent successfully',
      guidesCount: guideDetails.length,
      bundlesCount: bundleDetails.length
    });

  } catch (error: any) {
    console.error('Error sending guides:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send guides' },
      { status: 500 }
    );
  }
}
