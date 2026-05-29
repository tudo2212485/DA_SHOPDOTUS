import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type StylistProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  line: string | null;
  gender: string | null;
  stock: number | null;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function toCatalogContext(products: StylistProduct[], origin: string) {
  if (!products.length) {
    return "Hiện catalog chưa có sản phẩm active còn hàng. Hãy hỏi thêm nhu cầu và gợi ý khách quay lại sau.";
  }

  return products
    .map((product, index) => {
      const fields = [
        `${index + 1}. ${product.name}`,
        `giá ${formatCurrency(product.price)}`,
        `danh mục ${product.category ?? "khác"}`,
        `dòng ${product.line ?? "chưa phân loại"}`,
        `giới tính ${product.gender ?? "unisex"}`,
        `tồn kho ${product.stock ?? 0}`,
        `link ${origin}/product/${product.id}`,
      ];

      if (product.description) {
        fields.push(`mô tả ${product.description.slice(0, 120)}`);
      }

      return fields.join(" | ");
    })
    .join("\n");
}

function getRequestOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https");

  if (host && host !== "0.0.0.0:0") {
    return `${proto}://${host}`;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.host && requestUrl.host !== "0.0.0.0:0") {
    return requestUrl.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function fallbackStylistAnswer(message: string, products: StylistProduct[], origin: string) {
  const lower = message.toLowerCase();
  const budgetMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr|nghìn|ngàn|k)\b/);
  const budget = budgetMatch
    ? Number(budgetMatch[1].replace(",", ".")) *
      (budgetMatch[2] === "triệu" || budgetMatch[2] === "tr" ? 1000000 : 1000)
    : null;
  const wantsColdWeather =
    lower.includes("đà lạt") ||
    lower.includes("lạnh") ||
    lower.includes("mưa") ||
    lower.includes("tối");

  const activeProducts = products
    .filter((product) => (product.stock ?? 0) > 0)
    .sort((a, b) => {
      const aCold = /hoodie|jacket/i.test(`${a.name} ${a.category} ${a.line}`);
      const bCold = /hoodie|jacket/i.test(`${b.name} ${b.category} ${b.line}`);
      if (wantsColdWeather && aCold !== bCold) return aCold ? -1 : 1;
      return a.price - b.price;
    });

  const picked: StylistProduct[] = [];
  const pickedCategories = new Set<string>();
  let total = 0;

  for (const product of activeProducts) {
    if (picked.length >= 4) break;
    const categoryKey = product.category ?? product.line ?? product.name;
    if (pickedCategories.has(categoryKey) && picked.length < 3) continue;
    if (budget && total + product.price > budget && picked.length > 0) continue;
    picked.push(product);
    pickedCategories.add(categoryKey);
    total += product.price;
  }

  if (!picked.length) {
    return "Mình chưa thấy sản phẩm còn hàng phù hợp trong catalog. Bạn thử tăng ngân sách hoặc quay lại sau khi shop nhập thêm hàng nhé.";
  }

  const lines = picked.map(
    (product, index) =>
      `${index + 1}. ${product.name} - ${formatCurrency(product.price)} - ${origin}/product/${product.id}`,
  );

  return [
    "Mình gợi ý nhanh theo sản phẩm đang còn hàng trong DOTUS:",
    "",
    "Set đề xuất:",
    ...lines,
    "",
    `Tổng tạm tính: ${formatCurrency(total)}${budget ? ` / ngân sách khoảng ${formatCurrency(budget)}` : ""}.`,
    wantsColdWeather
      ? "Lý do: ưu tiên item giữ ấm, màu dễ phối và lên ảnh tốt khi đi tối hoặc thời tiết se lạnh. Nếu trời mưa, nên khoác thêm áo chống nước bên ngoài vì hoodie không thay áo mưa."
      : "Lý do: set dễ mặc hằng ngày, có thể phối lại từng món với đồ sẵn có và không bị quá nổi trong môi trường đi học.",
    "Nếu bạn cho mình thêm chiều cao/cân nặng, màu giày đang có và dịp mặc, mình sẽ tinh chỉnh set sát hơn.",
  ].join("\n");
}

function buildStylistPrompt(message: string, catalogContext: string) {
  return [
    "Bạn là AI Stylist cho website bán streetwear DOTUS.",
    "Luôn trả lời bằng tiếng Việt có dấu, tự nhiên, ngắn gọn nhưng đủ hữu ích.",
    "Chỉ gợi ý sản phẩm có trong catalog bên dưới, không bịa tên sản phẩm.",
    "Nếu khách hỏi phức tạp, hãy chia câu trả lời thành: Set đề xuất, Vì sao hợp, Lưu ý size/thời tiết/ngân sách.",
    "Nếu thiếu thông tin quan trọng như giới tính, thời tiết, dịp đi, ngân sách, hãy hỏi lại tối đa 2 câu sau khi đưa một gợi ý an toàn.",
    "Khi gợi ý sản phẩm, ghi kèm giá và link sản phẩm.",
    "Không hứa giao hàng, giảm giá hoặc tồn kho ngoài dữ liệu catalog.",
    "",
    "Catalog đang bán:",
    catalogContext,
    "",
    "Câu hỏi của khách:",
    message,
  ].join("\n");
}

function readGeminiText(data: GeminiGenerateContentResponse) {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("") ?? ""
  ).trim();
}

function isCompleteStylistAnswer(answer: string) {
  const trimmed = answer.trim();

  if (trimmed.length < 120 || !trimmed.includes("/product/")) {
    return false;
  }

  if (/(\bTổng cộng|\bTổng tạm tính)\s*:\s*[\d.,]+\s*\.?$/i.test(trimmed)) {
    return false;
  }

  return /[.!?)]$/.test(trimmed);
}

async function callGemini(
  apiKey: string,
  prompt: string,
  model: string,
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1600,
        },
      }),
    },
  );

  if (!response.ok) {
    return "";
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  return readGeminiText(data);
}

export async function POST(request: Request) {
  const { message } = (await request.json()) as { message?: string };

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const origin = getRequestOrigin(request);
  let products: StylistProduct[] = [];
  let catalogContext =
    "Không đọc được catalog lúc này. Hãy trả lời như stylist và nói rõ đây là gợi ý tham khảo.";

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id,name,description,price,category,line,gender,stock")
      .eq("is_active", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(30);

    products = ((data ?? []) as StylistProduct[])
      .filter((product) => !/^(qa hoodie|smoke test hoodie)/i.test(product.name))
      .slice(0, 12);
    catalogContext = toCatalogContext(products, origin);
  } catch {
    // Keep the chatbot available even if Supabase is temporarily unavailable.
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const provider = process.env.AI_PROVIDER ?? "gemini";

  if (provider !== "gemini" || !apiKey) {
    return new Response(encoder.encode(fallbackStylistAnswer(message, products, origin)), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const prompt = buildStylistPrompt(message, catalogContext);
  const models = [
    process.env.GEMINI_MODEL || "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
  ];
  let answer = "";

  for (const model of Array.from(new Set(models))) {
    answer = await callGemini(apiKey, prompt, model);
    if (isCompleteStylistAnswer(answer)) {
      break;
    }
  }

  if (!isCompleteStylistAnswer(answer)) {
    answer = fallbackStylistAnswer(message, products, origin);
  }

  return new Response(encoder.encode(answer), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
