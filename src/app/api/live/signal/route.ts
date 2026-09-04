import { NextRequest, NextResponse } from 'next/server';

interface RoomSignalingState {
  hostId: string | null;
  hostStreamActive: boolean;
  streamType: 'webcam' | 'screen' | 'whiteboard' | 'none';
  sdpOffers: Record<string, any>; // targetPeerId -> offer
  sdpAnswers: Record<string, any>; // targetPeerId -> answer
  iceCandidates: Record<string, any[]>; // targetPeerId -> candidates[]
  whiteboardEvents: any[];
  chatMessages: any[];
  reactions: any[];
  participants: Record<string, { id: string; name: string; role: string; lastSeen: number; handRaised: boolean }>;
}

// In-memory room signaling store
const roomState: Record<string, RoomSignalingState> = {};

function getOrCreateRoom(sessionId: string): RoomSignalingState {
  if (!roomState[sessionId]) {
    roomState[sessionId] = {
      hostId: null,
      hostStreamActive: false,
      streamType: 'none',
      sdpOffers: {},
      sdpAnswers: {},
      iceCandidates: {},
      whiteboardEvents: [],
      chatMessages: [],
      reactions: [],
      participants: {},
    };
  }
  return roomState[sessionId];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || 'default';
  const peerId = searchParams.get('peerId') || 'guest';
  const role = searchParams.get('role') || 'student';
  const lastWhiteboardIndex = Number(searchParams.get('lastWhiteboardIndex') || '0');
  const lastChatIndex = Number(searchParams.get('lastChatIndex') || '0');

  const room = getOrCreateRoom(sessionId);

  // Heartbeat participant
  room.participants[peerId] = {
    id: peerId,
    name: searchParams.get('name') || (role === 'teacher' ? 'Teacher' : 'Student'),
    role,
    lastSeen: Date.now(),
    handRaised: searchParams.get('handRaised') === 'true',
  };

  if (role === 'teacher') {
    room.hostId = peerId;
  }

  // Clean stale participants (> 30s)
  const now = Date.now();
  for (const pid in room.participants) {
    if (now - room.participants[pid].lastSeen > 30000) {
      delete room.participants[pid];
      delete room.sdpOffers[pid];
      delete room.sdpAnswers[pid];
      delete room.iceCandidates[pid];
    }
  }

  // Get targeted SDP offers / answers / candidates for this peer
  const myOffer = room.sdpOffers[peerId] || null;
  const myAnswer = room.sdpAnswers[peerId] || null;
  const myCandidates = room.iceCandidates[peerId] || [];

  // Clear retrieved one-time answers or candidates if role matched
  if (myAnswer) {
    delete room.sdpAnswers[peerId];
  }

  return NextResponse.json({
    success: true,
    data: {
      hostId: room.hostId,
      hostStreamActive: room.hostStreamActive,
      streamType: room.streamType,
      sdpOffer: myOffer,
      sdpAnswer: myAnswer,
      iceCandidates: myCandidates,
      newWhiteboardEvents: room.whiteboardEvents.slice(lastWhiteboardIndex),
      totalWhiteboardEvents: room.whiteboardEvents.length,
      newChatMessages: room.chatMessages.slice(lastChatIndex),
      totalChatMessages: room.chatMessages.length,
      recentReactions: room.reactions.slice(-10),
      participants: Object.values(room.participants),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId = 'default', type, payload, peerId, role } = body;
    const room = getOrCreateRoom(sessionId);

    if (type === 'host-stream-status') {
      room.hostStreamActive = payload.active;
      room.streamType = payload.streamType || 'none';
      if (payload.active) {
        room.hostId = peerId;
      } else {
        room.sdpOffers = {};
        room.sdpAnswers = {};
        room.iceCandidates = {};
      }
    } else if (type === 'sdp-offer') {
      const target = payload.targetPeerId || 'all';
      if (target === 'all') {
        // Send offer to all active students
        for (const pid in room.participants) {
          if (room.participants[pid].role === 'student') {
            room.sdpOffers[pid] = payload.offer;
          }
        }
      } else {
        room.sdpOffers[target] = payload.offer;
      }
    } else if (type === 'sdp-answer') {
      const target = payload.targetPeerId || room.hostId || 'host';
      room.sdpAnswers[target] = { answer: payload.answer, fromPeerId: peerId };
    } else if (type === 'ice-candidate') {
      const target = payload.targetPeerId || (role === 'teacher' ? 'student' : 'host');
      if (!room.iceCandidates[target]) room.iceCandidates[target] = [];
      room.iceCandidates[target].push({ candidate: payload.candidate, fromPeerId: peerId });
    } else if (type === 'whiteboard-stroke') {
      room.whiteboardEvents.push(payload);
      if (room.whiteboardEvents.length > 1000) room.whiteboardEvents.shift();
    } else if (type === 'whiteboard-clear') {
      room.whiteboardEvents = [{ type: 'whiteboard-clear' }];
    } else if (type === 'chat-message') {
      room.chatMessages.push(payload);
      if (room.chatMessages.length > 500) room.chatMessages.shift();
    } else if (type === 'chat-update') {
      // update upvotes or answer
      const idx = room.chatMessages.findIndex((m) => m.id === payload.id);
      if (idx !== -1) {
        room.chatMessages[idx] = { ...room.chatMessages[idx], ...payload };
      }
    } else if (type === 'reaction') {
      room.reactions.push(payload);
      if (room.reactions.length > 30) room.reactions.shift();
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signaling error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
