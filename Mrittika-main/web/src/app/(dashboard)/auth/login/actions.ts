"use server"

import { cookies } from "next/headers"

const VALID_EMAIL = "mrittikaskinrituals@gmail.com";
const VALID_PASSWORD = "Mrittika@123";

export async function login(email: string, password: string) {
  if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
    return { success: false, error: "Invalid email or password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("mrittika_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return { success: true };
}
