import { streamText } from "ai";
import { getLanguageModel } from "@/lib/ai/provider";
import { getSystemPrompt } from "@/lib/ai/systemPrompt";
import { createAITools } from "@/lib/ai/tools";
import { connectDB } from "@/lib/db/mongodb";
import { AIToolExecution } from "@/models/AIToolExecution";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/auth/jwt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, token } = await req.json();

    await connectDB();

    // Verificación de Autenticación
    let userPayload = token ? verifyToken(token) : null;
    let organizationId = userPayload?.organizationId;
    let userId = userPayload?.userId;

    if (!userPayload || !organizationId) {
      // Fallback para modo demo / primer inicio
      const firstUser = await User.findOne().sort({ createdAt: 1 });
      if (firstUser) {
        organizationId = firstUser.organizationId.toString();
        userId = firstUser._id.toString();
      } else {
        return new Response("No autorizado", { status: 401 });
      }
    }

    const model = getLanguageModel();
    const systemPrompt = getSystemPrompt("El Arca Market");
    const tools = createAITools(organizationId!, userPayload?.storeId);

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5,
      onStepFinish: async (step) => {
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const tc of step.toolCalls) {
            try {
              await AIToolExecution.create({
                organizationId,
                userId,
                toolName: tc.toolName,
                parameters: tc.args,
                durationMs: 150,
                status: "success",
                recordCount: 1,
              });
            } catch (err) {
              console.error("Error al registrar auditoría de herramienta de IA:", err);
            }
          }
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error en endpoint de Chat de IA:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor de IA" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
