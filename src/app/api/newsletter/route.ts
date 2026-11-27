import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { newsletterSchema } from "@/lib/validations/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email address." },
        { status: 400 }
      );
    }

    if (!isSupabasePublicConfigured()) {
      return NextResponse.json(
        {
          error:
            "Newsletter subscription storage requires Supabase configuration in .env.local.",
        },
        { status: 503 }
      );
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("newsletter_subscribers")
      .upsert(
        { email: parsed.data.email.toLowerCase(), status: "active" },
        { onConflict: "email" }
      );

    if (error) {
      return NextResponse.json(
        { error: "Unable to save subscription right now. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for joining Drapes of Cotton.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error processing subscription." },
      { status: 500 }
    );
  }
}
