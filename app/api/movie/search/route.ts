import { NextRequest, NextResponse } from 'next/server'
import { getSearchList } from '@/lib/tmdb/search'
import { checkRateLimit } from '@/lib/middlewares/ratelimit';

export async function GET(request: NextRequest) {

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const limit = 15;
  const interval = 60000; 

  const { success, remaining } = checkRateLimit(ip, limit, interval);

  if (!success) {
    return NextResponse.json(
      { message: "Too many requests, please try again later." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  try {

      const searchParams = await request.nextUrl.searchParams
      const q = searchParams.get('q') || null;


      if(!q) return Response.json({error: "Nenhuma Query encontrada"})

      const response = await getSearchList(q)
      return Response.json(response);
    
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export const runtime = "edge";