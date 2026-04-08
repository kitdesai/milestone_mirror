// Email sending via Resend API

export async function sendVerificationCode(
  email: string,
  code: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Milestone Mirror <noreply@milestonemirror.com>",
      to: [email],
      subject: "Your sign-in code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 8px;">Your sign-in code</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Enter this code to sign in to Milestone Mirror:</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Resend API error:", error);
    throw new Error("Failed to send verification email");
  }
}
