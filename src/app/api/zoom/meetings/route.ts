import { NextRequest, NextResponse } from 'next/server';
import { getAllLiveSessions, createNewLiveSession } from '@/lib/zoom/session-store';

export async function GET() {
  try {
    const sessions = getAllLiveSessions();
    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      topic,
      description,
      subject,
      grade,
      teacherName,
      scheduledAt,
      durationMinutes,
      meetingNumber,
      passcode,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Class title is required' },
        { status: 400 }
      );
    }

    const newSession = createNewLiveSession({
      title,
      topic: topic || title,
      description: description || `Live session for ${title}`,
      subject: subject || 'Mathematics',
      grade: grade || 'Grade 10',
      teacherName: teacherName || 'Teacher',
      scheduledAt: scheduledAt || new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 60,
      meetingNumber,
      passcode,
      status: 'live',
    });

    return NextResponse.json({
      success: true,
      data: newSession,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create meeting';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
