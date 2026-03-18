import OpenAI from "openai";
import { env } from "../config/env";
import { ServiceUnavailableError } from "../errors/AppError";
import { logAiOperation } from "../utils/aiLogger";
import { searchReceiptsSemantic } from "./RagService";
import { ReceiptService } from "./ReceiptService";

const MAX_AGENT_ITERATIONS = 5;

const AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_receipts",
      description:
        "Get the user's receipts. Optionally filter by category or date range.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Filter by category (e.g. grocery, food, transport)",
          },
          date_from: {
            type: "string",
            description: "Start date in YYYY-MM-DD format",
          },
          date_to: {
            type: "string",
            description: "End date in YYYY-MM-DD format",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_receipt",
      description: "Add a new receipt for the user.",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Amount spent" },
          description: { type: "string", description: "Store or description" },
          date: {
            type: "string",
            description: "Date in YYYY-MM-DD (defaults to today if omitted)",
          },
          category: {
            type: "string",
            description: "Category (e.g. grocery, food)",
          },
        },
        required: ["amount", "description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_receipts",
      description:
        "Search receipts by natural language (e.g. 'groceries last month', 'restaurant expenses')",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Natural language search query",
          },
        },
        required: ["query"],
      },
    },
  },
];

function formatReceiptForAgent(r: {
  description: string;
  category?: string;
  amount: number;
  date: Date | string;
}): string {
  const dateStr =
    r.date instanceof Date
      ? r.date.toISOString().split("T")[0]
      : String(r.date);
  return `${r.description} | ${r.category ?? "uncategorized"} | $${Number(r.amount).toFixed(2)} | ${dateStr}`;
}

function filterReceipts(
  receipts: { description: string; category?: string; amount: number; date: Date }[],
  filters: { category?: string; date_from?: string; date_to?: string }
): typeof receipts {
  let result = receipts;

  if (filters.category) {
    const cat = filters.category.toLowerCase().trim();
    result = result.filter(
      (r) => (r.category ?? "").toLowerCase().includes(cat)
    );
  }

  if (filters.date_from) {
    const from = new Date(filters.date_from);
    if (!Number.isNaN(from.getTime())) {
      result = result.filter((r) => new Date(r.date) >= from);
    }
  }

  if (filters.date_to) {
    const to = new Date(filters.date_to);
    if (!Number.isNaN(to.getTime())) {
      result = result.filter((r) => new Date(r.date) <= to);
    }
  }

  return result;
}

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string
): Promise<string> {
  switch (name) {
    case "get_receipts": {
      const receipts = await ReceiptService.findByUserId(userId);
      const filtered = filterReceipts(receipts, {
        category: args.category as string | undefined,
        date_from: args.date_from as string | undefined,
        date_to: args.date_to as string | undefined,
      });
      if (filtered.length === 0) {
        return "No receipts found matching the filters.";
      }
      return filtered
        .slice(0, 20)
        .map(formatReceiptForAgent)
        .join("\n");
    }

    case "add_receipt": {
      const amount = Number(args.amount);
      const description = String(args.description ?? "").trim();
      if (!description || !Number.isFinite(amount) || amount < 0) {
        return "Error: amount must be a positive number and description is required.";
      }
      const dateStr = args.date as string | undefined;
      const date = dateStr
        ? new Date(dateStr)
        : new Date();
      if (Number.isNaN(date.getTime())) {
        return "Error: invalid date format. Use YYYY-MM-DD.";
      }
      const { receipt } = await ReceiptService.create({
        userId,
        dto: {
          amount,
          date,
          description,
          category: args.category as string | undefined,
        },
      });
      return `Receipt added: ${formatReceiptForAgent(receipt)}`;
    }

    case "search_receipts": {
      const query = String(args.query ?? "").trim();
      if (!query) {
        return "Error: search query is required.";
      }
      const results = await searchReceiptsSemantic(userId, query);
      if (results.length === 0) {
        return "No receipts found matching the search.";
      }
      return results.map(formatReceiptForAgent).join("\n");
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

/**
 * Runs the agentic workflow: user message -> LLM decides tools -> execute -> respond.
 *
 * @throws ServiceUnavailableError if OPENAI_API_KEY is not set
 */
export async function runAgent(
  userId: string,
  userMessage: string
): Promise<{ response: string }> {
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim() === "") {
    throw new ServiceUnavailableError(
      "AI features require OPENAI_API_KEY. Add it to your .env to enable the agent."
    );
  }

  const normalizedMessage = userMessage.trim();
  if (!normalizedMessage) {
    throw new ServiceUnavailableError("Message cannot be empty");
  }

  const startMs = Date.now();
  let toolCallsCount = 0;

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const systemPrompt = `You are a helpful financial assistant for a receipt tracking app. You can:
- get_receipts: List the user's receipts, optionally filtered by category or date range
- add_receipt: Add a new receipt (amount, description, optional date and category)
- search_receipts: Search receipts by natural language (e.g. "groceries", "restaurants last month")

Use the tools when needed to fulfill the user's request. Be concise and helpful.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: normalizedMessage },
  ];

  let iterations = 0;

  while (iterations < MAX_AGENT_ITERATIONS) {
    iterations++;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: AGENT_TOOLS,
      max_tokens: 500,
    });

    const choice = completion.choices[0];
    const message = choice?.message;

    if (!message) {
      logAiOperation({
        operation: "agent_chat",
        userId,
        durationMs: Date.now() - startMs,
        success: true,
        toolCalls: toolCallsCount,
      });
      return { response: "I couldn't generate a response. Please try again." };
    }

    // No tool calls - we have the final response
    if (!message.tool_calls || message.tool_calls.length === 0) {
      const content = message.content?.trim();
      logAiOperation({
        operation: "agent_chat",
        userId,
        durationMs: Date.now() - startMs,
        success: true,
        toolCalls: toolCallsCount,
      });
      return {
        response: content ?? "I couldn't generate a response. Please try again.",
      };
    }

    // Add assistant message with tool calls
    messages.push(message);
    toolCallsCount += message.tool_calls.length;

    // Execute each tool call and add results
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") continue;

      const name = toolCall.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(toolCall.function.arguments ?? "{}");
      } catch {
        args = {};
      }

      const result = await executeTool(name, args, userId);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

    logAiOperation({
      operation: "agent_chat",
      userId,
      durationMs: Date.now() - startMs,
      success: true,
      toolCalls: toolCallsCount,
    });
    return {
      response:
        "I reached the maximum number of steps. Please try a simpler request.",
    };
  } catch (err) {
    logAiOperation({
      operation: "agent_chat",
      userId,
      durationMs: Date.now() - startMs,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
