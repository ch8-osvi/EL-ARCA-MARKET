# Architecture Document — El Arca Market

## 1. Visión General de la Arquitectura
El sistema adopta una arquitectura modular por dominios de negocio basada en **Next.js 15 (App Router)**, **TypeScript**, **MongoDB Atlas (Mongoose ODM)** y **Vercel AI SDK (Google Gemini API)**.

```
[ Cliente Web / PWA ] <---> [ Next.js App Router API Routes ]
                                  |
                                  +---> [ Deterministic Services Layer ] <---> [ MongoDB Atlas ]
                                  |
                                  +---> [ Vercel AI SDK / Gemini Engine ]
```

---

## 2. Componentes de la Arquitectura
1. **Presentación (React Server & Client Components)**:
   - Client Components aislados únicamente para interactividad en tiempo real (POS, Chat, Modales).
   - Componentes accesibles diseñados con Tailwind CSS y Lucide React.
2. **Servicios de Negocio Deterministas (`src/server/services/`)**:
   - `posService.ts`: Transacción de ventas en MongoDB, deducción de stock y creación de kardex.
   - `inventoryService.ts`: Ajustes de inventario y recepciones de compras con costo promedio ponderado.
   - `cashService.ts`: Gestión de turnos de caja y cuadre de efectivo.
   - `reportService.ts`: Agregaciones de ventas, rentabilidad, anomalías y recomendaciones.
3. **Capa de Inteligencia Artificial (`src/lib/ai/`)**:
   - Abstracción de proveedor (`provider.ts`) para alternar entre Gemini y OpenAI mediante `.env`.
   - Herramientas validadas con Zod (`tools/index.ts`) que consumen directamente los servicios deterministas.
