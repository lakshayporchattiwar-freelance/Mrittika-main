import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  );
  response.cookies.set("mrittika_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
