import nodemailer from 'nodemailer';

const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let _transport = null;

function getTransport() {
  if (_transport) return _transport;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  _transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  return _transport;
}

async function send({ to, subject, html }) {
  const t = getTransport();
  if (!t) {
    // Dev: imprimir en consola en vez de enviar
    console.log(`\n📧  [EMAIL DEV] To: ${to}\n    Subject: ${subject}\n    ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)}\n`);
    return;
  }
  await t.sendMail({ from: `"Trebor Labs" <${process.env.GMAIL_USER}>`, to, subject, html });
}

// ── Templates ─────────────────────────────────────────────────────────────────

const wrap = (body) => `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f11;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f11;padding:48px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;background:#18181b;border-radius:12px;border:1px solid rgba(214,186,255,0.12);overflow:hidden;">
  <tr><td style="padding:28px 32px;border-bottom:1px solid rgba(214,186,255,0.1);text-align:center;">
    <span style="color:#d6baff;font-size:18px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;">TREBOR LABS</span>
    <p style="color:rgba(214,186,255,0.45);font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:4px 0 0;">Technical Tactician</p>
  </td></tr>
  <tr><td style="padding:36px 32px;">${body}</td></tr>
  <tr><td style="padding:20px 32px;border-top:1px solid rgba(214,186,255,0.1);text-align:center;">
    <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:0;">Si no solicitaste esto, ignora este correo.</p>
    <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:6px 0 0;">© 2026 Trebor Labs · Lima, Perú</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;

const btn = (href, label) =>
  `<div style="text-align:center;margin:28px 0;">
     <a href="${href}" style="display:inline-block;background:#6b4c9a;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;">${label}</a>
   </div>`;

const h1 = (t) => `<h1 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 10px;">${t}</h1>`;
const p  = (t) => `<p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;margin:0;">${t}</p>`;
const sm = (t) => `<p style="color:rgba(255,255,255,0.35);font-size:11px;margin:20px 0 0;">${t}</p>`;

// ── Exported send functions ───────────────────────────────────────────────────

export async function sendVerificationEmail(email, token) {
  const link = `${BACKEND_URL}/api/auth/verify-email?token=${token}`;
  await send({
    to: email,
    subject: 'Confirma tu cuenta — Trebor Labs',
    html: wrap(`
      ${h1('Confirma tu correo')}
      ${p(`Haz clic para activar tu cuenta. El enlace es válido por <strong style="color:#d6baff;">15 minutos</strong>.`)}
      ${btn(link, 'Confirmar cuenta')}
      ${sm(`O copia este enlace: <span style="color:#d6baff;word-break:break-all;">${link}</span>`)}
    `),
  });
}

export async function sendPasswordResetEmail(email, token) {
  const link = `${FRONTEND_URL}/auth/reset-password?token=${token}`;
  await send({
    to: email,
    subject: 'Recupera tu contraseña — Trebor Labs',
    html: wrap(`
      ${h1('Recuperar contraseña')}
      ${p(`Recibimos una solicitud para restablecer tu contraseña. Válido por <strong style="color:#d6baff;">15 minutos</strong>.`)}
      ${btn(link, 'Restablecer contraseña')}
      ${sm('Si no solicitaste esto, tu cuenta sigue segura.')}
    `),
  });
}

export async function sendChangePasswordConfirmEmail(email, token) {
  const link = `${BACKEND_URL}/api/auth/confirm-change?token=${token}`;
  await send({
    to: email,
    subject: 'Confirma el cambio de contraseña — Trebor Labs',
    html: wrap(`
      ${h1('Confirmar cambio de contraseña')}
      ${p(`Solicitaste cambiar tu contraseña. Confirma el cambio haciendo clic. Válido por <strong style="color:#d6baff;">15 minutos</strong>.`)}
      ${btn(link, 'Confirmar cambio')}
      ${sm('Si no solicitaste esto, ignora este correo. Tu contraseña actual sigue igual.')}
    `),
  });
}
