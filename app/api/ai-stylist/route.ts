import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type StylistProduct = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  line: string | null;
  gender: string | null;
  stock: number | null;
};

type ChatHistoryMessage = {
  role?: "user" | "assistant";
  content?: string;
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

function productLink(product: StylistProduct, origin: string) {
  return `${origin}/product/${product.slug ?? product.id}`;
}

function detectIntent(message: string) {
  const lower = message.toLowerCase();

  if (/^(hi|hello|hey|chào|chao|xin chào|alo|ê|e|bạn ơi|ban oi)[\s!.?]*$/i.test(lower.trim())) {
    return "greeting";
  }

  if (/(phối|set|outfit|mặc gì|đi học|đi chơi|đà lạt|cafe|hẹn hò|du lịch)/i.test(lower)) {
    return "styling";
  }

  if (/(đơn|order|tra cứu|mã đơn|vận chuyển|giao hàng|hủy)/i.test(lower)) {
    return "order";
  }

  if (/(size|số đo|cao|nặng|kg|mặc vừa|form)/i.test(lower)) {
    return "size";
  }

  if (/(thanh toán|chuyển khoản|cod|hóa đơn|invoice)/i.test(lower)) {
    return "payment";
  }

  return "general";
}

function toPlainSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseBudget(message: string) {
  const match = message
    .toLowerCase()
    .match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr|nghìn|ngàn|k)\b/);

  if (!match) {
    return null;
  }

  return (
    Number(match[1].replace(",", ".")) *
    (match[2] === "triệu" || match[2] === "tr" ? 1000000 : 1000)
  );
}

function parseBodyStats(message: string) {
  const lower = message.toLowerCase().replace(",", ".");
  const meterMatch = lower.match(/1m\s*(\d{1,2})|1\.(\d{2})\s*m|(\d{3})\s*cm/);
  const weightMatch = lower.match(/(\d{2,3})\s*kg/);
  const height =
    meterMatch?.[1] ? 100 + Number(meterMatch[1]) :
    meterMatch?.[2] ? Math.round(Number(`1.${meterMatch[2]}`) * 100) :
    meterMatch?.[3] ? Number(meterMatch[3]) :
    null;
  const weight = weightMatch ? Number(weightMatch[1]) : null;

  return { height, weight };
}

function suggestTopSize(message: string) {
  const { height, weight } = parseBodyStats(message);
  const wantsOversize = /(rộng|oversize|thoải mái|form rộng|lụng|luộm)/i.test(message);

  if (!height || !weight) {
    return null;
  }

  let size = "M";

  if (height < 160 && weight < 52) size = wantsOversize ? "M" : "S";
  else if (height < 170 && weight < 62) size = wantsOversize ? "L" : "M";
  else if (height < 178 && weight < 72) size = wantsOversize ? "XL" : "L";
  else size = wantsOversize ? "XXL" : "XL";

  return { size, height, weight, wantsOversize };
}

function pickRelevantProducts(message: string, products: StylistProduct[]) {
  const lower = toPlainSearchText(message);
  const budget = parseBudget(message);
  const keywords = lower
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

  return products
    .filter((product) => {
      if ((product.stock ?? 0) <= 0) return false;
      if (budget && product.price > budget && !/(set|phoi|outfit)/i.test(lower)) return false;
      return true;
    })
    .map((product) => {
      const productText = toPlainSearchText(
        `${product.name} ${product.category ?? ""} ${product.line ?? ""} ${product.description ?? ""}`,
      );
      const score =
        keywords.reduce((total, word) => total + (productText.includes(word) ? 2 : 0), 0) +
        (/hoodie|da lat|lanh|mua|toi/.test(lower) && /hoodie/i.test(productText) ? 4 : 0) +
        (/giay|sneaker/.test(lower) && /sneaker/i.test(productText) ? 4 : 0) +
        (/quan|cargo|pants|short/.test(lower) && /(pants|short|cargo)/i.test(productText) ? 4 : 0) +
        (/phu kien|mu|tui|cap|bag/.test(lower) && /(cap|bag|accessories)/i.test(productText) ? 4 : 0);

      return { product, score };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 12)
    .map((item) => item.product);
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
        `link ${productLink(product, origin)}`,
      ];

      if (product.description) {
        fields.push(`mô tả ${product.description.slice(0, 140)}`);
      }

      return fields.join(" | ");
    })
    .join("\n");
}

