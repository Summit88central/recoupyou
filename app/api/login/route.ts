import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { session } = await request.json();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Session is required." }), {
      status: 400,
    });
  }

  const cookieStore = cookies();

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Set the session for the server-side client
  const { error } = await supabase.auth.setSession(session);

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const userId = session?.user?.id;
  const userEmail = session?.user?.email || "";
  if (!userId) {
    return new NextResponse(JSON.stringify({ error: "Invalid session" }), {
      status: 400,
    });
  }

  // Fallback: allow admin via environment configuration without DB check
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";
  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (
    (ADMIN_USER_ID && ADMIN_USER_ID === userId) ||
    (ADMIN_EMAIL && ADMIN_EMAIL === userEmail.toLowerCase())
  ) {
    // Set admin cookie and return
    cookieStore.set("admin-session", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
    return new NextResponse(
      JSON.stringify({ message: "Session set successfully." }),
      { status: 200 }
    );
  }

  const supabaseSR = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: adminRows, error: adminError } = await supabaseSR
    .from("admin_users")
    .select("id,user_id")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .limit(1);

  if (adminError || !adminRows || adminRows.length === 0) {
    return new NextResponse(JSON.stringify({ error: "Not an admin" }), {
      status: 403,
    });
  }

  // ✨ Manually set the custom cookie for our middleware to read
  cookieStore.set("admin-session", "true", {
    path: "/",
    httpOnly: true, // Makes the cookie inaccessible to client-side scripts
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return new NextResponse(
    JSON.stringify({ message: "Session set successfully." }),
    {
      status: 200,
    }
  );
}
