import { NextResponse } from "next/server";
import { TranslationError, translateText } from "@/src/lib/translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type TranslateRequestBody = {
  text?: unknown;
  to?: unknown;
  from?: unknown;
};

export async function POST(request: Request) {
  let body: TranslateRequestBody;

  try {
    body = (await request.json()) as TranslateRequestBody;
  } catch {
    return NextResponse.json(
      {
        status: false,
        message: "Invalid request payload.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const result = await translateText({
      text: typeof body.text === "string" ? body.text : "",
      to: typeof body.to === "string" ? body.to : "",
      from: typeof body.from === "string" ? body.from : undefined,
    });

    return NextResponse.json(
      {
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        status: true,
        message: "",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof TranslationError) {
      return NextResponse.json(
        {
          status: false,
          message: error.message,
          code: error.code,
        },
        {
          status: error.statusCode,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        status: false,
        message: "Unexpected error while translating text.",
        code: "INTERNAL_SERVER_ERROR",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
