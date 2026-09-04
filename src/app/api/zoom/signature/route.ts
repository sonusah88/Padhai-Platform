import { NextRequest, NextResponse } from 'next/server';
import { generateZoomSignature } from '@/lib/zoom/signature';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetingNumber, role = 0, sdkKey, sdkSecret } = body;

    if (!meetingNumber) {
      return NextResponse.json(
        { success: false, error: 'meetingNumber is required' },
        { status: 400 }
      );
    }

    const signatureData = generateZoomSignature({
      meetingNumber: String(meetingNumber),
      role: Number(role) === 1 ? 1 : 0,
      sdkKey,
      sdkSecret,
    });

    return NextResponse.json({
      success: true,
      data: signatureData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate signature';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
