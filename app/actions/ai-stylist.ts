"use server";

const systemPrompt = `You are an AI stylist for a Vietnamese streetwear ecommerce store.
Recommend practical outfits using hoodies, boxy tees, cargo pants, denim and low-top sneakers.
Keep the answer concise, specific and easy to shop.`;

export async function askAIStylist(message: string) {
  if (!message.trim()) {
    return "Hay noi minh biet ban muon mac di dau, thoi tiet va mau giay ban co.";
  }

  if (!process.env.OPENAI_API_KEY) {
    return [
      "Goi y nhanh:",
      "- Hoodie oversize mau xam hoac den.",
      "- Ao thun boxy trang lam layer ben trong.",
      "- Quan cargo olive hoac denim washed ong rong.",
      "- Giay low-top den, tat trang co ngan.",
      "- Them beanie hoac tui cheo neu di Da Lat buoi toi.",
    ].join("\n");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return "AI Stylist dang ban. Hay thu lai sau it phut.";
  }

  const data = await response.json();
  return (
    data.choices?.[0]?.message?.content ??
    "Minh chua co goi y phu hop cho yeu cau nay."
  );
}

export async function streamAIStylist(message: string) {
  if (!process.env.OPENAI_API_KEY) {
    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            "Goi y: hoodie oversize den, tee trang, cargo olive va giay low-top den. Neu di Da Lat, them jacket mong va beanie.",
          ),
        );
        controller.close();
      },
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok || !response.body) {
    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("AI Stylist dang ban. Hay thu lai sau."));
        controller.close();
      },
    });
  }

  return response.body;
}
