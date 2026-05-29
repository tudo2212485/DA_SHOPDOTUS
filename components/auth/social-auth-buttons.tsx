"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Facebook } from "lucide-react";

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
        className="h-12 w-full rounded-xl border-neutral-200 bg-white text-base font-semibold hover:bg-neutral-50"
        onClick={handleFacebookSignIn}
        disabled={loading}
      >
        <Facebook className="mr-2 h-4 w-4" />
        {loading ? "Đang chuyển hướng..." : "Đăng nhập bằng Facebook"}
      </Button>
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
