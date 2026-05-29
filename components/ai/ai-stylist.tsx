"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function AIStylist() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Cần mình phối set nào hôm nay?",
    },
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

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

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="flex h-[440px] w-[min(calc(100vw-2.5rem),360px)] flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
              <Bot className="h-4 w-4" aria-hidden="true" />
              AI Stylist
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Dong AI Stylist"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-white px-3 py-2 text-neutral-950"
                    : "mr-auto max-w-[85%] whitespace-pre-wrap rounded-lg bg-neutral-900 px-3 py-2 text-neutral-100"
                }
              >
                {message.content || "Đang gợi ý..."}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-neutral-800 p-3"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Set đồ đi Đà Lạt..."
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Gui tin nhan"
              disabled={loading}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      ) : (
        <Button
          type="button"
          size="icon"
          className="h-12 w-12 rounded-full shadow-2xl"
          aria-label="Mo AI Stylist"
          onClick={() => setOpen(true)}
        >
          <Bot className="h-5 w-5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
