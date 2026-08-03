import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI no está definida. Crea el archivo .env.local con tu URI de MongoDB Atlas. Consulta .env.example para ver el formato."
  );
}

// TypeScript guard: después del throw, MONGODB_URI es definitivamente string
const mongoUri: string = MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log("🟢 Conexión exitosa a MongoDB Atlas / El Arca Market");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("🔴 Error al conectar a MongoDB:", e);
    throw e;
  }

  return cached.conn;
}

/**
 * Ejecuta una operación dentro de una transacción de MongoDB con reintentos para errores transitorios.
 */
export async function runInTransaction<T>(
  action: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const db = await connectDB();
  const session = await db.startSession();
  try {
    session.startTransaction();
    const result = await action(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
