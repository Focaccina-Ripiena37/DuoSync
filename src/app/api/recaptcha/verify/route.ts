import { NextRequest, NextResponse } from "next/server";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || process.env.RECAPTCHA_PUBLIC_KEY;
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing reCAPTCHA token" },
        { status: 400 }
      );
    }

    // Use standard siteverify API
    if (!SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Server misconfigured: RECAPTCHA_SECRET_KEY is required",
        },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();
    params.append("secret", SECRET_KEY);
    params.append("response", token);
    const ip = req.headers.get("x-forwarded-for") || undefined;
    if (ip) params.append("remoteip", ip);

    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        cache: "no-store",
      }
    );
    
    const data = await verifyRes.json();
    
    if (!data?.success) {
      return NextResponse.json(
        {
          success: false,
          score: data?.score,
          action: data?.action,
          errors: data?.["error-codes"],
          message: "reCAPTCHA verification failed"
        },
        { status: 400 }
      );
    }
    
    // Validate action if provided
    if (action && data?.action && data.action !== action) {
      return NextResponse.json(
        { 
          success: false, 
          message: "reCAPTCHA action mismatch", 
          actionReturned: data.action 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      method: "siteverify",
      score: data?.score,
      action: data?.action,
      hostname: data?.hostname,
      challenge_ts: data?.challenge_ts,
    });
  } catch (err: any) {
    console.error("reCAPTCHA verification error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Invalid request" },
      { status: 400 }
    );
  }
}

