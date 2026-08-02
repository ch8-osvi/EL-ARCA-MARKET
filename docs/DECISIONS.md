# Architecture Decision Records (ADR) — El Arca Market

## ADR-001: Adopción de Vercel AI SDK y Google Gemini API
- **Fecha**: 2026-08-02
- **Decisión**: Utilizar Vercel AI SDK (`ai`) con `@ai-sdk/google` (Google Gemini API) como motor principal de IA.
- **Motivo**: Soporte nativo para streaming y function calling determinista con esquemas Zod en TypeScript.
- **Consecuencias**: Permite alternar fácilmente a OpenAI (`@ai-sdk/openai`) mediante variables de entorno en el futuro.

## ADR-002: Lógica Financiera Determinista en Backend
- **Fecha**: 2026-08-02
- **Decisión**: La IA nunca calcula cifras por su cuenta; consume agregaciones de Mongoose en MongoDB.
- **Motivo**: Prevenir alucinaciones o imprecisiones en valores contables y existencias de la tienda.
