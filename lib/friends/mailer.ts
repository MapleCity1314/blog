import "server-only";

import nodemailer from "nodemailer";

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing ${name} for friends mailer.`);
  }
  return value;
}

let transporter: nodemailer.Transporter | null = null;
let smtpFrom = "";

function getTransporter() {
  if (transporter) {
    return transporter;
  }
  const smtpHost = requireEnv(process.env.FRIENDS_SMTP_HOST, "FRIENDS_SMTP_HOST");
  const smtpPort = Number(requireEnv(process.env.FRIENDS_SMTP_PORT, "FRIENDS_SMTP_PORT"));
  const smtpUser = requireEnv(process.env.FRIENDS_SMTP_USER, "FRIENDS_SMTP_USER");
  const smtpPass = requireEnv(process.env.FRIENDS_SMTP_PASS, "FRIENDS_SMTP_PASS");
  smtpFrom = requireEnv(process.env.FRIENDS_SMTP_FROM, "FRIENDS_SMTP_FROM");

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

export async function sendAccessEmail({
  to,
  confirmUrl,
}: {
  to: string;
  confirmUrl: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 12px;">Friend Link Confirmation</h2>
      <p>A request was made to open the friend link form. Approve it via the link below.</p>
      <p><a href="${confirmUrl}" style="color: #111; font-weight: 600;">Approve Request</a></p>
      <p style="font-size: 12px; color: #666;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const transport = getTransporter();

  await transport.sendMail({
    from: smtpFrom,
    to,
    subject: "Approve friend link request",
    text: `Approve friend link request: ${confirmUrl}`,
    html,
  });
}
