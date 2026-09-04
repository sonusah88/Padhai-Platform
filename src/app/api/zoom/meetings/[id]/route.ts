import { NextRequest, NextResponse } from 'next/server';
import { getLiveSessionById, updateLiveSession } from '@/lib/zoom/session-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getLiveSessionById(id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Live session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch session';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateLiveSession(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Live session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update session';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
