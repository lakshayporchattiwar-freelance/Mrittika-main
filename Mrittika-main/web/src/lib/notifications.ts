import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(order: any): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not set, skipping email');
    return;
  }

  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();

  const itemsHtml = order.items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #f0ebe4;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #f0ebe4;text-align:center;">${item.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #f0ebe4;text-align:right;">₹${item.price * item.qty}</td>
        </tr>`
    )
    .join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Georgia,serif;background:#faf8f5;margin:0;padding:20px;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
        <div style="background:#8B4513;padding:32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;font-weight:400;letter-spacing:2px;">Mrittika</h1>
          <p style="color:#f5dfc0;margin:8px 0 0;font-size:13px;letter-spacing:1px;">NATURAL SKINCARE</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#3d2b1f;font-size:20px;margin:0 0 8px;">Order Confirmed 🌿</h2>
          <p style="color:#6b5344;margin:0 0 24px;">Hi ${customerName}, your ritual is on its way!</p>

          <div style="background:#faf8f5;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#6b5344;font-size:13px;">ORDER ID</p>
            <p style="margin:4px 0 0;color:#3d2b1f;font-weight:600;font-family:monospace;">${order.id}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#faf8f5;">
                <th style="padding:8px;text-align:left;font-size:12px;color:#6b5344;font-weight:500;">ITEM</th>
                <th style="padding:8px;text-align:center;font-size:12px;color:#6b5344;font-weight:500;">QTY</th>
                <th style="padding:8px;text-align:right;font-size:12px;color:#6b5344;font-weight:500;">PRICE</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 8px;font-weight:600;color:#3d2b1f;">Total</td>
                <td style="padding:12px 8px;text-align:right;font-weight:600;color:#8B4513;font-size:16px;">₹${order.total}</td>
              </tr>
            </tfoot>
          </table>

          <div style="border:1px solid #f0ebe4;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b5344;font-weight:500;">DELIVERY ADDRESS</p>
            <p style="margin:0;color:#3d2b1f;line-height:1.6;">
              ${customerName}<br/>
              ${order.customer.address}<br/>
              ${order.customer.city}, ${order.customer.state} ${order.customer.pincode}<br/>
              📞 ${order.customer.phone}
            </p>
          </div>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#166534;font-size:13px;">
              ✅ <strong>Payment:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}<br/>
              🚚 <strong>Estimated Delivery:</strong> 5–7 business days<br/>
              ${order.awbNumber ? `📦 <strong>Tracking AWB:</strong> ${order.awbNumber} via ${order.courierName || 'courier'}` : '📦 Tracking details will be sent once your order is picked up'}
            </p>
          </div>

          <p style="color:#6b5344;font-size:13px;text-align:center;margin:0;">
            Questions? WhatsApp us at
            <a href="https://wa.me/916000386664" style="color:#8B4513;">6000386664</a>
          </p>
        </div>
        <div style="background:#faf8f5;padding:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a08070;">© 2026 Mrittika · Made with ❤ for Indian Skin</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'Mrittika <orders@mrittikanaturals.co.in>',
      to: order.customer.email,
      subject: `Order Confirmed — ${order.id} 🌿`,
      html: emailHtml,
    });
    console.log('[EMAIL] Confirmation sent to:', order.customer.email);
  } catch (emailError) {
    console.error('[EMAIL] Failed to send confirmation:', emailError);
  }

  try {
    await resend.emails.send({
      from: 'Mrittika Orders <orders@mrittikanaturals.co.in>',
      to: process.env.STORE_EMAIL || 'mrittikaskinrituals@gmail.com',
      subject: `🛒 New Order — ${order.id} — ₹${order.total}`,
      html: `<p>New order received!</p><p><strong>Order ID:</strong> ${order.id}</p><p><strong>Customer:</strong> ${customerName} (${order.customer.email})</p><p><strong>Phone:</strong> ${order.customer.phone}</p><p><strong>Total:</strong> ₹${order.total}</p><p><strong>Payment:</strong> ${order.paymentMethod}</p><p><a href="https://app.shiprocket.in">View in Shiprocket</a> | <a href="https://supabase.com">View in Supabase</a></p>`,
    });
    console.log('[EMAIL] Store notification sent');
  } catch (storeEmailError) {
    console.error('[EMAIL] Store notification failed:', storeEmailError);
  }
}

export async function sendOrderCancelledEmail(order: any): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();
  const refundNote = order.paymentMethod === 'Prepaid'
    ? `<p style="color:#16BF78;">A refund of ₹${order.total} will be credited to your account within 5–7 business days.</p>`
    : '';

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="font-family:Georgia,serif;background:#faf8f5;margin:0;padding:20px;">
    <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
      <div style="background:#8B4513;padding:32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Mrittika</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#3d2b1f;font-size:20px;margin:0 0 8px;">Order Cancelled</h2>
        <p style="color:#6b5344;margin:0 0 16px;">Your order ${order.id} has been cancelled as requested.</p>
        ${refundNote}
        <p style="color:#6b5344;font-size:13px;">Reason: ${order.cancellation?.reason ?? 'N/A'}</p>
        <p style="color:#6b5344;font-size:13px;margin-top:16px;">Need help? WhatsApp us at <a href="https://wa.me/916000386664" style="color:#8B4513;">6000386664</a></p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    await resend.emails.send({
      from: 'Mrittika <orders@mrittikanaturals.co.in>',
      to: order.customer.email,
      subject: `Order Cancelled — ${order.id}`,
      html,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send cancellation email:', err);
  }
}
