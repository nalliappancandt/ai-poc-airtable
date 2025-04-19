import ollama from "ollama";
import { NextRequest, NextResponse } from "next/server";
import { streamingJsonResponse } from "@/app/shared/server/streaming";
import { callAirtableApi, callAirtableApiMultiSkill, callAirtableApiMultiSkillExp } from "@/app/tools/airtable-service";
import { callAirtableApiTool, callAirtableApiToolWithMultiSkills, callAirtableApiToolWithMultiSkillsExp } from "@/app/tools/config";

const ollamaModel = process.env.OLLAMA_MODEL;

const SYSTEM_PROMPT = `You are an AI assistant integrated with Airtable. 
Your primary function is to retrieve employee records based on a given skill set. 
When a user provides a skill or list of skills, query the Airtable database to find employees whose skills match the input. 
Return the matching employee names as a list.
----------------
You should only summarize the results based on the function tool results.
----------------
You should not fetch directly from the Airtable database.
----------------
You are not allowed to answer any other questions or provide any other information outside of the Airtable query results.
----------------
Result Format: Each name should be on a new line.
1. Candidate Name,
2. Candidate Name,
3. Candidate Name.
----------------
you should display the result based on tool prompt and summarize it.
----------------
you should not display python code only text message.
----------------`;

const availableFunctions: Record<string, (args: any) => Promise<any>> = {
  callAirtableApi,
  callAirtableApiMultiSkill,
  callAirtableApiMultiSkillExp,
};

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];

    const response = await ollama.chat({
      model: ollamaModel || "default_model",
      messages,
      tools: [callAirtableApiTool, callAirtableApiToolWithMultiSkills, callAirtableApiToolWithMultiSkillsExp],
    });

    if (response.message.tool_calls) {
      await handleToolCalls(response.message.tool_calls, messages);

      const finalResponse = await ollama.chat({
        model: ollamaModel || "default_model",
        messages,
        stream: true,
      });

      return streamingJsonResponse(streamResponse(finalResponse));
    } else {
      console.log("No tool calls returned from model");
      return NextResponse.json({ message: "No tool calls returned from model" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

async function handleToolCalls(toolCalls: any[], messages: any[]) {
  for (const tool of toolCalls) {
    const functionToCall = availableFunctions[tool.function.name];
    if (functionToCall) {
      console.log("Calling function:", tool.function.name);
      console.log("Arguments:", tool.function.arguments);

      const output = await functionToCall(tool.function.arguments);
      console.log(output);

      const toolResponse = output.length === 0 ? "There is no matching profile." : output.join(",");
      messages.push({ role: "tool", content: toolResponse });
    } else {
      console.log("Function", tool.function.name, "not found");
    }
  }
}

async function* streamResponse(finalResponse: AsyncIterable<any>) {
  for await (const chunk of finalResponse) {
    yield { ...chunk?.message };
  }
}
