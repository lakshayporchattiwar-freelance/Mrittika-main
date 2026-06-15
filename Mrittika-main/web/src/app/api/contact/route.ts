import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, phone, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: 'Name, email, and message are required' },
      { status: 400 }
    );
  }

  if (!email.includes('@')) {
    return NextResponse.json({ success: false, error: 'Please enter a valid email' }, { status: 400 });
  }

  if (message.trim().length < 10) {
    return NextResponse.json({ success: false, error: 'Message must be at least 10 characters' }, { status: 400 });
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Georgia,serif;background:#faf8f5;margin:0;padding:20px;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
        <div style="background:#8B4513;padding:24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:400;letter-spacing:2px;">New Contact Message</h1>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:6px 0;color:#6b5344;font-size:13px;width:80px;">Name</td>
              <td style="padding:6px 0;color:#3d2b1f;font-weight:500;">${name}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b5344;font-size:13px;">Email</td>
              <td style="padding:6px 0;color:#3d2b1f;font-weight:500;">${email}</td>
            </tr>
            ${phone ? `<tr>
              <td style="padding:6px 0;color:#6b5344;font-size:13px;">Phone</td>
              <td style="padding:6px 0;color:#3d2b1f;font-weight:500;">${phone}</td>
            </tr>` : ''}
          </table>
          <div style="border-top:1px solid #f0ebe4;padding-top:16px;">
            <p style="margin:0 0 8px;color:#6b5344;font-size:13px;">MESSAGE</p>
            <p style="margin:0;color:#3d2b1f;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
        </div>
        <div style="background:#faf8f5;padding:12px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#a08070;">Sent from mrittikanaturals.co.in contact form</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'Mrittika Contact Form <onboarding@resend.dev>',
      to: 'mrittikaskinrituals@gmail.com',
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: emailHtml,
    });

    console.log('[CONTACT] Message sent from:', email);
    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (err: any) {
    console.error('[CONTACT] Failed to send email:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try WhatsApp instead.' },
      { status: 500 }
    );
  }
}
