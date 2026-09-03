import express from 'express';
import nodemailer from 'nodemailer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 4173;
const root = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(root));

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

app.post('/api/register', async (req, res) => {
  const { teamName, captainName, mobile, players, website } = req.body || {};
  if (website) return res.status(400).json({ message: 'Invalid submission' });
  if (![teamName, captainName, mobile, players].every(value => String(value || '').trim())) return res.status(400).json({ message: 'सभी विवरण भरना आवश्यक है।' });
  if (!/^[-+()\d\s]{8,18}$/.test(String(mobile)) || Number(players) < 1 || Number(players) > 100) return res.status(400).json({ message: 'कृपया सही विवरण भरें।' });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.REGISTRATION_EMAIL) {
    return res.json({ ok: true, demo: true, message: 'पंजीकरण सफल रहा।' });
  }

  try {
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
    const details = [['Team Name', teamName], ['Captain Name', captainName], ['Mobile Number', mobile], ['Number of Players', players]];
    await transporter.sendMail({ from: process.env.SMTP_USER, to: process.env.REGISTRATION_EMAIL, subject: 'NEW MATKA PHOD REGISTRATION', html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#17233b"><h1 style="background:#13274b;color:#e6b95a;padding:24px">श्री कृष्ण जन्माष्टमी महोत्सव</h1><h2>नई मटका फोड़ टीम पंजीकरण</h2><table style="border-collapse:collapse;width:100%">${details.map(([label, value]) => `<tr><td style="padding:12px;border-bottom:1px solid #ddd;font-weight:bold">${label}</td><td style="padding:12px;border-bottom:1px solid #ddd">${escapeHtml(value)}</td></tr>`).join('')}</table><p>Submitted At: ${new Date().toLocaleString('en-IN')}</p><p>बाल नवयुवक संघ</p></div>` });
    res.json({ ok: true, message: 'पंजीकरण सफल रहा।' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'मेल भेजने में समस्या हुई।' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(root, 'index.html')));

const startServer = (requestedPort) => {
  const server = app.listen(requestedPort, () => console.log(`Janmashtami experience running at http://localhost:${server.address().port}`));
  server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${requestedPort} is busy; trying ${Number(requestedPort) + 1}.`);
      startServer(Number(requestedPort) + 1);
      return;
    }
    throw error;
  });
};

startServer(port);
