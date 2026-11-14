const nodemailer = require('nodemailer');

const configured = () => (
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT
);

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

exports.sendOrderConfirmation = async order => {
  if (!configured()) return { sent: false, reason: 'SMTP is not configured' };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    ...(process.env.SMTP_USER ? {
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' },
    } : {}),
  });
  const currency = value => `${Number(value).toFixed(2)} EGP`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const rows = order.items.map(line => {
    const lineTotal = line.price * line.quantity;
    return `<tr>
      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#172033;">${escapeHtml(line.name)}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;text-align:center;color:#475569;">${line.quantity}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#172033;">${currency(lineTotal)}</td>
    </tr>`;
  }).join('');
  const textRows = order.items.map(line =>
    `${line.name} x ${line.quantity} - ${currency(line.price * line.quantity)}`,
  ).join('\n');
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: order.customer.email,
    subject: `Order invoice #${order._id}`,
    text: `MY SHOP - ORDER INVOICE

Order: #${order._id}
Date: ${orderDate}
Customer: ${order.customer.name}
Phone: ${order.customer.phone}

${textRows}

TOTAL: ${currency(order.totalPrice)}
Status: Opened
We will contact you by phone to confirm and arrange delivery.`,
    html: `<!doctype html>
<html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033;">
  <div style="padding:32px 12px;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.10);">
      <div style="padding:30px 32px;background:#111827;color:#ffffff;">
        <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#a7f3d0;">My Shop</div>
        <div style="margin-top:8px;font-size:28px;font-weight:700;">Order invoice</div>
        <div style="margin-top:7px;color:#cbd5e1;">Thank you for shopping with us, ${escapeHtml(order.customer.name)}.</div>
      </div>
      <div style="padding:26px 32px;">
        <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:26px;">
          <tr>
            <td style="color:#64748b;font-size:13px;">ORDER NUMBER<br><strong style="display:inline-block;margin-top:5px;color:#172033;font-size:15px;">#${escapeHtml(order._id)}</strong></td>
            <td style="text-align:right;color:#64748b;font-size:13px;">DATE<br><strong style="display:inline-block;margin-top:5px;color:#172033;font-size:15px;">${escapeHtml(orderDate)}</strong></td>
          </tr>
        </table>
        <div style="padding:16px;background:#f8fafc;border-radius:12px;margin-bottom:24px;">
          <div style="font-size:12px;letter-spacing:1px;color:#64748b;text-transform:uppercase;">Customer details</div>
          <div style="margin-top:8px;font-size:14px;line-height:1.7;"><strong>${escapeHtml(order.customer.name)}</strong><br>${escapeHtml(order.customer.phone)}<br>${escapeHtml(order.customer.email)}</div>
        </div>
        <table width="100%" style="border-collapse:collapse;font-size:14px;">
          <thead><tr style="background:#f8fafc;color:#64748b;font-size:12px;text-transform:uppercase;">
            <th style="padding:12px 16px;text-align:left;">Item</th><th style="padding:12px 16px;text-align:center;">Qty</th><th style="padding:12px 16px;text-align:right;">Amount</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:22px;padding-top:18px;border-top:2px solid #111827;text-align:right;">
          <span style="color:#64748b;font-size:14px;">Total</span>
          <strong style="display:block;margin-top:5px;font-size:25px;color:#059669;">${currency(order.totalPrice)}</strong>
        </div>
        <div style="margin-top:24px;padding:14px 16px;background:#ecfdf5;border-radius:10px;color:#166534;font-size:14px;">
          <strong>Order status: Opened</strong><br>We will contact you by phone to confirm and arrange delivery.
        </div>
      </div>
      <div style="padding:18px 32px;background:#f8fafc;text-align:center;color:#64748b;font-size:12px;">This is an automatic confirmation from My Shop.</div>
    </div>
  </div>
</body></html>`,
  });
  return { sent: true };
};
