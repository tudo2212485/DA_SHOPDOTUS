import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

type ProductVisual = {
  name: string;
  category: string;
  shape: "hoodie" | "tee" | "shirt" | "pants" | "shorts" | "shoe" | "bag" | "cap";
  base: string;
  accent: string;
  bg: string;
};

const visuals: Record<string, ProductVisual> = {
  "zip-hoodie-forest-green": {
    name: "Zip Hoodie Forest Green",
    category: "HOODIE OVERSIZE",
    shape: "hoodie",
    base: "#365342",
    accent: "#d9b46f",
    bg: "#101815",
  },
  "hoodie-ash-grey-layer": {
    name: "Hoodie Ash Grey Layer",
    category: "HOODIE OVERSIZE",
    shape: "hoodie",
    base: "#b7bcc0",
    accent: "#f97316",
    bg: "#111827",
  },
  "oversize-hoodie-blackout": {
    name: "Oversize Hoodie Blackout",
    category: "HOODIE OVERSIZE",
    shape: "hoodie",
    base: "#111111",
    accent: "#ef4444",
    bg: "#1f1f1f",
  },
  "hoodie-tudo": {
    name: "Hoodie Tudo",
    category: "HOODIE OVERSIZE",
    shape: "hoodie",
    base: "#d8d4cc",
    accent: "#111827",
    bg: "#2a2521",
  },
  "boxy-tee-core-white": {
    name: "Boxy Tee Core White",
    category: "T-SHIRT BOXY",
    shape: "tee",
    base: "#f8fafc",
    accent: "#111827",
    bg: "#d7dce2",
  },
  "oversize-tee-sand-logo": {
    name: "Oversize Tee Sand Logo",
    category: "T-SHIRT BOXY",
    shape: "tee",
    base: "#d6c1a5",
    accent: "#8a4b2a",
    bg: "#2f2721",
  },
  "graphic-tee-night-ride": {
    name: "Graphic Tee Night Ride",
    category: "T-SHIRT BOXY",
    shape: "tee",
    base: "#111111",
    accent: "#f5f5f5",
    bg: "#1b1b22",
  },
  "layer-shirt-smoke-grey": {
    name: "Layer Shirt Smoke Grey",
    category: "SHIRT",
    shape: "shirt",
    base: "#7b8794",
    accent: "#d6e4ef",
    bg: "#17212b",
  },
  "prime-jersey-navy": {
    name: "Prime Jersey Navy",
    category: "SHIRT",
    shape: "shirt",
    base: "#0f2747",
    accent: "#f8fafc",
    bg: "#101827",
  },
  "relaxed-cargo-olive": {
    name: "Relaxed Cargo Olive",
    category: "PANTS",
    shape: "pants",
    base: "#55624a",
    accent: "#d9b46f",
    bg: "#171c14",
  },
  "utility-jogger-black": {
    name: "Utility Jogger Black",
    category: "PANTS",
    shape: "pants",
    base: "#171717",
    accent: "#9ca3af",
    bg: "#282828",
  },
  "washed-denim-loose-blue": {
    name: "Washed Denim Loose Blue",
    category: "PANTS",
    shape: "pants",
    base: "#47749d",
    accent: "#c7d2fe",
    bg: "#101827",
  },
  "nylon-shorts-sand": {
    name: "Nylon Shorts Sand",
    category: "SHORTS",
    shape: "shorts",
    base: "#d7bd93",
    accent: "#7c4a22",
    bg: "#231d17",
  },
  "cargo-shorts-black": {
    name: "Cargo Shorts Black",
    category: "SHORTS",
    shape: "shorts",
    base: "#151515",
    accent: "#f97316",
    bg: "#2a2a2a",
  },
  "low-top-sneaker-ivory-gum": {
    name: "Low-top Sneaker Ivory Gum",
    category: "SNEAKER LOW-TOP",
    shape: "shoe",
    base: "#f4efe5",
    accent: "#b9793a",
    bg: "#1f2937",
  },
  "court-sneaker-grey": {
    name: "Court Sneaker Grey",
    category: "SNEAKER LOW-TOP",
    shape: "shoe",
    base: "#aeb6bf",
    accent: "#334155",
    bg: "#111827",
  },
  "canvas-crossbody-bag-black": {
    name: "Canvas Crossbody Bag Black",
    category: "BAG",
    shape: "bag",
    base: "#161616",
    accent: "#f97316",
    bg: "#2b211d",
  },
  "tech-backpack-olive": {
    name: "Tech Backpack Olive",
    category: "BAG",
    shape: "bag",
    base: "#4c5a3f",
    accent: "#d9b46f",
    bg: "#141912",
  },
  "dad-cap-mono-black": {
    name: "Dad Cap Mono Black",
    category: "CAP",
    shape: "cap",
    base: "#101010",
    accent: "#f5f5f5",
    bg: "#27272a",
  },
  "nylon-cap-khaki": {
    name: "Nylon Cap Khaki",
    category: "CAP",
    shape: "cap",
    base: "#b59a6a",
    accent: "#4b3621",
    bg: "#221b12",
  },
  "beanie-ribbed-charcoal": {
    name: "Beanie Ribbed Charcoal",
    category: "CAP",
    shape: "cap",
    base: "#414141",
    accent: "#d1d5db",
    bg: "#171717",
  },
};

