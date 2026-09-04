'use client';

/**
 * WebRTCClassroomManager — Handles real-time peer-to-peer media streaming
 * between teacher (host) and student tabs using:
 *   1. BroadcastChannel for instant same-browser signaling
 *   2. Server polling (/api/live/signal) as cross-machine fallback
 *   3. RTCPeerConnection for actual media track transfer
 *
 * Key design decisions:
 *   - All ICE candidates are serialized via toJSON() before BroadcastChannel
 *   - Candidates are buffered until remote description is set (race condition fix)
 *   - Offer/answer SDP objects are plain {type, sdp} — no class instances
 */

export interface ClassroomEvent {
  type: 'whiteboard-stroke' | 'whiteboard-clear' | 'chat-message' | 'chat-update' | 'reaction' | 'host-stream' | 'hand-raise' | 'sdp-offer' | 'sdp-answer' | 'ice-candidate';
  payload: any;
  senderId: string;
  senderName: string;
  targetId?: string;
  timestamp: number;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

/**
 * Serialize an RTCIceCandidate to a plain JSON-safe object.
 * RTCIceCandidate class instances can NOT be passed through
 * BroadcastChannel.postMessage (DataCloneError).
 */
function serializeCandidate(candidate: RTCIceCandidate): RTCIceCandidateInit {
  return {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    usernameFragment: candidate.usernameFragment,
  };
}

/**
 * Serialize an RTCSessionDescription(Init) to a plain object.
 */
function serializeSdp(sdp: RTCSessionDescriptionInit): RTCSessionDescriptionInit {
  return { type: sdp.type, sdp: sdp.sdp };
}

export class WebRTCClassroomManager {
  public sessionId: string;
  public peerId: string;
  public role: 'teacher' | 'student';
  public userName: string;

  private broadcastChannel: BroadcastChannel | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private isBroadcasting = false;
  private currentStreamType: 'webcam' | 'screen' | 'none' = 'none';

  // ICE candidate buffer — stores candidates that arrive before remoteDescription is set
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  // Guard against duplicate offer processing
  private isNegotiating = false;

  private onRemoteStreamCallback: ((stream: MediaStream, streamType: string) => void) | null = null;
  private onWhiteboardEventCallback: ((event: any) => void) | null = null;
  private onChatCallback: ((msg: any) => void) | null = null;
  private onChatUpdateCallback: ((msg: any) => void) | null = null;
  private onReactionCallback: ((emoji: string) => void) | null = null;
  private onHostStatusCallback: ((status: { active: boolean; streamType: string; teacherName: string }) => void) | null = null;
  private onParticipantsCallback: ((participants: any[]) => void) | null = null;

  private pollingInterval: NodeJS.Timeout | null = null;
  private lastWhiteboardIndex = 0;
  private lastChatIndex = 0;
  private knownParticipantIds: Set<string> = new Set();

