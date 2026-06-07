import { start } from "workflow/api";
import { cacheRegister } from "@/workflows/BGS-register-cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

 await start(cacheRegister, []);
 return NextResponse.json({
  message: "Register caching workflow started",
 });
}