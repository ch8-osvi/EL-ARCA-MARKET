# AI Architecture & Determinism — El Arca Market

## Principio de Determinismo
La Inteligencia Artificial NUNCA realiza estimaciones o cálculos numéricos por cuenta propia. Toda respuesta financiera o de inventario presentada al usuario procede de servicios probados en MongoDB.

```
Usuario: "¿Hazme el cuadre del día?"
   │
   ▼
[ Gemini API (SDK Vercel AI) ] ── (Tool Call) ──> [ get_daily_summary() ]
                                                         │
   ┌─────────────────────────────────────────────────────┘
   ▼
[ reportService.ts (MongoDB Aggregate) ]
   │
   ▼ (Respuesta Determinista)
[ Gemini API ] ── (Formatea respuesta en español claro) ──> Usuario
```
