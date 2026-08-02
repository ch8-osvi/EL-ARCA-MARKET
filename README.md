# El Arca Market — Gestión Inteligente & Punto de Venta

Sistema web profesional e inteligente para la gestión integral de inventario, punto de venta (POS), control de caja diario, reportes de rentabilidad y Asistente de IA determinista basado en Google Gemini API.

---

## 🚀 Características Principales

1. **Punto de Venta (POS) Ultra Rápido**:
   - Búsqueda instantánea por Nombre, SKU y Código de Barras.
   - Cálculo automático de cambio y protección contra doble cobro (Idempotencia).
   - Generación de recibo digital e integración de métodos de pago (Efectivo, Tarjeta, Transferencia).

2. **Gestión de Inventario & Kardex Inmutable**:
   - Registro inmutable de cada movimiento de entrada/salida de stock.
   - Costeo por Promedio Ponderado.
   - Alertas automáticas de inventario bajo y próximo a agotarse.

3. **Control & Cuadre de Caja Diario**:
   - Apertura de turno con fondo inicial.
   - Registro de entradas y salidas manuales de efectivo.
   - Cuadre de caja (Efectivo Esperado vs. Efectivo Físico Contado) con alerta de diferencias.

4. **Asistente de IA Conversacional (Gemini API / Vercel AI SDK)**:
   - Responde preguntas en lenguaje natural ("Hazme el cuadre del día", "¿Qué productos están próximos a agotarse?").
   - **Garantía de Confiabilidad**: La IA utiliza function calling para consultar datos deterministas calculados por el backend en MongoDB. Nunca inventa ni calcula cifras financieras mentalmente.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 15 (App Router, TypeScript estricto, React 19)
- **Base de Datos**: MongoDB Atlas con Mongoose ODM (Transacciones ACID y conexiones serverless)
- **Inteligencia Artificial**: Vercel AI SDK (`ai`), `@ai-sdk/google` (Google Gemini API) y `@ai-sdk/openai`
- **Estilos**: Tailwind CSS con Modo Oscuro/Claro y diseño responsivo PWA

---

## 📦 Instalación & Configuración

```bash
# 1. Clonar o ingresar al directorio del proyecto
cd "EL ARCA MARKET"

# 2. Copiar el archivo de variables de entorno de ejemplo
cp .env.example .env.local

# 3. Configurar tu clave de Gemini y conexión MongoDB en .env.local
# MONGODB_URI="mongodb+srv://..."
# GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Ingresa a `http://localhost:3000` en tu navegador.

---

## 👥 Credenciales de Prueba (Demo)

- **Administrador**: `admin@elarcamarket.com` / `Admin123!`
- **Supervisor**: `supervisor@elarcamarket.com` / `Super123!`
- **Cajero**: `cajero@elarcamarket.com` / `Cajero123!`
