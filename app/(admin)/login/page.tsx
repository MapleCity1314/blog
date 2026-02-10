import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginPage from "@/components/admin/login/login";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminSessionCookieOptions,
  sanitizeNextPath,
  verifyAdminCredentials,
  type AdminAuthState,
} from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Login",
  description: "Secure admin sign-in",
  robots: {
    index: false,
    follow: false,
  },
};

export async function login(
  prevState: AdminAuthState,
  formData: FormData
): Promise<AdminAuthState> {
  "use server";
  void prevState;

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const nextParam = String(formData.get("next") ?? "");

  if (!username || !password) {
    return { error: "Please enter your admin ID and access key." };
  }

  const result = await verifyAdminCredentials(username, password);
  if (!result.ok) {
    return { error: "Invalid administrator ID or access key." };
  }

  const sessionValue = createAdminSession(username);
  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    sessionValue,
    getAdminSessionCookieOptions()
  );

  const destination = sanitizeNextPath(nextParam);
  redirect(destination);
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const nextValue = Array.isArray(resolvedParams?.next)
    ? resolvedParams?.next[0]
    : resolvedParams?.next;
  const nextPath = sanitizeNextPath(nextValue);

  return <LoginPage action={login} nextPath={nextPath} />;
}
