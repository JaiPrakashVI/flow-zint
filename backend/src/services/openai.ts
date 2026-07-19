export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey.startsWith("mock") || apiKey === "") {
    // Return a mock 1536-dimensional normalized vector for local testing
    console.log("[OpenAI Service] Mocking embedding generation (no API key)")
    const mockVector = new Array(1536).fill(0).map(() => Math.random() - 0.5)
    const magnitude = Math.sqrt(mockVector.reduce((sum, val) => sum + val * val, 0))
    return mockVector.map(val => val / magnitude)
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small"
      })
    })

    const data = (await response.json()) as any
    if (!response.ok) {
      console.error("[OpenAI Service] Embeddings error:", data)
      throw new Error(data.error?.message || "Embeddings generation failed")
    }

    return data.data[0].embedding
  } catch (error) {
    console.error("[OpenAI Service] Network error generating embedding:", error)
    throw error
  }
}

export interface ChatMessageInput {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  name?: string
  tool_call_id?: string
  tool_calls?: any[]
}

export async function callChatCompletions(
  messages: ChatMessageInput[],
  toolsEnabled = false
): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey.startsWith("mock") || apiKey === "") {
    console.log("[OpenAI Service] Mocking Chat Completion (no API key)")
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || ""
    
    // Simulate tool call for booking requests
    if (toolsEnabled && (lastUserMsg.toLowerCase().includes("book") || lastUserMsg.toLowerCase().includes("tomorrow"))) {
      let service = "Sports Physiotherapy"
      if (lastUserMsg.toLowerCase().includes("gym")) service = "Premium Gym Memberships"
      else if (lastUserMsg.toLowerCase().includes("nutrition")) service = "Nutrition Consultation"

      return {
        choices: [{
          message: {
            role: "assistant",
            content: null,
            tool_calls: [{
              id: `call_mock_${Date.now()}`,
              type: "function",
              function: {
                name: "bookAppointment",
                arguments: JSON.stringify({
                  service,
                  dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] + "T18:00:00"
                })
              }
            }]
          }
        }]
      }
    }

    // Default mock text reply grounding checks
    let replyContent = "I don't have that information. Let me connect you with the business owner."
    if (lastUserMsg.toLowerCase().includes("price") || lastUserMsg.toLowerCase().includes("cost") || lastUserMsg.toLowerCase().includes("membership")) {
      replyContent = "Veda Wellness offers premium gym memberships: Monthly at ₹2,500, Quarterly at ₹6,500, and Annual Performance Package at ₹18,000. All memberships include lockers and medical gym access."
    } else if (lastUserMsg.toLowerCase().includes("hour") || lastUserMsg.toLowerCase().includes("timing")) {
      replyContent = "Our center operates Monday to Friday from 5:30 AM to 10:00 PM, and Saturdays from 6:00 AM to 8:00 PM. We are closed on Sundays."
    }

    return {
      choices: [{
        message: {
          role: "assistant",
          content: replyContent
        }
      }]
    }
  }

  const payload: any = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.1
  }

  if (toolsEnabled) {
    payload.tools = [{
      type: "function",
      function: {
        name: "bookAppointment",
        description: "Deterministic calendar booking. Only invoke when the client explicitly asks to book a slot for a specific service and time. Ask clarifying questions if the service name or time slot is ambiguous.",
        parameters: {
          type: "object",
          properties: {
            service: {
              type: "string",
              description: "Name of the service (e.g. Sports Physiotherapy, Nutrition Consultation)"
            },
            dateTime: {
              type: "string",
              description: "ISO 8601 DateTime string. Resolve relative terms (e.g. 'tomorrow at 6pm') using the current time as context."
            }
          },
          required: ["service", "dateTime"]
        }
      }
    }]
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const data = (await response.json()) as any
    if (!response.ok) {
      console.error("[OpenAI Service] Chat Completions error:", data)
      throw new Error(data.error?.message || "Chat Completions failed")
    }

    return data
  } catch (error) {
    console.error("[OpenAI Service] Network error calling Chat Completions:", error)
    throw error
  }
}

export async function analyzeLeadScore(conversationText: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey.startsWith("mock") || apiKey === "") {
    console.log("[OpenAI Service] Mocking Lead Scoring analysis (no API key)")
    
    let intent = "general_question"
    let leadScore = 30
    let bookingProbability = 0.15
    let reasoning = "Customer is asking basic operational information."

    if (conversationText.toLowerCase().includes("book") || conversationText.toLowerCase().includes("timing")) {
      intent = "booking_request"
      leadScore = 92
      bookingProbability = 0.85
      reasoning = "Customer asked for gym membership prices and requested a slot tomorrow at 6 PM. Shows immediate intent."
    } else if (conversationText.toLowerCase().includes("price")) {
      intent = "pricing_inquiry"
      leadScore = 65
      bookingProbability = 0.50
      reasoning = "Customer is inquiring about pricing tiers."
    }

    return {
      intent,
      budget: "unknown",
      urgency: leadScore > 75 ? "high" : "medium",
      sentiment: "positive",
      bookingProbability,
      leadScore,
      reasoning
    }
  }

  const systemPrompt = `Analyze the conversation history between a customer and a wellness assistant, and extract lead indicators as a structured JSON object.
Output must match exactly this structure:
{
  "intent": "short label, e.g. pricing_inquiry, booking_request, general_question",
  "budget": "inferred budget signal if any, else 'unknown'",
  "urgency": "low / medium / high",
  "sentiment": "positive / neutral / negative",
  "bookingProbability": float between 0 and 1,
  "leadScore": integer between 0 and 100,
  "reasoning": "human-readable explanation referencing specific keywords or actions. Must be specific and detailed."
}`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Conversation History:\n${conversationText}` }
        ]
      })
    })

    const data = (await response.json()) as any
    if (!response.ok) {
      console.error("[OpenAI Service] Lead score analysis error:", data)
      throw new Error(data.error?.message || "Lead score analysis failed")
    }

    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error("[OpenAI Service] Network error analyzing lead score:", error)
    throw error
  }
}
