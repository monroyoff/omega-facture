import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, organization, token, confirmUrl } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email et token requis' },
        { status: 400 }
      );
    }

    const userDisplayName = firstName || email.split('@')[0];
    const targetUrl = confirmUrl || `http://localhost:3000/confirm-email?token=${token}&email=${encodeURIComponent(email)}`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Activez votre compte OMEGA FACTURE</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0b1329 0%, #1e293b 100%); padding: 36px 32px; text-align: center; }
    .logo { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #3b82f6); display: inline-flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 12px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: #94a3b8; margin: 6px 0 0 0; font-size: 12px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff !important; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
    .callout { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 24px 0; }
    .callout-title { font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px; }
    .callout-text { font-size: 12px; color: #15803d; line-height: 1.5; margin: 0; }
    .link-fallback { font-size: 12px; color: #94a3b8; word-break: break-all; margin-top: 24px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ω</div>
      <h1>OMEGA FACTURE</h1>
      <p>SaaS de Facturation, Devis & Pilotage Financier — Zone UEMOA</p>
    </div>
    <div class="body">
      <div class="greeting">Bonjour ${userDisplayName},</div>
      <p class="text">
        Félicitations pour la création de votre compte professionnel <strong>${organization || "OMEGA"}</strong>.
      </p>
      <p class="text">
        Pour finaliser votre inscription et débloquer l'accès à votre tableau de bord, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
      </p>

      <div class="btn-container">
        <a href="${targetUrl}" class="btn" target="_blank">Confirmer mon adresse email & Accéder au Dashboard &rarr;</a>
      </div>

      <div class="callout">
        <div class="callout-title">Sécurité de votre espace professionnel</div>
        <p class="callout-text">
          Ce lien de confirmation est personnel et sécurisé. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
        </p>
      </div>

      <p class="link-fallback">
        Si le bouton ne fonctionne pas, copiez et collez ce lien direct dans votre navigateur :<br>
        <a href="${targetUrl}" style="color: #2563eb;">${targetUrl}</a>
      </p>
    </div>
    <div class="footer">
      <strong>OMEGA FACTURE</strong> • Cotonou & Allada, République du Bénin<br>
      Facturation conforme à la réglementation UEMOA et au droit OHADA révisé.<br>
      © 2026 OMEGA FACTURE. Tous droits réservés.
    </div>
  </div>
</body>
</html>
`;

    // 1. PRIORITÉ : SMTP Gmail si configuré (GMAIL_USER et GMAIL_APP_PASSWORD)
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '');

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const info = await transporter.sendMail({
          from: `"OMEGA FACTURE" <${gmailUser}>`,
          to: email,
          subject: `Activez votre compte OMEGA FACTURE — ${userDisplayName}`,
          html: emailHtml,
        });

        console.log('[Gmail SMTP] Email envoyé avec succès :', info.messageId, 'vers', email);

        return NextResponse.json({
          success: true,
          provider: 'gmail-smtp',
          messageId: info.messageId,
          confirmUrl: targetUrl,
        });
      } catch (smtpErr: any) {
        console.error('[Gmail SMTP] Erreur envoi :', smtpErr?.message);
        // Fallback vers Resend si échec
      }
    }

    // 2. FALLBACK : Resend API
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromAddress = process.env.EMAIL_FROM || 'OMEGA FACTURE <onboarding@resend.dev>';

    if (apiKey) {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: `Activez votre compte OMEGA FACTURE — ${userDisplayName}`,
        html: emailHtml,
      });

      if (error) {
        console.warn('[Resend Info] Avertissement transmission :', error);
        return NextResponse.json({
          success: false,
          error: error.message,
          confirmUrl: targetUrl,
          requiresDomainVerification: error.message.includes('domain'),
        }, { status: 200 });
      }

      return NextResponse.json({
        success: true,
        provider: 'resend',
        messageId: data?.id,
        confirmUrl: targetUrl,
      });
    }

    // 3. Fallback sans clé
    return NextResponse.json({
      success: false,
      confirmUrl: targetUrl,
      message: 'Aucun serveur email configuré',
    });
  } catch (err: any) {
    console.error('[Send Verification API] Erreur :', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
