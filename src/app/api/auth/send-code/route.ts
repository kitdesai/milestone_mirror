import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/d1-types";
import { createVerificationCode } from "@/lib/verification-code";
import { sendVerificationCode } from "@/lib/email";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { email }: { email: string } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const env = getCloudflareEnv(request);
    const db = env?.DB;

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    if (!env?.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const code = await createVerificationCode(db, email);
    await sendVerificationCode(email.toLowerCase().trim(), code, env.RESEND_API_KEY);

    // Always return success to avoid revealing whether the email exists
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send code error:", error);
    const message =
      error instanceof Error && error.message.includes("Too many")
        ? error.message
        : "Failed to send code";
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes("Too many") ? 429 : 500 }
    );
  }
}
