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

type StylistIntent = "greeting" | "styling" | "purchase" | "order" | "size" | "payment" | "general";

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

function detectIntent(message: string): StylistIntent {
  const lower = message.toLowerCase();

  if (/^(hi|hello|hey|chào|chao|xin chào|alo|ê|e|bạn ơi|ban oi)[\s!.?]*$/i.test(lower.trim())) {
    return "greeting";
  }

  if (/(mua|đặt mua|dat mua|lấy|lay|chốt|chot|thêm vào giỏ|them vao gio|add to cart|checkout)/i.test(lower)) {
    return "purchase";
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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
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

function sanitizeAssistantAnswer(answer: string) {
  return answer
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+-\s*$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

function tokenize(value: string) {
  return toPlainSearchText(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);
}

function findProductByMention(message: string, products: StylistProduct[]) {
  const normalizedMessage = toPlainSearchText(message);
  const numberMatch = normalizedMessage.match(/\b(?:so|mau|mon|cai)\s*(\d{1,2})\b|\b(\d{1,2})\b/);
  const mentionedNumber = numberMatch ? Number(numberMatch[1] ?? numberMatch[2]) : null;

  if (mentionedNumber && products[mentionedNumber - 1]) {
    return products[mentionedNumber - 1];
  }

  const scored = products
    .map((product) => {
      const productName = toPlainSearchText(product.name);
      const productWords = tokenize(product.name);
      const matchedWords = productWords.filter((word) => normalizedMessage.includes(word));
      const exactScore = normalizedMessage.includes(productName) ? 100 : 0;
      return {
        product,
        score: exactScore + matchedWords.length * 12 + matchedWords.join("").length,
      };
    })
    .filter((item) => item.score >= 24)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.product ?? null;
}

function findProductByHistoryNumber(message: string, products: StylistProduct[], history?: ChatHistoryMessage[]) {
  const normalizedMessage = toPlainSearchText(message);
  const numberMatch = normalizedMessage.match(/\b(?:so|mau|mon|cai)\s*(\d{1,2})\b|\b(\d{1,2})\b/);
  const mentionedNumber = numberMatch ? Number(numberMatch[1] ?? numberMatch[2]) : null;

  if (!mentionedNumber) return null;

  const lastAssistant = [...(history ?? [])]
    .reverse()
    .find((item) => item.role === "assistant" && item.content?.trim());

  if (!lastAssistant?.content) return null;

  const orderedProducts = lastAssistant.content
    .split(/\r?\n/)
    .map((line) => {
      const lineNumber = line.match(/^\s*(\d{1,2})\.\s*(.+?)(?:\s+-\s+|$)/);
      if (!lineNumber) return null;
      const productName = toPlainSearchText(lineNumber[2]);
      const product = products.find((item) => productName.includes(toPlainSearchText(item.name)));
      return product ? { order: Number(lineNumber[1]), product } : null;
    })
    .filter(Boolean) as Array<{ order: number; product: StylistProduct }>;

  return orderedProducts.find((item) => item.order === mentionedNumber)?.product ?? null;
}

function purchaseAnswer(message: string, products: StylistProduct[], history?: ChatHistoryMessage[]) {
  const historyProducts = products.filter((product) => {
    const productName = toPlainSearchText(product.name);
    return (history ?? []).some((item) =>
      item.role === "assistant" && toPlainSearchText(item.content ?? "").includes(productName),
    );
  });
  const product =
    findProductByHistoryNumber(message, products, history) ??
    findProductByMention(message, products) ??
    findProductByMention(message, historyProducts) ??
    historyProducts[0] ??
    null;

  if (!product) {
    return [
      "Được, bạn muốn mua mẫu nào trong set?",
      "Bạn gõ đúng tên sản phẩm, ví dụ: “mình muốn mua Boxy Tee Core White”, mình sẽ hướng dẫn nhanh bước đặt hàng.",
    ].join("\n");
  }

  const stock = product.stock ?? 0;
  const sizeSuggestion = suggestTopSize(message);

  return [
    `Mẫu bạn chọn: ${product.name}`,
    `Giá: ${formatCurrency(product.price)}`,
    `Tình trạng: ${stock > 0 ? `còn ${stock} sản phẩm` : "đang hết hàng"}.`,
    "",
    stock > 0
      ? [
          "Cách mua nhanh:",
          "1. Tìm sản phẩm theo đúng tên trên trang sản phẩm.",
          "2. Chọn size phù hợp rồi bấm Thêm vào giỏ.",
          "3. Vào giỏ hàng, nhập thông tin nhận hàng và xác nhận đặt hàng.",
        ].join("\n")
      : "Mẫu này đang hết hàng, bạn nên chọn mẫu khác còn tồn trong shop.",
    sizeSuggestion
      ? `Với số đo bạn đưa, mình nghiêng về size ${sizeSuggestion.size}.`
      : "Nếu bạn gửi chiều cao/cân nặng, mình tư vấn size sát hơn trước khi bạn đặt.",
  ].join("\n");
}

function productMatches(product: StylistProduct, patterns: RegExp[]) {
  const text = `${product.name} ${product.category ?? ""} ${product.line ?? ""}`;
  return patterns.some((pattern) => pattern.test(text));
}

function chooseOutfitProducts(message: string, products: StylistProduct[], budget: number | null) {
  const lower = toPlainSearchText(message);
  const wantsColdWeather = /(da lat|lanh|mua|se lanh|layer|hoodie)/i.test(lower);
  const wantsSchool = /(di hoc|truong|lop|daily|hang ngay)/i.test(lower);
  const wantsCafe = /(cafe|ca phe|hen ho|toi|di choi)/i.test(lower);

  const groups: RegExp[][] = wantsColdWeather
    ? [
        [/hoodie|jacket/i],
        [/tee|t-shirt|shirt/i],
        [/pants|cargo|short|quan/i],
        [/beanie|cap|bag|backpack/i],
      ]
    : wantsSchool
      ? [
          [/tee|t-shirt|shirt/i],
          [/pants|cargo|short|quan/i],
          [/sneaker|giay/i],
          [/bag|backpack|cap/i],
        ]
      : wantsCafe
        ? [
            [/shirt|tee|t-shirt|hoodie/i],
            [/pants|cargo|short|quan/i],
            [/sneaker|giay/i],
            [/bag|cap|beanie/i],
          ]
        : [
            [/tee|t-shirt|shirt|hoodie/i],
            [/pants|cargo|short|quan/i],
            [/sneaker|giay/i],
            [/bag|cap|beanie/i],
          ];

  const picked: StylistProduct[] = [];
  let total = 0;

  for (const group of groups) {
    const candidates = products
      .filter((product) => !picked.some((item) => item.id === product.id))
      .filter((product) => productMatches(product, group))
      .sort((a, b) => {
        const aUnder = budget ? total + a.price <= budget : true;
        const bUnder = budget ? total + b.price <= budget : true;
        if (aUnder !== bUnder) return aUnder ? -1 : 1;
        return a.price - b.price;
      });

    const candidate = candidates[0];
    if (!candidate) continue;
    if (budget && picked.length >= 2 && total + candidate.price > budget) continue;
    picked.push(candidate);
    total += candidate.price;
    if (picked.length >= 4) break;
  }

  if (picked.length < 2) {
    for (const product of products.sort((a, b) => a.price - b.price)) {
      if (picked.some((item) => item.id === product.id)) continue;
      if (budget && picked.length > 0 && total + product.price > budget) continue;
      picked.push(product);
      total += product.price;
      if (picked.length >= 3) break;
    }
  }

  return { picked, total, wantsColdWeather, wantsSchool, wantsCafe };
}

function pickRelevantProducts(message: string, products: StylistProduct[]) {
  const lower = toPlainSearchText(message);
  const budget = parseBudget(message);
  const wantsSchool = /(di hoc|truong|lop|daily|hang ngay)/i.test(lower);
  const wantsCafe = /(cafe|ca phe|toi|hen ho|di choi)/i.test(lower);
  const wantsColdWeather = /(da lat|lanh|mua|se lanh|cuoi tuan)/i.test(lower);
  const wantsMinimal = /(toi gian|basic|de phoi|lich su|gon)/i.test(lower);
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
        (wantsColdWeather && /hoodie|jacket|beanie/i.test(productText) ? 5 : 0) +
        (wantsSchool && /tee|t-shirt|cargo|pants|sneaker|backpack/i.test(productText) ? 3 : 0) +
        (wantsCafe && /shirt|tee|sneaker|bag|cap|beanie/i.test(productText) ? 3 : 0) +
        (wantsMinimal && /basic|logo|neutral|grey|black|white|sand/i.test(productText) ? 3 : 0) +
        (/giay|sneaker/.test(lower) && /sneaker/i.test(productText) ? 4 : 0) +
        (/quan|cargo|pants|short/.test(lower) && /(pants|short|cargo)/i.test(productText) ? 4 : 0) +
        (/phu kien|mu|tui|cap|bag/.test(lower) && /(cap|bag|accessories)/i.test(productText) ? 4 : 0);

      return { product, score };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 12)
    .map((item) => item.product);
}

function toCatalogContext(products: StylistProduct[]) {
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
      ];

      if (product.description) {
        fields.push(`mô tả ${product.description.slice(0, 140)}`);
      }

      return fields.join(" | ");
    })
    .join("\n");
}