function toStoreKnowledge(origin: string) {
  return [
    "Kiến thức vận hành DOTUS:",
    `- Trang sản phẩm: ${origin}/products`,
    `- Giỏ hàng và thanh toán: ${origin}/cart`,
    `- Trang tài khoản/lịch sử đơn hàng: ${origin}/dashboard`,
    "- Khách chọn sản phẩm, chọn size, thêm vào giỏ, nhập tên người nhận, số điện thoại, địa chỉ, ghi chú và phương thức thanh toán.",
    "- Đơn mới ở trạng thái Chờ xử lý. Khi admin xác nhận thanh toán/COD, đơn sang Đã xác nhận và hệ thống mới trừ tồn kho.",
    "- Nếu đơn đã xác nhận nhưng bị hủy, tồn kho được hoàn lại theo logic xử lý đơn hàng.",
    "- Size áo hoodie/tee chọn theo chiều cao, cân nặng và form mong muốn; giày chọn theo size đang đi hoặc chiều dài bàn chân; phụ kiện thường free-size.",
    "- Chatbot không xem được đơn riêng tư và không xử lý mật khẩu, OTP, thông tin thẻ ngân hàng.",
  ].join("\n");
}

function toHistoryContext(history: ChatHistoryMessage[] | undefined) {
  const lines = (history ?? [])
    .filter((item) => item.role && item.content?.trim())
    .slice(-8)
    .map((item) => `${item.role === "user" ? "Khách" : "DOTUS Stylist"}: ${item.content!.trim()}`);

  return lines.length ? lines.join("\n") : "Chưa có ngữ cảnh hội thoại trước đó.";
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
  const intent = detectIntent(message);

  if (intent === "greeting") {
    return [
      "Chào bạn, mình là DOTUS Stylist.",
      "Mình có thể giúp bạn phối đồ theo ngân sách, tư vấn size, hướng dẫn đặt hàng hoặc tra cứu đơn.",
      "Bạn muốn mình tư vấn outfit cho dịp nào hôm nay?",
    ].join("\n");
  }

  if (intent === "order") {
    return [
      "Bạn kiểm tra đơn theo 2 cách:",
      `1. Đăng nhập rồi vào trang tài khoản: ${origin}/dashboard`,
      "2. Nếu vừa đặt hàng, đơn sẽ bắt đầu ở trạng thái Chờ xử lý. Admin xác nhận xong thì trạng thái chuyển sang Đã xác nhận/Đang giao.",
      "",
      "Mình không xem được đơn riêng tư trong chat. Nếu bạn đang kẹt ở bước đặt hàng, thanh toán hay tra cứu đơn, nói rõ bước đó mình hướng dẫn tiếp.",
    ].join("\n");
  }

  if (intent === "payment") {
    return [
      "Quy trình thanh toán/đặt hàng của DOTUS:",
      "1. Chọn sản phẩm và size rồi thêm vào giỏ.",
      "2. Vào giỏ hàng, nhập tên, số điện thoại, địa chỉ nhận hàng.",
      "3. Chọn phương thức thanh toán/COD và xác nhận đặt hàng.",
      "4. Admin kiểm tra đơn. Khi đơn được xác nhận, hệ thống mới trừ tồn kho.",
      "",
      "Bạn không nên gửi mật khẩu, OTP hoặc thông tin thẻ ngân hàng trong chat.",
    ].join("\n");
  }

  if (intent === "size") {
    const sizeSuggestion = suggestTopSize(message);
    const hoodie = products.find((product) =>
      /hoodie/i.test(`${product.name} ${product.category}`),
    );

    if (sizeSuggestion) {
      return [
        `Với chiều cao ${sizeSuggestion.height}cm, cân nặng ${sizeSuggestion.weight}kg và kiểu mặc ${
          sizeSuggestion.wantsOversize ? "rộng/thoải mái" : "vừa người"
        }, mình nghiêng về size ${sizeSuggestion.size} cho hoodie/tee DOTUS.`,
        "",
        "Lưu ý:",
        "- Nếu vai rộng hoặc thích layer áo trong, giữ size gợi ý.",
        "- Nếu thích gọn người hơn, giảm 1 size.",
        "- Khi đặt hàng, bạn vẫn nên kiểm tra tồn kho size ở trang sản phẩm.",
        hoodie ? `Gợi ý hoodie đang bán: ${hoodie.name} - ${formatCurrency(hoodie.price)} - ${productLink(hoodie, origin)}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }

    return [
      "Mình tư vấn size được, nhưng cần thêm chiều cao và cân nặng của bạn.",
      "Gợi ý nhanh: hoodie/tee nếu thích form rộng thì tăng 1 size; nếu thích vừa người thì chọn size thường mặc. Giày nên chọn theo size sneaker bạn đang đi thoải mái nhất hoặc chiều dài bàn chân.",
      "",
      "Bạn gửi ví dụ: “nam 1m70 62kg muốn mặc hoodie rộng” là mình chốt size sát hơn.",
    ].join("\n");
  }

  const budget = parseBudget(message);
  const sizeSuggestion = suggestTopSize(message);
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
      `${index + 1}. ${product.name} - ${formatCurrency(product.price)} - ${productLink(product, origin)}`,
  );

  return [
    "Mình gợi ý nhanh theo sản phẩm đang còn hàng trong DOTUS:",
    "",
    "Set đề xuất:",
    ...lines,
    "",
    `Tổng tạm tính: ${formatCurrency(total)}${budget ? ` / ngân sách khoảng ${formatCurrency(budget)}` : ""}.`,
    wantsColdWeather
      ? "Lý do: ưu tiên item giữ ấm, màu dễ phối và hợp thời tiết se lạnh."
      : "Lý do: set dễ mặc hằng ngày, có thể phối lại từng món với đồ sẵn có.",
    sizeSuggestion
      ? `Với ${sizeSuggestion.height}cm/${sizeSuggestion.weight}kg, hoodie/tee nên thử size ${sizeSuggestion.size} nếu muốn ${sizeSuggestion.wantsOversize ? "form rộng" : "vừa người"}.`
      : "Bạn cho mình thêm chiều cao/cân nặng, màu giày đang có và dịp mặc, mình sẽ tinh chỉnh set sát hơn.",
  ].join("\n");
}

function buildStylistPrompt({
  message,
  catalogContext,
  storeKnowledge,
  historyContext,
  intent,
}: {
  message: string;
  catalogContext: string;
  storeKnowledge: string;
  historyContext: string;
  intent: string;
}) {
  return [
    "Bạn là DOTUS Stylist, trợ lý tư vấn bán hàng cho website streetwear DOTUS.",
    "Mục tiêu: giúp khách chọn sản phẩm, phối outfit, hiểu size, đặt hàng, tra cứu đơn và thanh toán rõ ràng.",
    "Phong cách: tiếng Việt có dấu, thân thiện, chắc ý, không dài dòng.",
    "Nguyên tắc bắt buộc:",
    "- Chỉ gợi ý sản phẩm có trong catalog/sản phẩm liên quan bên dưới. Không bịa tên, giá, tồn kho hoặc khuyến mãi.",
    "- Khi gợi ý sản phẩm, ghi tên, giá, lý do chọn và link sản phẩm.",
    "- Nếu hỏi outfit, ưu tiên set 2-4 món, tổng tiền tạm tính và lý do phối.",
    "- Nếu hỏi size, hỏi thêm chiều cao/cân nặng khi thiếu dữ liệu, nhưng vẫn đưa hướng dẫn tạm thời.",
    "- Nếu hỏi đơn hàng riêng tư, hướng dẫn khách đăng nhập vào trang tài khoản/tra cứu đơn; không đoán trạng thái đơn.",
    "- Không yêu cầu mật khẩu, OTP, thông tin thẻ ngân hàng.",
    "- Nếu không chắc, nói rõ phần nào là gợi ý tham khảo.",
    "- Kết thúc bằng một câu hỏi tiếp theo ngắn nếu cần thêm thông tin.",
    "",
    `Ý định dự đoán: ${intent}`,
    "",
    storeKnowledge,
    "",
    "Catalog/sản phẩm liên quan đang bán:",
    catalogContext,
    "",
    "Ngữ cảnh hội thoại gần đây:",
    historyContext,
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

function isCompleteAnswer(answer: string, intent: string) {
  const trimmed = answer.trim();

  if (trimmed.length < 80) {
    return false;
  }

  if (intent === "styling" && !trimmed.includes("/product/")) {
    return false;
  }

  return /[.!?)]$/.test(trimmed);
}

async function callGemini(apiKey: string, prompt: string, model: string) {
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
          temperature: 0.45,
          topP: 0.9,
          maxOutputTokens: 1800,
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
  const { message, history } = (await request.json()) as {
    message?: string;
    history?: ChatHistoryMessage[];
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const origin = getRequestOrigin(request);
  const intent = detectIntent(message);
  let products: StylistProduct[] = [];
  let catalogContext =
    "Không đọc được catalog lúc này. Hãy trả lời như stylist và nói rõ đây là gợi ý tham khảo.";

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id,slug,name,description,price,category,line,gender,stock")
      .eq("is_active", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(40);

    products = ((data ?? []) as StylistProduct[])
      .filter((product) => !/^(qa hoodie|smoke test hoodie)/i.test(product.name))
      .slice(0, 30);

    const relevantProducts = pickRelevantProducts(message, products);
    catalogContext = toCatalogContext(
      relevantProducts.length ? relevantProducts : products.slice(0, 16),
      origin,
    );
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

  const prompt = buildStylistPrompt({
    message,
    catalogContext,
    storeKnowledge: toStoreKnowledge(origin),
    historyContext: toHistoryContext(history),
    intent,
  });
  const models = [
    process.env.GEMINI_MODEL || "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
  ];
  let answer = "";

  for (const model of Array.from(new Set(models))) {
    answer = await callGemini(apiKey, prompt, model);
    if (isCompleteAnswer(answer, intent)) {
      break;
    }
  }

  if (!isCompleteAnswer(answer, intent)) {
    answer = fallbackStylistAnswer(message, products, origin);
  }

  return new Response(encoder.encode(answer), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
