# Security Architecture — El Arca Market

- **Hasheo de Contraseñas**: bcrypt con 10 rondas de salt.
- **Autenticación**: Tokens JWT firmados con clave secreta del servidor.
- **Aislamiento de Secretos**: Ningún secreto (`MONGODB_URI`, `GEMINI_API_KEY`, `JWT_SECRET`) utiliza prefijo `NEXT_PUBLIC_`.
- **Sanitización de IA**: La IA solo consume herramientas internas autorizadas y no puede ejecutar código o consultas arbitrarias a la base de datos.
- **RBAC**: Permisos granulares aplicados en la capa de servicios de dominio.
