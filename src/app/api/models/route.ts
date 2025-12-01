import { NextResponse } from "next/server";

export async function GET() {
  // Curated list of working models based on Google's latest documentation
  const models = [
    {
      id: "gemini-3-pro-preview",
      name: "Gemini 3 Pro (Preview)",
      description: "Most intelligent model with state-of-the-art reasoning and agentic capabilities",
      thinking: true,
      vision: true
    },
    {
      id: "gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      description: "Most powerful 2.5 model with contextual thinking and long-form generation",
      thinking: true,
      vision: true
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      description: "Best for price-performance with thinking capabilities",
      thinking: true,
      vision: true
    },
    {
      id: "gemini-2.5-flash-lite",
      name: "Gemini 2.5 Flash-Lite",
      description: "Cost-efficient with thinking capabilities",
      thinking: true,
      vision: true
    },
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      description: "Multimodal performance, cost-effective, 1M context",
      thinking: true,
      vision: true
    },
    {
      id: "gemini-2.0-flash-lite",
      name: "Gemini 2.0 Flash-Lite",
      description: "Ultra-efficient for simple, high-frequency tasks",
      thinking: false,
      vision: true
    }
  ];

  return NextResponse.json({ models });
}
