"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SocialAuthButtons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  async function handleFacebookSignIn() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const origin = window.location.origin;
      const next = pathname || "/";

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (oauthError) {
        setError("Đăng nhập Facebook chưa sẵn sàng. Vui lòng kiểm tra cấu hình provider.");
      }
    } catch {
      setError("Không thể kết nối đăng nhập Facebook. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleFacebookSignIn}
        disabled={loading}
      >
        {loading ? "Đang chuyển hướng..." : "Đăng nhập bằng Facebook"}
      </Button>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
