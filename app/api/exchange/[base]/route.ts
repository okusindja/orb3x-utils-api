import { NextResponse } from "next/server";
import {
  CurrencyError,
  convertCurrencyRates,
  fetchCurrencyRates,
  sanitizeCurrencyCode,
} from "@/src/lib/currency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{
    base: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { base: rawBase } = await context.params;
  const url = new URL(request.url);
  const amount = url.searchParams.get("amount");

  try {
    const lookup = await fetchCurrencyRates(rawBase);

    if (amount !== null) {
      const conversion = convertCurrencyRates(lookup, amount);

      return NextResponse.json(
        {
          currencyCode: conversion.currencyCode,
          currencyName: conversion.currencyName,
          currencySymbol: conversion.currencySymbol,
          countryName: conversion.countryName,
          countryCode: conversion.countryCode,
          flagImage: conversion.flagImage,
          ratesDate: conversion.ratesDate,
          baseCurrency: conversion.baseCurrency,
          amount: conversion.amount,
          unitRates: conversion.unitRates,
          convertedRates: conversion.convertedRates,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        currencyCode: lookup.currencyCode,
        currencyName: lookup.currencyName,
        currencySymbol: lookup.currencySymbol,
        countryName: lookup.countryName,
        countryCode: lookup.countryCode,
        flagImage: lookup.flagImage,
        ratesDate: lookup.ratesDate,
        baseCurrency: lookup.baseCurrency,
        unitRates: lookup.unitRates,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const fallbackBase = sanitizeBaseParam(rawBase);

    if (error instanceof CurrencyError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            baseCurrency: fallbackBase,
            amount,
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
          message: "Unexpected error while processing the currency lookup.",
          baseCurrency: fallbackBase,
          amount,
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

function sanitizeBaseParam(rawBase: string): string | null {
  try {
    return sanitizeCurrencyCode(rawBase).toUpperCase();
  } catch {
    return null;
  }
}
