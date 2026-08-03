import { streamText } from "ai";
import { getLanguageModel } from "@/lib/ai/provider";
import { getSystemPrompt } from "@/lib/ai/systemPrompt";
import { createAITools } from "@/lib/ai/tools";
import { connectDB } from "@/lib/db/mongodb";
import { AIToolExecution } from "@/models/AIToolExecution";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { verifyToken } from "@/lib/auth/jwt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    // Extraer token desde Cookie o Header Authorization o Body
    const authHeader = req.headers.get("Authorization");
    const cookieHeader = req.headers.get("cookie");

    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : body.token;

    if (!token && cookieHeader) {
      const match = cookieHeader.match(/arca_token=([^;]+)/);
      if (match) token = match[1];
    }

    await connectDB();

    let userPayload = token ? verifyToken(token) : null;
    let organizationId = userPayload?.organizationId;
    let userId = userPayload?.userId;

    // Fallback: si no hay token o la BD acaba de ser reseteada, buscar la primera organización registrada
    if (!organizationId) {
      const firstOrg = await Organization.findOne({});
      const firstUser = await User.findOne({});

      if (firstOrg) {
        organizationId = firstOrg._id.toString();
        userId = firstUser ? firstUser._id.toString() : undefined;
      } else {
        return new Response(
          JSON.stringify({ error: "No hay organización configurada en el sistema." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const model = getLanguageModel();
    const systemPrompt = getSystemPrompt("El Arca Market");
    const tools = createAITools(organizationId, userPayload?.storeId);

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5,
      onStepFinish: async (step) => {
        if (step.toolCalls && step.toolCalls.length > 0 && userId) {
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
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error interno en el chat de IA";
    console.error("🔴 Error en endpoint de Chat de IA:", errMessage);
    return new Response(
      JSON.stringify({ error: errMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
