"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  User,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PackageCheck,
  Zap,
} from "lucide-react";

export default function AIAssistantPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
    api: "/api/ai/chat",
    initialMessages: [
      {
        id: "welcome-1",
        role: "assistant",
        content:
          "¡Hola! Soy el **Asistente de Inteligencia Artificial de El Arca Market**. 👋\n\nPuedo consultar deterministamente las ventas, existencia de productos, cuadres de caja, detectar anomalías comerciales o sugerir compras de mercancía. ¿En qué puedo ayudarte hoy?",
      },
    ],
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
    <div className="h-[calc(100vh-100px)] max-w-5xl mx-auto flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-950">
            <Bot className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base flex items-center gap-2">
              Asistente El Arca
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                AI Agent Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400">Consultas deterministas en tiempo real</p>
          </div>
        </div>
      </div>

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
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-medium rounded-tr-none shadow-md"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-3"
                }`}
              >
                {/* Display Tool Executions Badges */}
                {m.toolInvocations && m.toolInvocations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {m.toolInvocations.map((toolCall) => (
                      <div
                        key={toolCall.toolCallId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>
                          {toolCall.state === "result"
                            ? `Ejecutado: ${toolCall.toolName}`
                            : `Consultando: ${toolCall.toolName}...`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs italic">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>Analizando datos deterministas del negocio...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInput(prompt)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Text Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe tu consulta en lenguaje natural (ej. Hazme el cuadre del día)..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all disabled:opacity-40"
        >
          <Send className="w-5 h-5 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
