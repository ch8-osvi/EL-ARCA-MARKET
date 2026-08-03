"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";

function AIAssistantChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [chatError, setChatError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading, reload } = useChat({
    api: "/api/ai/chat",
    initialMessages: [
      {
        id: "welcome-1",
        role: "assistant",
        content:
          "¡Hola! Soy el **Asistente de Inteligencia Artificial de El Arca Market**. 👋\n\nPuedo consultar deterministamente las ventas, existencia de productos, cuadres de caja, detectar anomalías comerciales o sugerir compras de mercancía. ¿En qué puedo ayudarte hoy?",
      },
    ],
    onError: (err) => {
      console.error("Error en Chat de IA:", err);
      setChatError(
        err.message || "Ocurrió un error al procesar tu consulta con la IA. Verifica que la API Key de Gemini esté configurada correctamente."
      );
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery, setInput]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Hazme el cuadre del día.",
    "¿Cuánto se vendió hoy y cuál fue la ganancia?",
    "¿Qué productos están próximos a agotarse?",
    "¿Hay algo extraño en las ventas de hoy?",
    "¿Qué productos me conviene comprar mañana?",
    "¿Cuánto dinero tengo invertido en inventario?",
  ];

  return (
    <div
      className={clsx(
        "h-[calc(100vh-100px)] max-w-5xl mx-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-colors duration-200",
        "bg-[hsl(var(--app-surface))] border-[hsl(var(--app-border))]"
      )}
    >
      {/* Assistant Header */}
      <div className="p-4 border-b flex items-center justify-between bg-[hsl(var(--app-surface-2))] border-[hsl(var(--app-border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg">
            <Bot className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base flex items-center gap-2 text-[hsl(var(--app-text))]">
              Asistente El Arca
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                IA Determinista Activa
              </span>
            </h1>
            <p className="text-xs text-[hsl(var(--app-text-muted))]">Consultas deterministas en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Error Alert if Gemini fails */}
      {chatError && (
        <div className="mx-4 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{chatError}</span>
          </div>
          <button
            onClick={() => {
              setChatError(null);
              reload();
            }}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reintentar
          </button>
        </div>
      )}

      {/* Messages Stream Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-medium rounded-tr-none shadow-md"
                    : "bg-[hsl(var(--app-bg))] border border-[hsl(var(--app-border))] text-[hsl(var(--app-text))] rounded-tl-none space-y-3"
                }`}
              >
                {m.toolInvocations && m.toolInvocations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {m.toolInvocations.map((toolCall) => (
                      <div
                        key={toolCall.toolCallId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>
                          {toolCall.state === "result"
                            ? `Ejecutado: ${toolCall.toolName}`
                            : `Consultando datos deterministas (${toolCall.toolName})...`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--app-surface-2))] border border-[hsl(var(--app-border))] text-[hsl(var(--app-text))] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-[hsl(var(--app-text-muted))] text-xs italic">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>Consultando base de datos determinista...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-3 border-t overflow-x-auto flex items-center gap-2 bg-[hsl(var(--app-surface-2))] border-[hsl(var(--app-border))]">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInput(prompt)}
            className="px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 bg-[hsl(var(--app-bg))] border-[hsl(var(--app-border))] text-[hsl(var(--app-text-muted))] hover:text-[hsl(var(--app-text))] hover:bg-[hsl(var(--app-hover))]"
          >
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Text Form */}
      <form
        onSubmit={(e) => {
          setChatError(null);
          handleSubmit(e);
        }}
        className="p-4 border-t flex items-center gap-3 bg-[hsl(var(--app-surface))] border-[hsl(var(--app-border))]"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe tu consulta (ej. Hazme el cuadre del día)..."
          className="flex-1 rounded-xl px-4 py-3 text-sm border focus:outline-none focus:border-emerald-500 transition-colors bg-[hsl(var(--app-bg))] border-[hsl(var(--app-border))] text-[hsl(var(--app-text))]"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-40"
        >
          <Send className="w-5 h-5 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[hsl(var(--app-text-muted))]">Cargando Asistente IA...</div>}>
      <AIAssistantChatContent />
    </Suspense>
  );
}