function toStoreKnowledge() {
  return [
    "Kiến thức vận hành DOTUS:",
    "- Trang sản phẩm dùng để xem catalog, lọc sản phẩm và kiểm tra tồn kho.",
    "- Giỏ hàng dùng để xem sản phẩm đã chọn, nhập thông tin nhận hàng và đặt đơn.",
    "- Trang tài khoản/lịch sử đơn hàng dùng để xem trạng thái đơn và hóa đơn.",
    "- Khách chọn sản phẩm, chọn size, thêm vào giỏ, nhập tên người nhận, số điện thoại, địa chỉ, ghi chú và phương thức thanh toán.",
    "- Đơn mới ở trạng thái Chờ xử lý. Khi admin xác nhận thanh toán/COD, đơn sang Đã xác nhận và hệ thống mới trừ tồn kho.",
    "- Nếu đơn đã xác nhận nhưng bị hủy, tồn kho được hoàn lại theo logic xử lý đơn hàng.",
    "- Size áo hoodie/tee chọn theo chiều cao, cân nặng và form mong muốn; giày chọn theo size đang đi hoặc chiều dài bàn chân; phụ kiện thường free-size.",
    "- Chatbot không xem được đơn riêng tư và không xử lý mật khẩu, OTP, thông tin thẻ ngân hàng.",
    "- Khi gợi ý outfit, không gửi đường link. Khách tự tìm sản phẩm theo tên trên website.",
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

function fallbackStylistAnswer(message: string, products: StylistProduct[], origin: string, history?: ChatHistoryMessage[]) {
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
      "1. Đăng nhập rồi vào trang tài khoản/lịch sử đơn hàng.",
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

  if (intent === "purchase") {
    return purchaseAnswer(message, products, history);
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
        hoodie ? `Gợi ý hoodie đang bán: ${hoodie.name} - ${formatCurrency(hoodie.price)}` : "",
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
    lower.includes("se lạnh");

  const activeProducts = products
    .filter((product) => (product.stock ?? 0) > 0)
    .sort((a, b) => {
      const aCold = /hoodie|jacket/i.test(`${a.name} ${a.category} ${a.line}`);
      const bCold = /hoodie|jacket/i.test(`${b.name} ${b.category} ${b.line}`);
      if (wantsColdWeather && aCold !== bCold) return aCold ? -1 : 1;
      return a.price - b.price;
    });

  const { picked, total, wantsSchool, wantsCafe } = chooseOutfitProducts(message, activeProducts, budget);

  if (!picked.length) {
    return "Mình chưa thấy sản phẩm còn hàng phù hợp trong catalog. Bạn thử tăng ngân sách hoặc quay lại sau khi shop nhập thêm hàng nhé.";
  }

  const lines = picked.map(
    (product, index) =>
      `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`,
  );

  return [
    "Mình gợi ý nhanh theo sản phẩm đang còn hàng trong DOTUS:",
    "",
    "Set đề xuất:",
    ...lines,
    "",
    `Tổng tạm tính: ${formatCurrency(total)}${budget ? ` / ngân sách khoảng ${formatCurrency(budget)}` : ""}.`,
    wantsColdWeather
      ? "Lý do: ưu tiên item giữ ấm, dễ layer và vẫn gọn khi đi chơi cuối tuần."
      : wantsSchool
        ? "Lý do: set gọn, dễ vận động, đủ lịch sự để đi học và dùng lại hằng ngày."
        : wantsCafe
          ? "Lý do: set vừa chỉn chu vừa thoải mái, màu dễ phối cho buổi cafe hoặc đi chơi tối."
          : "Lý do: set dễ mặc hằng ngày, có thể phối lại từng món với đồ sẵn có.",
    sizeSuggestion
      ? `Với ${sizeSuggestion.height}cm/${sizeSuggestion.weight}kg, hoodie/tee nên thử size ${sizeSuggestion.size} nếu muốn ${sizeSuggestion.wantsOversize ? "form rộng" : "vừa người"}.`
      : "Bạn cho mình thêm chiều cao/cân nặng, màu giày đang có và dịp mặc, mình sẽ tinh chỉnh set sát hơn.",
  ].join("\n");
}

function buildStylistPrompt({
  message,
  catalogContext,
  outfitHint,
  storeKnowledge,
  historyContext,
  intent,
}: {
  message: string;
  catalogContext: string;
  outfitHint: string;
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
    "- Tuyệt đối không ghi URL, link, slug, mã id sản phẩm hoặc markdown link trong câu trả lời.",
    "- Khi gợi ý sản phẩm, mỗi dòng chỉ ghi: Tên sản phẩm - Giá. Không thêm link sau giá.",
    "- Nếu hỏi outfit, ưu tiên set 2-4 món, tổng tiền tạm tính, lý do phối ngắn gọn và có cân đối ngân sách.",
    "- Không bắt đầu set bằng phụ kiện như mũ/túi nếu vẫn có áo hoặc hoodie phù hợp. Phụ kiện chỉ là món bổ sung sau áo/quần/giày.",
    "- Nếu ngân sách thấp, chọn ít món quan trọng trước; nếu vượt ngân sách, nói rõ vượt bao nhiêu và đề xuất giảm món nào.",
    "- Suy luận theo dịp mặc: đi học cần gọn, thoải mái; đi Đà Lạt cần giữ ấm/layer; đi cafe tối cần chỉn chu; đi chơi cần dễ vận động.",
    "- Phối màu có chủ ý: ưu tiên 2-3 màu chính, tránh set quá rối. Nói ngắn vì sao các món hợp nhau.",
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
    "Set đề xuất từ hệ thống nếu phù hợp với câu hỏi:",
    outfitHint,
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

  if (intent === "styling" && !/\d[\d.,]*\s*₫|VND/i.test(trimmed)) {
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
  let outfitHint = "Chưa đủ dữ liệu để đề xuất set cố định. Hãy tự chọn từ catalog theo nguyên tắc phối đồ.";

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
    catalogContext = toCatalogContext(relevantProducts.length ? relevantProducts : products.slice(0, 16));
    if (intent === "styling" || intent === "general") {
      const { picked, total } = chooseOutfitProducts(message, products, parseBudget(message));
      if (picked.length) {
        outfitHint = [
          ...picked.map((product, index) => `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`),
          `Tổng tạm tính: ${formatCurrency(total)}`,
        ].join("\n");
      }
    }
  } catch {
    // Keep the chatbot available even if Supabase is temporarily unavailable.
  }

  if ((intent === "styling" || intent === "purchase") && products.length) {
    return new Response(encoder.encode(sanitizeAssistantAnswer(fallbackStylistAnswer(message, products, origin, history))), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const provider = process.env.AI_PROVIDER ?? "gemini";

  if (provider !== "gemini" || !apiKey) {
    return new Response(encoder.encode(sanitizeAssistantAnswer(fallbackStylistAnswer(message, products, origin, history))), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const prompt = buildStylistPrompt({
    message,
    catalogContext,
    outfitHint,
    storeKnowledge: toStoreKnowledge(),
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

  answer = sanitizeAssistantAnswer(answer);

  if (!isCompleteAnswer(answer, intent)) {
    answer = fallbackStylistAnswer(message, products, origin, history);
  }

  return new Response(encoder.encode(sanitizeAssistantAnswer(answer)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
