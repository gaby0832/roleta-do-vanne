import { NextRequest, NextResponse } from "next/server";

function getYouTubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);

    // youtube.com/watch?v=...
    if (
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "youtube.com"
    ) {
      return parsedUrl.searchParams.get("v");
    }

    // youtu.be/...
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1);
    }

    // youtube.com/shorts/...
    if (parsedUrl.hostname === "www.youtube.com" ||
        parsedUrl.hostname === "youtube.com") {
      const match = parsedUrl.pathname.match(/\/shorts\/([^/]+)/);

      if (match) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL não informada" },
      { status: 400 }
    );
  }

  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return NextResponse.json(
      { error: "URL do YouTube inválida" },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY não configurada" },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Erro ao consultar o YouTube" },
      { status: 500 }
    );
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return NextResponse.json(
      { error: "Vídeo não encontrado" },
      { status: 404 }
    );
  }

  const snippet = data.items[0].snippet;

  return NextResponse.json({
    id: videoId,
    title: snippet.title,
    thumbnail:
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      null,
    channel: snippet.channelTitle,
  });
}