function renderShape(visual: ProductVisual, hover: boolean) {
  const base = hover ? visual.accent : visual.base;
  const accent = hover ? visual.base : visual.accent;
  const commonShadow = "0 34px 80px rgba(0,0,0,0.34)";

  if (visual.shape === "hoodie") {
    return (
      <div style={{ display: "flex", position: "relative", width: 430, height: 520 }}>
        <div style={{ position: "absolute", left: 130, top: 8, width: 170, height: 150, borderRadius: "52% 52% 38% 38%", background: base, boxShadow: commonShadow }} />
        <div style={{ position: "absolute", left: 92, top: 122, width: 246, height: 302, borderRadius: 52, background: base, boxShadow: commonShadow }} />
        <div style={{ position: "absolute", left: 26, top: 150, width: 94, height: 280, borderRadius: 40, background: base, transform: "rotate(12deg)" }} />
        <div style={{ position: "absolute", right: 26, top: 150, width: 94, height: 280, borderRadius: 40, background: base, transform: "rotate(-12deg)" }} />
        <div style={{ position: "absolute", left: 154, top: 200, width: 122, height: 96, borderRadius: "0 0 44px 44px", border: `10px solid ${accent}`, borderTop: "0px", opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 205, top: 138, width: 7, height: 236, borderRadius: 8, background: accent, opacity: 0.75 }} />
      </div>
    );
  }

  if (visual.shape === "tee" || visual.shape === "shirt") {
    return (
      <div style={{ display: "flex", position: "relative", width: 430, height: 500 }}>
        <div style={{ position: "absolute", left: 120, top: 60, width: 190, height: 310, borderRadius: visual.shape === "shirt" ? 18 : 38, background: base, boxShadow: commonShadow }} />
        <div style={{ position: "absolute", left: 38, top: 74, width: 116, height: 126, borderRadius: 24, background: base, transform: "rotate(22deg)" }} />
        <div style={{ position: "absolute", right: 38, top: 74, width: 116, height: 126, borderRadius: 24, background: base, transform: "rotate(-22deg)" }} />
        <div style={{ position: "absolute", left: 176, top: 62, width: 78, height: 46, borderRadius: "0 0 50px 50px", background: visual.bg, border: `8px solid ${accent}`, borderTop: "0px" }} />
        {visual.shape === "shirt" ? (
          <div style={{ position: "absolute", left: 211, top: 72, width: 8, height: 286, borderRadius: 8, background: accent }} />
        ) : (
          <div style={{ position: "absolute", left: 176, top: 205, width: 78, height: 78, borderRadius: 999, border: `10px solid ${accent}` }} />
        )}
      </div>
    );
  }

  if (visual.shape === "pants") {
    return (
      <div style={{ display: "flex", position: "relative", width: 410, height: 540 }}>
        <div style={{ position: "absolute", left: 106, top: 42, width: 198, height: 82, borderRadius: 26, background: base, boxShadow: commonShadow }} />
        <div style={{ position: "absolute", left: 98, top: 110, width: 112, height: 354, borderRadius: 34, background: base, transform: "rotate(3deg)" }} />
        <div style={{ position: "absolute", right: 98, top: 110, width: 112, height: 354, borderRadius: 34, background: base, transform: "rotate(-3deg)" }} />
        <div style={{ position: "absolute", left: 126, top: 182, width: 58, height: 82, borderRadius: 12, border: `8px solid ${accent}`, opacity: 0.9 }} />
        <div style={{ position: "absolute", right: 126, top: 182, width: 58, height: 82, borderRadius: 12, border: `8px solid ${accent}`, opacity: 0.9 }} />
      </div>
    );
  }

  if (visual.shape === "shorts") {
    return (
      <div style={{ display: "flex", position: "relative", width: 430, height: 430 }}>
        <div style={{ position: "absolute", left: 92, top: 88, width: 246, height: 86, borderRadius: 28, background: base, boxShadow: commonShadow }} />
        <div style={{ position: "absolute", left: 88, top: 160, width: 128, height: 170, borderRadius: 34, background: base, transform: "rotate(5deg)" }} />
        <div style={{ position: "absolute", right: 88, top: 160, width: 128, height: 170, borderRadius: 34, background: base, transform: "rotate(-5deg)" }} />
        <div style={{ position: "absolute", left: 120, top: 204, width: 58, height: 66, borderRadius: 12, border: `8px solid ${accent}` }} />
        <div style={{ position: "absolute", right: 120, top: 204, width: 58, height: 66, borderRadius: 12, border: `8px solid ${accent}` }} />
      </div>
    );
  }

  if (visual.shape === "shoe") {
    return (
      <div style={{ display: "flex", position: "relative", width: 520, height: 360 }}>
        <div style={{ position: "absolute", left: 88, top: 130, width: 314, height: 126, borderRadius: "120px 110px 54px 52px", background: base, boxShadow: commonShadow }} />
        <div style={{ position: "absolute", left: 60, top: 218, width: 404, height: 64, borderRadius: 38, background: accent }} />
        <div style={{ position: "absolute", left: 288, top: 112, width: 122, height: 86, borderRadius: "80px 80px 12px 12px", background: base, transform: "rotate(-14deg)" }} />
        <div style={{ position: "absolute", left: 150, top: 158, width: 120, height: 12, borderRadius: 12, background: accent }} />
        <div style={{ position: "absolute", left: 164, top: 188, width: 120, height: 12, borderRadius: 12, background: accent }} />
      </div>
    );
  }

  if (visual.shape === "bag") {
    return (
      <div style={{ display: "flex", position: "relative", width: 430, height: 500 }}>
        <div style={{ position: "absolute", left: 116, top: 94, width: 198, height: 120, borderRadius: "80px 80px 12px 12px", border: `24px solid ${accent}`, borderBottom: 0 }} />
        <div style={{ position: "absolute", left: 86, top: 180, width: 258, height: 238, borderRadius: 46, background: base, boxShadow: commonShadow }} />
        <div style={{ position: "absolute", left: 126, top: 242, width: 178, height: 92, borderRadius: 26, border: `10px solid ${accent}` }} />
        <div style={{ position: "absolute", left: 204, top: 184, width: 22, height: 230, borderRadius: 14, background: accent, opacity: 0.8 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", position: "relative", width: 450, height: 400 }}>
      <div style={{ position: "absolute", left: 80, top: 146, width: 290, height: 140, borderRadius: "160px 160px 34px 34px", background: base, boxShadow: commonShadow }} />
      <div style={{ position: "absolute", left: 116, top: 132, width: 218, height: 84, borderRadius: "130px 130px 20px 20px", border: `20px solid ${accent}`, borderBottom: 0 }} />
      <div style={{ position: "absolute", left: 240, top: 252, width: 160, height: 46, borderRadius: "10px 80px 50px 10px", background: accent }} />
    </div>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const visual = visuals[params.slug] ?? visuals["boxy-tee-core-white"];
  const hover = request.nextUrl.searchParams.get("view") === "hover";
  const bg = hover ? visual.base : visual.bg;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(140deg, ${bg}, #0a0a0a)`,
          color: "white",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 58,
            left: 58,
            right: 58,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            letterSpacing: 8,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <span>DOTUS</span>
          <span>{hover ? "ALT VIEW" : "FRONT VIEW"}</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 152,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {renderShape(visual, hover)}
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 72,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 8, color: visual.accent }}>
            {visual.category}
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.05 }}>
            {visual.name}
          </div>
        </div>
      </div>
    ),
    {
      width: 900,
      height: 1200,
    },
  );
}
