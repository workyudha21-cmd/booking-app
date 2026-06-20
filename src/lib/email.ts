import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail({
  to,
  resetUrl,
  userName,
}: {
  to: string;
  resetUrl: string;
  userName: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "BookingApp <onboarding@resend.dev>",
      to,
      subject: "Reset Password - BookingApp",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #18181b; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Reset Password</h1>
                <p style="color: #52525b; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
                  Halo ${userName},
                </p>
                <p style="color: #52525b; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
                  Kami menerima permintaan untuk mereset password akun BookingApp Anda. Klik tombol di bawah untuk membuat password baru:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #52525b; font-size: 14px; line-height: 20px; margin: 0 0 16px;">
                  Link ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
                </p>
                <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
                <p style="color: #a1a1aa; font-size: 12px; line-height: 16px; margin: 0;">
                  Email ini dikirim oleh BookingApp. Jangan balas email ini.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send reset password email:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}
