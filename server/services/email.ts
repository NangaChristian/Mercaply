import nodemailer from 'nodemailer';
import { getConfig } from './config.js';

function getTransporter() {
  const config = getConfig();
  const smtpInt = config.integrations.find((i: any) => i.id === 'smtp_hostinger');
  if (!smtpInt || !smtpInt.isActive) {
    console.warn('SMTP integration is disabled or not configured.');
    return null;
  }

  const { host, port, secure, user, pass } = smtpInt.config;
  
  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: secure === 'true' || secure === true, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
}

export async function sendOrderConfirmationEmail(to: string, name: string, order: any) {
  const transporter = getTransporter();
  if (!transporter) return;

  const config = getConfig();
  const smtpInt = config.integrations.find((i: any) => i.id === 'smtp_hostinger');
  const from = smtpInt.config.from || '"Mercaply" <contact@mercaply.com>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Merci pour votre commande, ${name || 'Client'}!</h2>
      <p>Votre commande <strong>#${order.id.substring(0, 8)}</strong> a été confirmée et est en cours de traitement.</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Détails de la commande</h3>
        <p><strong>Total:</strong> ${order.total} FCFA</p>
        <p><strong>Statut:</strong> Payé & En cours de traitement</p>
      </div>
      
      <p>Nous vous informerons dès que votre commande sera expédiée.</p>
      <p>Merci pour votre confiance,<br>L'équipe Mercaply</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `Confirmation de votre commande #${order.id.substring(0, 8)}`,
      html
    });
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

export async function sendShippingUpdateEmail(to: string, name: string, orderId: string, status: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const config = getConfig();
  const smtpInt = config.integrations.find((i: any) => i.id === 'smtp_hostinger');
  const from = smtpInt.config.from || '"Mercaply" <contact@mercaply.com>';

  const statusText = status === 'shipped' ? 'expédiée' : status === 'delivered' ? 'livrée' : status;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Mise à jour de votre commande</h2>
      <p>Bonjour ${name || 'Client'},</p>
      <p>Le statut de votre commande <strong>#${orderId.substring(0, 8)}</strong> a été mis à jour.</p>
      <p>Nouveau statut: <strong>${statusText}</strong></p>
      <p>Merci pour votre confiance,<br>L'équipe Mercaply</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `Mise à jour: Commande #${orderId.substring(0, 8)} ${statusText}`,
      html
    });
  } catch (error) {
    console.error("Error sending shipping update email:", error);
  }
}
