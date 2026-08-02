# Deployment Guide — Vercel & MongoDB Atlas

1. **Crear Proyecto en Vercel**: Vincula el repositorio de GitHub.
2. **Configurar Variables de Entorno en Vercel**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `AI_PROVIDER="google"`
3. **Ejecutar Deploy**: `git push origin main` o `vercel --prod`.
4. **Sembrar Base de Datos Inicial**: Visita `https://tu-app.vercel.app/api/seed` en tu navegador para inicializar los usuarios y catálogo por defecto.
