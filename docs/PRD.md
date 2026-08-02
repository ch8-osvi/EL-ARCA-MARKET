# Product Requirements Document (PRD) — El Arca Market

## 1. Visión General del Producto
**El Arca Market — Gestión Inteligente** es una plataforma web integral diseñada para optimizar las operaciones comerciales de tiendas de abarrotes, víveres y minimarkets. Integra gestión de inventario, punto de venta (POS), control de caja diario, analítica comercial y un asistente de Inteligencia Artificial determinista.

---

## 2. Objetivos Principales
- Registrar ventas con respuesta visual instantánea (< 200ms) y protección de idempotencia.
- Mantener un kardex inmutable de cada movimiento de existencias.
- Realizar el cuadre diario de caja comparando el efectivo contado físicamente contra el efectivo esperado.
- Permitir consultas en lenguaje natural mediante el Asistente IA de El Arca, garantizando que el 100% de los datos provengan de agregaciones deterministas en el backend.

---

## 3. Perfiles de Usuario (RBAC)
- **Administrador**: Acceso total, gestión de usuarios, configuración comercial, auditoría y re-apertura de cajas.
- **Encargado / Supervisor**: Recepción de mercancía, consulta de reportes de ventas, apertura y cierre de caja, uso de IA.
- **Cajero / Vendedor**: Registro de ventas en POS, consulta de existencia de productos y apertura/cierre de su propia caja.
