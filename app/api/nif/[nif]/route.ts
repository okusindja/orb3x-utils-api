import { NextResponse } from "next/server";
import {
  PortalLookupError,
  lookupTaxpayerByNif,
  sanitizeNif,
} from "@/src/lib/agt-nif";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{
    nif: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { nif: rawNif } = await context.params;

  try {
    const taxpayer = await lookupTaxpayerByNif(rawNif);

    return NextResponse.json(
      {
        NIF: taxpayer.nif,
        Name: taxpayer.name,
        Type: taxpayer.type,
        Status: taxpayer.status,
        Defaulting: taxpayer.defaulting,
        VATRegime: taxpayer.vatRegime,
        isTaxResident: taxpayer.isTaxResident,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const fallbackNif = sanitizeRouteParam(rawNif);

    if (error instanceof PortalLookupError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            nif: fallbackNif,
          },
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
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error while processing the NIF lookup.",
          nif: fallbackNif,
        },
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

function sanitizeRouteParam(rawNif: string): string | null {
  try {
    return sanitizeNif(rawNif);
  } catch {
    return null;
  }
}
