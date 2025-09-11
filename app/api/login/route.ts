import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
