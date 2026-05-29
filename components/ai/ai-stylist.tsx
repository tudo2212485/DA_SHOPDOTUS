"use client";

import { FormEvent, useState } from "react";
import { Bot, RefreshCcw, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "Phối set đi Đà Lạt cuối tuần",
  "Set đi học dưới 900 nghìn",
  "Đi cafe tối nên mặc gì?",
];

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Mình là DOTUS Stylist. Hãy nói dịp mặc, thời tiết, ngân sách hoặc màu bạn thích, mình sẽ gợi ý set từ sản phẩm còn hàng trong shop.",
  },
];

export function AIStylist() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();

    if (!message || loading) {
      return;
    }

    setInput("");
    setLoading(true);
    setMessages((current) => [
      ...current,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/ai-stylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.body) {
        throw new Error("Missing response stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) => {
          const next = [...current];
          const lastMessage = next[next.length - 1];
          next[next.length - 1] = {
            ...lastMessage,
            content: `${lastMessage.content}${chunk}`,
          };
          return next;
        });
      }
    } catch {
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = {
          role: "assistant",
          content: "Mình chưa trả lời được lúc này. Hãy thử lại sau.",
        };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(input);
  }

  function resetChat() {
    if (loading) return;
    setMessages(initialMessages);
    setInput("");
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
      {open ? (
        <section className="flex h-[min(640px,calc(100vh-2rem))] w-[min(calc(100vw-1rem),420px)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
          <header className="border-b border-neutral-200 bg-neutral-950 px-4 py-3 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">DOTUS Stylist</h2>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                      Gemini + Catalog
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-neutral-300">
                    Gợi ý outfit theo sản phẩm còn hàng, ngân sách và dịp mặc.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-300 hover:bg-white/10 hover:text-white"
                  aria-label="Lam moi doan chat"
                  onClick={resetChat}
                  disabled={loading}
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-300 hover:bg-white/10 hover:text-white"
                  aria-label="Dong AI Stylist"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </header>

          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
                  disabled={loading}
                  onClick={() => void sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f7f5] px-4 py-4 text-sm">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-lg px-3.5 py-2.5 leading-6 shadow-sm",
                    message.role === "user"
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 bg-white text-neutral-900",
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content || (
                      <span className="inline-flex items-center gap-2 text-neutral-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                        Đang đọc catalog và phối set...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-neutral-200 bg-white p-3"
          >
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ví dụ: set đi học dưới 900 nghìn..."
                disabled={loading}
                className="h-11 border-neutral-300 bg-white"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Gui tin nhan"
                disabled={loading || !input.trim()}
                className="h-11 w-11 shrink-0 bg-neutral-950 hover:bg-neutral-800"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-neutral-500">
              Gợi ý AI mang tính tham khảo. Kiểm tra size, tồn kho và giá tại trang sản phẩm trước khi đặt hàng.
            </p>
          </form>
        </section>
      ) : (
        <Button
          type="button"
          size="icon"
          className="group h-14 w-14 rounded-full bg-neutral-950 shadow-2xl shadow-neutral-950/30 hover:bg-neutral-800"
          aria-label="Mo AI Stylist"
          onClick={() => setOpen(true)}
        >
          <Bot className="h-5 w-5 transition group-hover:scale-110" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
