import type { Metadata } from "next";

import { AIStylist } from "@/components/ai/ai-stylist";
import { CartFeedback } from "@/components/cart/cart-feedback";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CartProvider } from "@/contexts/cart-context";

import "./globals.css";

export const metadata: Metadata = {
  title: "DOTUS",
  description: "DOTUS - cửa hàng streetwear nam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ThemeProvider>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CartFeedback />
            <AIStylist />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
