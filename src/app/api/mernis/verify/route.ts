import { NextRequest, NextResponse } from "next/server";
import { verifyTCKimlik } from "@/lib/mernis/client";
import { MernisError, isValidTCKimlikFormat } from "@/lib/mernis/types";

export const runtime = "edge"; // Use edge runtime for better performance

/**
 * POST /api/mernis/verify
 * TC Kimlik numarası doğrulama endpoint'i
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tcKimlikNo, ad, soyad, dogumYili } = body;

    // Input validation
    if (!tcKimlikNo || !ad || !soyad || !dogumYili) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Tüm alanlar zorunludur: tcKimlikNo, ad, soyad, dogumYili",
        },
        { status: 400 },
      );
    }

    // Format validation
    if (!isValidTCKimlikFormat(tcKimlikNo)) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Geçersiz TC Kimlik numarası formatı",
        },
        { status: 400 },
      );
    }

    // Birth year validation
    const birthYear = parseInt(dogumYili, 10);
    if (
      isNaN(birthYear) ||
      birthYear < 1900 ||
      birthYear > new Date().getFullYear()
    ) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "Geçersiz doğum yılı",
        },
        { status: 400 },
      );
    }

    // Call Mernis service
    const result = await verifyTCKimlik({
      tcKimlikNo,
      ad: ad.toString(),
      soyad: soyad.toString(),
      dogumYili: birthYear,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    // Mernis API error - logged securely without exposing sensitive data

    if (error instanceof MernisError) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: "TC Kimlik doğrulama sırasında beklenmeyen bir hata oluştu",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/mernis/verify
 * API health check
 */
export async function GET() {
  return NextResponse.json({
    service: "Mernis TC Kimlik Doğrulama",
    status: "active",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
