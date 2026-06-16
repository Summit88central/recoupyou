import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "recoupyou@summit88.co.za";
const TO_EMAIL = process.env.NEXT_PUBLIC_COACH_EMAIL || "recoupyou@gmail.com";

// Base HTML CSS Styles
const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
  .header { background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #fc9dca; }
  .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
  .logo span { color: #fc9dca; }
  .content { padding: 35px 25px; }
  .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
  .section-title { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 30px; margin-bottom: 12px; border-left: 3px solid #fc9dca; padding-left: 10px; }
  .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  .table td { padding: 12px 10px; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .label { font-weight: 600; color: #64748b; width: 40%; }
  .value { color: #0f172a; }
  .badge { display: inline-block; background-color: #fdf2f8; color: #db2777; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; text-transform: uppercase; }
  .footer { background-color: #f8fafc; padding: 20px 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
`;


export async function POST(request: NextRequest) {
  try {
    const { type, formData } = await request.json();

    if (!type || !formData) {
      return NextResponse.json(
        { error: "Missing type or formData" },
        { status: 400 }
      );
    }

    let subject = "";
    let htmlContent = "";

    if (type === "membership") {
      subject = `New Membership Application: ${formData.fullName}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">RECOUP<span>YOU</span></h1>
            </div>
            <div class="content">
              <h2 class="title">New Membership Application</h2>
              
              <div class="section-title">Applicant Info</div>
              <table class="table">
                <tr>
                  <td class="label">Full Name:</td>
                  <td class="value"><strong>${formData.fullName || "N/A"}</strong></td>
                </tr>
                <tr>
                  <td class="label">Email:</td>
                  <td class="value">${formData.email || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Phone:</td>
                  <td class="value">${formData.phone || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Date of Birth:</td>
                  <td class="value">${formData.dateOfBirth || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Address:</td>
                  <td class="value">${formData.address || "N/A"}</td>
                </tr>
              </table>

              <div class="section-title">Emergency Contact</div>
              <table class="table">
                <tr>
                  <td class="label">Contact Name:</td>
                  <td class="value">${formData.emergencyName || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Phone:</td>
                  <td class="value">${formData.emergencyPhone || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Relationship:</td>
                  <td class="value">${formData.emergencyRelationship || "N/A"}</td>
                </tr>
              </table>

              <div class="section-title">Membership & Medical Details</div>
              <table class="table">
                <tr>
                  <td class="label">Membership Plan:</td>
                  <td class="value"><span class="badge">${formData.membershipPlan || "N/A"}</span></td>
                </tr>
                <tr>
                  <td class="label">Start Date:</td>
                  <td class="value">${formData.startDate || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Additional Services:</td>
                  <td class="value">${formData.additionalServices?.join(", ") || "None"}</td>
                </tr>
                <tr>
                  <td class="label">Medical Conditions:</td>
                  <td class="value">${formData.medicalConditions || "None specified"}</td>
                </tr>
                <tr>
                  <td class="label">How they heard:</td>
                  <td class="value">${formData.hearAbout || "N/A"}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              This application was submitted via the RecoupYou Website.
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "online-coaching") {
      subject = `New Online Coaching Application: ${formData.fullName}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">RECOUP<span>YOU</span></h1>
            </div>
            <div class="content">
              <h2 class="title">Online Coaching Application</h2>
              
              <div class="section-title">Coaching Applicant Details</div>
              <table class="table">
                <tr>
                  <td class="label">Full Name:</td>
                  <td class="value"><strong>${formData.fullName || "N/A"}</strong></td>
                </tr>
                <tr>
                  <td class="label">Email:</td>
                  <td class="value">${formData.email || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">WhatsApp:</td>
                  <td class="value">${formData.whatsapp || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Instagram:</td>
                  <td class="value">${formData.instagram || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Age:</td>
                  <td class="value">${formData.age || "N/A"}</td>
                </tr>
              </table>

              <div class="section-title">Fitness & Package Details</div>
              <table class="table">
                <tr>
                  <td class="label">Coaching Package:</td>
                  <td class="value"><span class="badge">${formData.package || "N/A"}</span></td>
                </tr>
                <tr>
                  <td class="label">Desired Start Date:</td>
                  <td class="value">${formData.startDate || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Fitness Level:</td>
                  <td class="value">${formData.fitnessLevel || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Gym Access:</td>
                  <td class="value">${formData.gymAccess || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Dietary Restrictions:</td>
                  <td class="value">${formData.dietaryRestrictions || "None"}</td>
                </tr>
                <tr>
                  <td class="label">Fitness Goals:</td>
                  <td class="value">${formData.goals || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Additional Notes:</td>
                  <td class="value">${formData.additionalInfo || "None"}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              This application was submitted via the RecoupYou Website.
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "personal-training") {
      subject = `New Personal Training Booking: ${formData.fullName}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">RECOUP<span>YOU</span></h1>
            </div>
            <div class="content">
              <h2 class="title">Personal Training Booking</h2>
              
              <div class="section-title">Client Details</div>
              <table class="table">
                <tr>
                  <td class="label">Full Name:</td>
                  <td class="value"><strong>${formData.fullName || "N/A"}</strong></td>
                </tr>
                <tr>
                  <td class="label">WhatsApp/Phone:</td>
                  <td class="value">${formData.whatsapp || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Age:</td>
                  <td class="value">${formData.age || "N/A"}</td>
                </tr>
              </table>

              <div class="section-title">Training Information</div>
              <table class="table">
                <tr>
                  <td class="label">PT Package:</td>
                  <td class="value"><span class="badge">${formData.package || "N/A"}</span></td>
                </tr>
                <tr>
                  <td class="label">Desired Start Date:</td>
                  <td class="value">${formData.startDate || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Fitness Goals:</td>
                  <td class="value">${formData.goals || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Additional Notes:</td>
                  <td class="value">${formData.additionalInfo || "None"}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              This booking request was submitted via the RecoupYou Website.
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return NextResponse.json(
        { error: "Unknown type: " + type },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API Error details:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error in send-email API:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
