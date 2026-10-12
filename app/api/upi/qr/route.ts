import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { PAYMENT_CONFIG, getUpiPaymentUrl } from "@/lib/payment-config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amountStr = searchParams.get("amount");
    const amount = Number(amountStr) || 499;

    const upiUrl = getUpiPaymentUrl(amount);

    const svg = await QRCode.toString(upiUrl, {
      type: "svg",
      margin: 1.5,
      color: {
        dark: "#0b2b1a",
        light: "#ffffff",
      },
    });

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Could not generate QR code" }, { status: 500 });
  }
}
