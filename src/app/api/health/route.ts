import { NextResponse } from "next/server"

import { messages } from "@/config/messages"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: messages.common.appName,
  })
}
