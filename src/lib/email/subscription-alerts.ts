import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface SubscriptionAlertEmailParams {
  to: string;
  recipientName: string;
  planName: string;
  daysRemaining: number; // 2 (J-2), 1 (J-1), 0 (Jour J)
  expiresAtFormatted: string;
  renewalUrl?: string;
}

export async function sendSubscriptionAlertEmail(params: SubscriptionAlertEmailParams): Promise<{
  success: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
}> {
  const {
    to,
    recipientName,
    planName,
    daysRemaining,
    expiresAtFormatted,
    renewalUrl = 'https://www.omegafacture.site/dashboard?upgrade=true',
  } = params;

  if (!to || !to.includes('@')) {
    return { success: false, error: 'Email invalide' };
  }

  // Configuration du sujet et des badges selon la criticité
  let subject = '';
  let badgeText = '';
  let badgeBg = '#fef3c7';
  let badgeColor = '#b45309';
  let headerTitle = '';
  let urgencyText = '';

  if (daysRemaining === 2) {
    subject = `⏰ Rappel : Votre ${planName} OMEGA FACTURE expire dans 2 jours`;
    badgeText = 'Rappel Échéance • J-2';
    badgeBg = '#fef3c7';
    badgeColor = '#b45309';
    headerTitle = `Votre ${planName} arrive à échéance dans 2 jours`;
    urgencyText = `Votre abonnement sera valide jusqu'au <strong>${expiresAtFormatted}</strong>. Pour éviter toute rupture de service dans l'émission de vos factures et vos relances WhatsApp, nous vous invitons à prolonger votre formule dès maintenant.`;
  } else if (daysRemaining === 1) {
    subject = `⚠️ Vigilance : Votre ${planName} OMEGA FACTURE expire demain`;
    badgeText = 'Vigilance Échéance • J-1 (Demain)';
    badgeBg = '#ffedd5';
    badgeColor = '#c2410c';
    headerTitle = `Votre ${planName} expire demain`;
    urgencyText = `Votre abonnement arrive à son terme demain, le <strong>${expiresAtFormatted}</strong>. Sans réabonnement, vos fonctionnalités illimitées (facturation illimitée, multi-utilisateurs, relances automatiques) seront suspendues.`;
  } else {
    subject = `🔴 Dernier jour : Votre ${planName} OMEGA FACTURE expire aujourd'hui !`;
    badgeText = 'Urgence Expiration • Jour J';
    badgeBg = '#ffe4e6';
    badgeColor = '#e11d48';
    headerTitle = `Dernière chance : Votre ${planName} expire aujourd'hui`;
    urgencyText = `Votre abonnement prend fin aujourd'hui <strong>${expiresAtFormatted}</strong>. Sans renouvellement avant la fin de journée, votre compte basculera automatiquement sur le <strong>Plan Gratuit</strong> (limité à 5 factures par mois).`;
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c1017; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c1017; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #111622; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <!-- Header Logo -->
          <tr>
            <td style="padding: 32px 36px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
              <div style="display: inline-block; background-color: #0284c7; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-size: 22px; font-weight: 900; color: #ffffff; text-align: center; vertical-align: middle;">
                Ω
              </div>
              <h1 style="margin: 12px 0 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                OMEGA FACTURE
              </h1>
              <p style="margin: 4px 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8;">
                SaaS de Facturation &amp; Pilotage UEMOA
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px;">
              <!-- Badge Urgence -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 14px; border-radius: 9999px;">
                  ${badgeText}
                </span>
              </div>

              <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #ffffff; text-align: center; line-height: 1.3;">
                ${headerTitle}
              </h2>

              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Bonjour <strong>${recipientName || 'Cher Client'}</strong>,
              </p>

              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                ${urgencyText}
              </p>

              <!-- Carte Récapitulatif -->
              <table role="presentation" width="100%" style="background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px;">
                      Formule Actuelle
                    </div>
                    <div style="font-size: 18px; font-weight: 900; color: #38bdf8;">
                      ${planName}
                    </div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
                      Date d'échéance : <strong>${expiresAtFormatted}</strong>
                    </div>
                    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #334155; font-size: 11px; color: #10b981; font-weight: 700;">
                      💡 Profitez de 10% de remise immédiate pour tout réabonnement de 3 mois, 6 mois ou 1 an !
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${renewalUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.4);">
                      Renouveler mon abonnement en 1 clic →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b; text-align: center;">
                Règlement simple et sécurisé par Mobile Money (MTN MoMo, Moov Money, Celtiis, Wave) ou Carte Bancaire en FCFA.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0f172a; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">
                Besoin d'aide ou d'une question sur votre formule ? Contactez notre support WhatsApp au <strong>+229 01 95 44 44 30</strong>.
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569;">
                &copy; ${new Date().getFullYear()} OMEGA FACTURE — MONROY Business Solutions • Cotonou &amp; Allada, Bénin.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  // 1. Envoi Prioritaire : Gmail SMTP
  const cleanStr = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');
  const gmailUser = cleanStr(process.env.GMAIL_USER) || 'omegafacture@gmail.com';
  const gmailPass = cleanStr(process.env.GMAIL_APP_PASSWORD || 'kwacpwtfqtsvhllu').replace(/\s+/g, '');

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: `"OMEGA FACTURE" <${gmailUser}>`,
        to,
        subject,
        html: emailHtml,
      });

      console.log('[Gmail SMTP] Email alerte abonnement envoyé :', info.messageId, 'vers', to);
      return { success: true, provider: 'gmail-smtp', messageId: info.messageId };
    } catch (smtpErr: any) {
      console.warn('[Gmail SMTP Subscription Alert] Erreur :', smtpErr?.message);
    }
  }

  // 2. Envoi Fallback : Resend API
  const resendKey = cleanStr(process.env.RESEND_API_KEY);
  const fromAddress = cleanStr(process.env.EMAIL_FROM) || 'OMEGA FACTURE <onboarding@resend.dev>';

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html: emailHtml,
      });

      if (!error && data?.id) {
        return { success: true, provider: 'resend', messageId: data.id };
      }
      console.warn('[Resend Subscription Alert] Erreur :', error);
    } catch (resendErr: any) {
      console.warn('[Resend Subscription Alert Exception] :', resendErr?.message);
    }
  }

  return { success: false, error: 'Aucun transporteur email disponible' };
}

