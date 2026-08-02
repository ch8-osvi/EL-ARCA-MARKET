# Data Model Specification — El Arca Market

## Colecciones Principales en MongoDB Atlas

1. **`organizations`**: Empresas u organizaciones del sistema.
2. **`stores`**: Sucursales o puntos de venta físicos.
3. **`users`**: Administradores, supervisores y cajeros (contraseñas con hash bcrypt).
4. **`settings`**: Configuración comercial (moneda, horario de inicio, reglas de inventario).
5. **`categories`**: Clasificación del catálogo.
6. **`products`**: Productos del catálogo (SKU, barcode, precio, costo, existencias, minStock, controlType).
7. **`inventoryMovements`**: Kardex inmutable de movimientos de stock.
8. **`sales`**: Registro histórico de ventas con fotografía inmutable de productos, costos e importes al momento de cobrar.
9. **`cashSessions`**: Turnos de caja con fondo inicial, ventas en efectivo/tarjeta/transferencia, entradas/salidas manuales y cuadre (efectivo contado vs esperado).
10. **`cashMovements`**: Movimientos manuales de efectivo en caja.
11. **`expenses`**: Gastos operativos.
12. **`auditLogs`**: Registro de auditoría administrativa.
13. **`aiToolExecutions`**: Auditoría de ejecución de herramientas de IA.
