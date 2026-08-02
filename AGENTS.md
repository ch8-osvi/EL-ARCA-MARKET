# AGENTS.md — Guía para Agentes IA en El Arca Market

## Propósito del Proyecto
**El Arca Market — Gestión Inteligente** es un sistema web integral de gestión de inventario, punto de venta (POS), control y cuadre de caja diario, e Inteligencia Artificial conversacional determinista basada en Next.js (App Router), TypeScript, MongoDB Atlas (Mongoose) y Vercel AI SDK con Google Gemini API.

---

## Principio Fundamental de Confiabilidad
1. **Determinismo Absoluto**: La Inteligencia Artificial NUNCA inventa, estimación ni calcula por su cuenta valores contables, existencias, ganancias o cuadres de caja.
2. **Uso Exclusivo de Herramientas**: Todo dato presentado por la IA proviene del catálogo cerrado de herramientas en `src/lib/ai/tools/index.ts` que ejecutan agregaciones y transacciones de backend en MongoDB.
3. **Flujo de 2 Pasos para Acciones de Escritura**: La IA no puede modificar inventario ni caja directamente. Debe generar una propuesta estructurada (`propose_inventory_receipt`) que el usuario confirma expresamente en la interfaz mediante botón.

---

## Arquitectura de Código & Convenciones
- **Framework**: Next.js 15 (App Router, TypeScript estricto, React 19)
- **Estilos**: Tailwind CSS + CSS Variables (`src/app/globals.css`)
- **Base de Datos**: Mongoose ODM (`src/models/`). Utiliza siempre `connectDB()` de `src/lib/db/mongodb.ts` y `runInTransaction()` para escrituras de ventas e inventario.
- **Finanzas**: Usa `src/lib/money/index.ts` para cálculos de dinero evitando errores de coma flotante.

---

## Estructura de Directorios Clave
- `src/models/`: Esquemas de Mongoose (Product, Sale, CashSession, InventoryMovement, User, AuditLog, AIToolExecution).
- `src/server/services/`: Lógica determinista de negocio (posService, inventoryService, cashService, reportService).
- `src/lib/ai/`: Proveedores de IA (`provider.ts`), prompt de sistema (`systemPrompt.ts`), y herramientas de function calling (`tools/index.ts`).
- `src/app/api/`: Endpoint de Chat streaming (`/api/ai/chat`), POS, Productos, Caja y Autenticación.
- `src/app/(dashboard)/`: Páginas de interfaz de usuario en español.

---

## Comandos Principales
- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000`.
- `npm run typecheck`: Comprobación estricta de tipos de TypeScript.
- `npm run build`: Compilación de producción para Vercel.
- `npm run test`: Ejecuta la suite de pruebas unitarias y de integración (Vitest).

---

## Reglas Inviolables para Agentes Futuros
- NUNCA guardes claves API (`GEMINI_API_KEY`, `MONGODB_URI`, `JWT_SECRET`) en componentes del cliente ni con prefijos `NEXT_PUBLIC_`.
- NUNCA elimines silenciosamente registros históricos de ventas o movimientos de inventario (`InventoryMovement`). Toda corrección debe realizarse mediante un movimiento compensatorio auditado.
