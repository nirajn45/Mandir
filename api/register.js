import nodemailer from 'nodemailer';

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ message: 'Method not allowed' });

  const { teamName, captainName, mobile, players, website } = request.body || {};
  if (website) return response.status(400).json({ message: 'Invalid submission' });
  if (![teamName, captainName, mobile, players].every(value => String(value || '').trim())) return response.status(400).json({ message: 'सभी विवरण भरना आवश्यक है।' });
  if (!/^[-+()\d\s]{8,18}$/.test(String(mobile)) || Number(players) < 1 || Number(players) > 100) return response.status(400).json({ message: 'कृपया सही विवरण भरें।' });

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('Missing SMTP_USER or SMTP_PASSWORD environment variable');
    return response.status(500).json({ message: 'मेल सेवा उपलब्ध नहीं है।' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    const details = [['Team Name', teamName], ['Captain Name', captainName], ['Mobile Number', mobile], ['Number of Players', players]];
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'guptaniraj915@gmail.com',
      subject: 'NEW MATKA PHOD REGISTRATION',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#17233b"><h1 style="background:#13274b;color:#e6b95a;padding:24px">श्री कृष्ण जन्माष्टमी महोत्सव</h1><h2>नई मटका फोड़ टीम पंजीकरण</h2><table style="border-collapse:collapse;width:100%">${details.map(([label, value]) => `<tr><td style="padding:12px;border-bottom:1px solid #ddd;font-weight:bold">${label}</td><td style="padding:12px;border-bottom:1px solid #ddd">${escapeHtml(value)}</td></tr>`).join('')}</table><p>Submitted At: ${new Date().toLocaleString('en-IN')}</p><p>बाल नवयुवक संघ</p></div>`
    });
    return response.status(200).json({ ok: true, message: 'पंजीकरण सफल रहा।' });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'मेल भेजने में समस्या हुई।' });
  }
}