  constructor(sessionId: string, role: 'teacher' | 'student', userName: string) {
    this.sessionId = sessionId;
    this.role = role;
    this.userName = userName;
    this.peerId = `peer_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // BroadcastChannel for instant same-browser cross-window sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`padhai_live_${sessionId}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleBroadcastMessage(event.data);
        };
      } catch (err) {
        console.warn('[Padhai] BroadcastChannel init error:', err);
      }
    }

    // Background signaling poll (server fallback for cross-machine)
    this.startSignalingPoll();

    console.log(`[Padhai WebRTC] Init: role=${role}, peer=${this.peerId}, session=${sessionId}`);
  }

  // ─── Callback Setters ──────────────────────────────────────────────

  public onRemoteStream(cb: (stream: MediaStream, streamType: string) => void) {
    this.onRemoteStreamCallback = cb;
  }
  public onWhiteboardEvent(cb: (event: any) => void) {
    this.onWhiteboardEventCallback = cb;
  }
  public onChatMessage(cb: (msg: any) => void) {
    this.onChatCallback = cb;
  }
  public onChatUpdate(cb: (msg: any) => void) {
    this.onChatUpdateCallback = cb;
  }
  public onReaction(cb: (emoji: string) => void) {
    this.onReactionCallback = cb;
  }
  public onHostStatus(cb: (status: { active: boolean; streamType: string; teacherName: string }) => void) {
    this.onHostStatusCallback = cb;
  }
  public onParticipants(cb: (participants: any[]) => void) {
    this.onParticipantsCallback = cb;
  }

  // ─── Teacher: Start Broadcasting ───────────────────────────────────

  public async startBroadcasting(stream: MediaStream, streamType: 'webcam' | 'screen') {
    // Close any existing peer connections from previous broadcast
    this.peerConnections.forEach((pc) => { try { pc.close(); } catch {} });
    this.peerConnections.clear();
    this.pendingCandidates.clear();

    this.localStream = stream;
    this.isBroadcasting = true;
    this.currentStreamType = streamType;

    console.log(`[Padhai WebRTC] Teacher: startBroadcasting type=${streamType}, tracks=${stream.getTracks().map(t => t.kind).join(',')}`);

    const statusPayload = {
      active: true,
      streamType,
      teacherName: this.userName,
    };

    // 1. Broadcast status immediately so student UI shows "Teacher broadcasting"
    this.sendBroadcast({
      type: 'host-stream',
      payload: statusPayload,
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    });

    // 2. Notify server
    await this.sendSignal('host-stream-status', statusPayload);

    // 3. Small delay to let student tabs register status before receiving offer
    await new Promise(resolve => setTimeout(resolve, 200));

    // 4. Create WebRTC offer
    await this.createOfferForPeer('broadcast');
  }

  // ─── Teacher: Stop Broadcasting ────────────────────────────────────

  public stopBroadcasting() {
    this.isBroadcasting = false;
    this.localStream = null;
    this.currentStreamType = 'none';

    const statusPayload = {
      active: false,
      streamType: 'none',
      teacherName: this.userName,
    };

    this.sendBroadcast({
      type: 'host-stream',
      payload: statusPayload,
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    });

    this.sendSignal('host-stream-status', statusPayload);

    this.peerConnections.forEach((pc) => { try { pc.close(); } catch {} });
    this.peerConnections.clear();
    this.pendingCandidates.clear();
  }

  // ─── Teacher: Create SDP Offer ─────────────────────────────────────

  private async createOfferForPeer(targetId: string) {
    try {
      if (!this.localStream) {
        console.warn('[Padhai WebRTC] createOfferForPeer: no local stream');
        return;
      }

      // Close existing PC for this target
      const existing = this.peerConnections.get(targetId);
      if (existing) {
        try { existing.close(); } catch {}
        this.peerConnections.delete(targetId);
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      this.peerConnections.set(targetId, pc);
      this.pendingCandidates.set(targetId, []);

      // Add all media tracks to the peer connection
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });

      console.log(`[Padhai WebRTC] Teacher: creating offer for "${targetId}"`);

      // ICE candidate handler — serialize before broadcast!
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const serialized = serializeCandidate(event.candidate);
          this.sendBroadcast({
            type: 'ice-candidate',
            payload: { candidate: serialized, fromPeerId: this.peerId },
            senderId: this.peerId,
            senderName: this.userName,
            targetId,
            timestamp: Date.now(),
          });
          this.sendSignal('ice-candidate', { candidate: serialized, fromPeerId: this.peerId, targetPeerId: targetId });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[Padhai WebRTC] Teacher PC iceConnectionState: ${pc.iceConnectionState}`);
      };
      pc.onconnectionstatechange = () => {
        console.log(`[Padhai WebRTC] Teacher PC connectionState: ${pc.connectionState}`);
      };

      // Create & set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const plainOffer = serializeSdp(offer);
      console.log(`[Padhai WebRTC] Teacher: offer created, sdp length=${plainOffer.sdp?.length}`);

      // Send offer via BroadcastChannel + server
      const offerPayload = { offer: plainOffer, fromPeerId: this.peerId, streamType: this.currentStreamType };

      this.sendBroadcast({
        type: 'sdp-offer',
        payload: offerPayload,
        senderId: this.peerId,
        senderName: this.userName,
        targetId,
        timestamp: Date.now(),
      });

      this.sendSignal('sdp-offer', { ...offerPayload, targetPeerId: targetId });
    } catch (err) {
      console.error('[Padhai WebRTC] Error creating offer:', err);
    }
  }

  // ─── Student: Handle Incoming Offer ────────────────────────────────

  private async handleIncomingOffer(offerInit: RTCSessionDescriptionInit, hostSenderId = 'host') {
    // Prevent duplicate concurrent negotiation
    if (this.isNegotiating) {
      console.log('[Padhai WebRTC] Student: already negotiating, ignoring duplicate offer');
      return;
    }
    this.isNegotiating = true;

    try {
      console.log(`[Padhai WebRTC] Student: handling offer from ${hostSenderId}, sdp length=${offerInit.sdp?.length}`);

      // Close any existing student PC
      const existing = this.peerConnections.get('student_pc');
      if (existing) {
        try { existing.close(); } catch {}
        this.peerConnections.delete('student_pc');
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      this.peerConnections.set('student_pc', pc);
      this.pendingCandidates.set('student_pc', []);

      // Track handler — fires when teacher's media tracks arrive
      pc.ontrack = (event) => {
        console.log(`[Padhai WebRTC] Student: ontrack fired! kind=${event.track.kind}, streams=${event.streams.length}, readyState=${event.track.readyState}`);
        if (event.streams && event.streams[0] && this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(event.streams[0], this.currentStreamType || 'screen');
        }
      };

      // ICE candidate handler — serialize before broadcast!
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const serialized = serializeCandidate(event.candidate);
          this.sendBroadcast({
            type: 'ice-candidate',
            payload: { candidate: serialized, fromPeerId: this.peerId, targetPeerId: hostSenderId },
            senderId: this.peerId,
            senderName: this.userName,
            targetId: hostSenderId,
            timestamp: Date.now(),
          });
          this.sendSignal('ice-candidate', { candidate: serialized, fromPeerId: this.peerId, targetPeerId: hostSenderId });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[Padhai WebRTC] Student PC iceConnectionState: ${pc.iceConnectionState}`);
      };
      pc.onconnectionstatechange = () => {
        console.log(`[Padhai WebRTC] Student PC connectionState: ${pc.connectionState}`);
      };

      // Set remote description (teacher's offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offerInit));
      console.log('[Padhai WebRTC] Student: remote description (offer) set');

      // *** CRITICAL: Flush any ICE candidates that arrived before remote desc was set ***
      await this.flushPendingCandidates('student_pc');

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const plainAnswer = serializeSdp(answer);
      console.log(`[Padhai WebRTC] Student: answer created, sdp length=${plainAnswer.sdp?.length}`);

      // Send answer via BroadcastChannel + server
      const answerPayload = { answer: plainAnswer, fromPeerId: this.peerId, targetPeerId: hostSenderId };

      this.sendBroadcast({
        type: 'sdp-answer',
        payload: answerPayload,
        senderId: this.peerId,
        senderName: this.userName,
        targetId: hostSenderId,
        timestamp: Date.now(),
      });

      this.sendSignal('sdp-answer', answerPayload);
    } catch (err) {
      console.error('[Padhai WebRTC] Error handling offer:', err);
    } finally {
      this.isNegotiating = false;
    }
  }

  // ─── Teacher: Handle Incoming Answer ───────────────────────────────

  private async handleIncomingAnswer(answerInit: RTCSessionDescriptionInit, fromPeerId: string) {
    try {
      // Find the PC — try specific peer first, then 'broadcast' (generic)
      const pc = this.peerConnections.get(fromPeerId) || this.peerConnections.get('broadcast');
      if (!pc) {
        console.warn(`[Padhai WebRTC] Teacher: no PC found for answer from ${fromPeerId}`);
        return;
      }

      if (pc.signalingState !== 'have-local-offer') {
        console.warn(`[Padhai WebRTC] Teacher: PC not in have-local-offer (state=${pc.signalingState}), skipping answer`);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answerInit));
      console.log(`[Padhai WebRTC] Teacher: remote description (answer) set from ${fromPeerId}`);

      // *** CRITICAL: Flush any ICE candidates from this student that arrived early ***
      const pcKey = this.peerConnections.has(fromPeerId) ? fromPeerId : 'broadcast';
      await this.flushPendingCandidates(pcKey);
    } catch (err) {
      console.error('[Padhai WebRTC] Error handling answer:', err);
    }
  }

  // ─── ICE Candidate Handling (with buffering) ───────────────────────

  private async handleIncomingIceCandidate(candidateInit: RTCIceCandidateInit, fromPeerId?: string) {
    // Determine which PC key to use
    const pcKey = this.role === 'student' ? 'student_pc' : (fromPeerId || 'broadcast');
    const pc = this.peerConnections.get(pcKey) || (this.role === 'teacher' ? this.peerConnections.get('broadcast') : null);

    if (!pc) {
      // No PC exists yet — buffer the candidate for later
      console.log(`[Padhai WebRTC] Buffering ICE candidate (no PC for "${pcKey}" yet)`);
      const key = this.role === 'student' ? 'student_pc' : 'broadcast';
      if (!this.pendingCandidates.has(key)) {
        this.pendingCandidates.set(key, []);
      }
      this.pendingCandidates.get(key)!.push(candidateInit);
      return;
    }

    if (!pc.remoteDescription) {
      // Remote description not set yet — buffer for later
      console.log(`[Padhai WebRTC] Buffering ICE candidate (remote desc not set for "${pcKey}")`);
      const key = this.peerConnections.has(pcKey) ? pcKey : 'broadcast';
      if (!this.pendingCandidates.has(key)) {
        this.pendingCandidates.set(key, []);
      }
      this.pendingCandidates.get(key)!.push(candidateInit);
      return;
    }

    // PC exists and remote description is set — add immediately
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
    } catch (err) {
      console.warn('[Padhai WebRTC] Error adding ICE candidate:', err);
    }
  }

  /**
   * Flush all buffered ICE candidates for a given PC key.
   * Called immediately after setRemoteDescription completes.
   */
  private async flushPendingCandidates(pcKey: string) {
    const pc = this.peerConnections.get(pcKey);
    if (!pc || !pc.remoteDescription) return;

    // Collect candidates from this key
    const candidates = this.pendingCandidates.get(pcKey) || [];

    // For teacher's 'broadcast' PC, also drain any candidates keyed by student peer IDs
    if (this.role === 'teacher') {
      this.pendingCandidates.forEach((cands, key) => {
        if (key !== pcKey && cands.length > 0) {
          candidates.push(...cands);
          this.pendingCandidates.set(key, []);
        }
      });
    }

    if (candidates.length > 0) {
      console.log(`[Padhai WebRTC] Flushing ${candidates.length} buffered ICE candidates for "${pcKey}"`);
      for (const cand of candidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn('[Padhai WebRTC] Error adding buffered ICE candidate:', err);
        }
      }
    }

    this.pendingCandidates.set(pcKey, []);
  }

  // ─── Whiteboard, Chat, Reaction Senders ────────────────────────────

  public sendWhiteboardStroke(strokeData: any) {
    const event: ClassroomEvent = {
      type: 'whiteboard-stroke',
      payload: strokeData,
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    };
    this.sendBroadcast(event);
    this.sendSignal('whiteboard-stroke', strokeData);
  }

  public sendWhiteboardClear() {
    const event: ClassroomEvent = {
      type: 'whiteboard-clear',
      payload: {},
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    };
    this.sendBroadcast(event);
    this.sendSignal('whiteboard-clear', {});
  }

  public sendChatMessage(msg: any) {
    const event: ClassroomEvent = {
      type: 'chat-message',
      payload: msg,
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    };
    this.sendBroadcast(event);
    this.sendSignal('chat-message', msg);
  }

  public sendChatUpdate(update: any) {
    const event: ClassroomEvent = {
      type: 'chat-update',
      payload: update,
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    };
    this.sendBroadcast(event);
    this.sendSignal('chat-update', update);
  }

  public sendReaction(emoji: string) {
    const event: ClassroomEvent = {
      type: 'reaction',
      payload: { emoji },
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    };
    this.sendBroadcast(event);
    this.sendSignal('reaction', { emoji });
  }

  // ─── BroadcastChannel Message Router ───────────────────────────────

  private handleBroadcastMessage(data: ClassroomEvent) {
    if (data.senderId === this.peerId) return; // Ignore own messages

    switch (data.type) {
      case 'host-stream':
        if (this.onHostStatusCallback) {
          this.onHostStatusCallback(data.payload);
        }
        // Update local stream type tracking for student
        if (this.role === 'student' && data.payload.streamType) {
          this.currentStreamType = data.payload.streamType;
        }
        break;

      case 'sdp-offer':
        if (this.role === 'student') {
          // Accept offer targeted at us, at 'all'/'broadcast', or unspecified
          const target = data.targetId;
          if (!target || target === 'all' || target === 'broadcast' || target === this.peerId) {
            this.handleIncomingOffer(data.payload.offer, data.senderId);
            // Also store stream type from offer
            if (data.payload.streamType) {
              this.currentStreamType = data.payload.streamType;
            }
          }
        }
        break;

      case 'sdp-answer':
        if (this.role === 'teacher') {
          this.handleIncomingAnswer(data.payload.answer, data.senderId);
        }
        break;

      case 'ice-candidate':
        this.handleIncomingIceCandidate(data.payload.candidate, data.senderId);
        break;

      case 'whiteboard-stroke':
      case 'whiteboard-clear':
        if (this.onWhiteboardEventCallback) {
          this.onWhiteboardEventCallback(data);
        }
        break;

      case 'chat-message':
        if (this.onChatCallback) {
          this.onChatCallback(data.payload);
        }
        break;

      case 'chat-update':
        if (this.onChatUpdateCallback) {
          this.onChatUpdateCallback(data.payload);
        }
        break;

      case 'reaction':
        if (this.onReactionCallback) {
          this.onReactionCallback(data.payload.emoji);
        }
        break;
    }
  }

  // ─── BroadcastChannel Send Helper ──────────────────────────────────

  private sendBroadcast(data: ClassroomEvent) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (err) {
        // This should no longer happen now that we serialize ICE candidates,
        // but log it loudly if it does.
        console.error('[Padhai WebRTC] BroadcastChannel postMessage FAILED:', err, data.type);
      }
    }
  }

  // ─── Server Signaling Send Helper ──────────────────────────────────

  private async sendSignal(type: string, payload: any) {
    try {
      await fetch('/api/live/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          peerId: this.peerId,
          role: this.role,
          type,
          payload,
        }),
      });
    } catch {
      // Silently ignore network hiccup — server is a fallback, BroadcastChannel is primary for same-machine
    }
  }

  // ─── Periodic Server Signaling Poll ────────────────────────────────

  private startSignalingPoll() {
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/live/signal?sessionId=${this.sessionId}&peerId=${this.peerId}&role=${this.role}&name=${encodeURIComponent(
            this.userName
          )}&lastWhiteboardIndex=${this.lastWhiteboardIndex}&lastChatIndex=${this.lastChatIndex}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          const {
            hostStreamActive,
            streamType,
            sdpOffer,
            sdpAnswer,
            iceCandidates,
            newWhiteboardEvents,
            totalWhiteboardEvents,
            newChatMessages,
            totalChatMessages,
            participants,
          } = json.data;

          // Update host stream status
          if (this.onHostStatusCallback) {
            this.onHostStatusCallback({
              active: hostStreamActive,
              streamType: streamType || 'none',
              teacherName: 'Teacher',
            });
          }
          if (this.role === 'student' && streamType) {
            this.currentStreamType = streamType;
          }

          // Update participants
          if (participants && this.onParticipantsCallback) {
            this.onParticipantsCallback(participants);
            if (this.role === 'teacher' && this.isBroadcasting) {
              participants.forEach((p: any) => {
                if (p.role === 'student' && !this.knownParticipantIds.has(p.id)) {
                  this.knownParticipantIds.add(p.id);
                  this.createOfferForPeer(p.id);
                }
              });
            }
          }

          // Whiteboard events from server
          if (newWhiteboardEvents && newWhiteboardEvents.length > 0) {
            this.lastWhiteboardIndex = totalWhiteboardEvents;
            if (this.onWhiteboardEventCallback) {
              newWhiteboardEvents.forEach((evt: any) => this.onWhiteboardEventCallback!(evt));
            }
          }

          // Chat messages from server
          if (newChatMessages && newChatMessages.length > 0) {
            this.lastChatIndex = totalChatMessages;
            if (this.onChatCallback) {
              newChatMessages.forEach((msg: any) => this.onChatCallback!(msg));
            }
          }

          // Student: connect WebRTC if server has an offer and we haven't connected yet
          if (this.role === 'student' && sdpOffer && !this.peerConnections.has('student_pc')) {
            console.log('[Padhai WebRTC] Student: received SDP offer from server poll');
            this.handleIncomingOffer(sdpOffer);
          }

          // Teacher: process student answer from server
          if (this.role === 'teacher' && sdpAnswer && sdpAnswer.answer) {
            this.handleIncomingAnswer(sdpAnswer.answer, sdpAnswer.fromPeerId || 'student');
          }

          // Process ICE candidates from server
          if (iceCandidates && iceCandidates.length > 0) {
            iceCandidates.forEach((item: any) => {
              const cand = item.candidate || item;
              if (cand) {
                this.handleIncomingIceCandidate(cand, item.fromPeerId);
              }
            });
          }
        }
      } catch {
        // Polling retry — no-op
      }
    };

    poll();
    this.pollingInterval = setInterval(poll, 1200);
  }

  // ─── Cleanup ───────────────────────────────────────────────────────

  public destroy() {
    console.log('[Padhai WebRTC] Destroying manager');
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch {}
    }
    this.peerConnections.forEach((pc) => {
      try { pc.close(); } catch {}
    });
    this.peerConnections.clear();
    this.pendingCandidates.clear();
  }
}
