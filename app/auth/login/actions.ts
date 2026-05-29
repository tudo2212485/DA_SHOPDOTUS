"use server";

import { redirect } from "next/navigation";

import { isAdminUser, safePath } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function toAuthErrorMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu không đúng.";
  }

  if (lower.includes("email not confirmed")) {
    return "Email chưa được xác thực. Vui lòng kiểm tra hộp thư.";
  }

  if (lower.includes("user already registered")) {
    return "Email này đã được đăng ký.";
  }

  if (lower.includes("password should be at least")) {
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  return "Không thể xử lý yêu cầu đăng nhập. Vui lòng thử lại.";
}

function readCredentials(formData: FormData, requestedNext: string | null) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email.trim()) {
    redirect(
      "/auth/login?error=" +
        encodeURIComponent("Vui lòng nhập email.") +
        (requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""),
    );
  }

  if (!password) {
    redirect(
      "/auth/login?error=" +
        encodeURIComponent("Vui lòng nhập mật khẩu.") +
        (requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""),
    );
  }

  return { email, password };
}

function readRequestedNext(formData: FormData) {
  return safePath(String(formData.get("next") ?? ""));
}

async function getPostLoginPath(
  supabase: ReturnType<typeof createClient>,
  user: { id: string; email?: string | null } | null,
  requestedNext: string | null,
) {
  if (requestedNext) return requestedNext;
  return (await isAdminUser(supabase, user)) ? "/admin" : "/dashboard";
}

export async function signIn(formData: FormData) {
  const requestedNext = readRequestedNext(formData);

  if (!isSupabaseConfigured()) {
    redirect(
      "/auth/login?error=" +
        encodeURIComponent("Thiếu cấu hình Supabase.") +
        (requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""),
    );
  }

  const { email, password } = readCredentials(formData, requestedNext);
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent(toAuthErrorMessage(error.message))}${
        requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""
      }`,
    );
  }

  const next = await getPostLoginPath(supabase, data.user, requestedNext);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const requestedNext = readRequestedNext(formData);

  if (!isSupabaseConfigured()) {
    redirect(
      "/auth/login?error=" +
        encodeURIComponent("Thiếu cấu hình Supabase.") +
        (requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""),
    );
  }

  const { email, password } = readCredentials(formData, requestedNext);
  if (password.length < 6) {
    redirect(
      "/auth/login?error=" +
        encodeURIComponent("Mật khẩu phải có ít nhất 6 ký tự.") +
        (requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""),
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent(toAuthErrorMessage(error.message))}${
        requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""
      }`,
    );
  }

  if (!data.session) {
    redirect(
      "/auth/login?message=" +
        encodeURIComponent("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.") +
        (requestedNext ? "&next=" + encodeURIComponent(requestedNext) : ""),
    );
  }

  const next = await getPostLoginPath(supabase, data.user, requestedNext);
  redirect(next);
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
