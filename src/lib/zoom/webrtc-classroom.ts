'use client';

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

    // Initialize BroadcastChannel for instant same-browser cross-window sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`padhai_live_${sessionId}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleBroadcastMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // Start background signaling poll
    this.startSignalingPoll();
  }

  // Set callbacks
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

  // Teacher starts broadcasting webcam or screen share
  public async startBroadcasting(stream: MediaStream, streamType: 'webcam' | 'screen') {
    this.localStream = stream;
    this.isBroadcasting = true;
    this.currentStreamType = streamType;

    const statusPayload = {
      active: true,
      streamType,
      teacherName: this.userName,
    };

    // Broadcast status to all tabs/peers immediately
    this.sendBroadcast({
      type: 'host-stream',
      payload: statusPayload,
      senderId: this.peerId,
      senderName: this.userName,
      timestamp: Date.now(),
    });

    // Notify server
    this.sendSignal('host-stream-status', statusPayload);

    // Create WebRTC offers for all known student peers or broadcast offer
    this.createOffersForStudents();
  }

  // Teacher stops broadcasting
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

    // Close peer connections
    this.peerConnections.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    this.peerConnections.clear();
  }

  // Send offers to connected student peers
  private async createOffersForStudents(targetStudentId?: string) {
    if (!this.localStream || !this.isBroadcasting) return;

    if (targetStudentId) {
      await this.createOfferForPeer(targetStudentId);
    } else {
      // General offer for all students
      await this.createOfferForPeer('all');
      // Also for all known specific students
      this.knownParticipantIds.forEach((pid) => {
        this.createOfferForPeer(pid);
      });
    }
  }

  private async createOfferForPeer(targetId: string) {
    try {
      if (!this.localStream) return;

      let pc = this.peerConnections.get(targetId);
      if (pc) {
        try {
          pc.close();
        } catch {}
      }

      pc = new RTCPeerConnection(ICE_SERVERS);
      this.peerConnections.set(targetId, pc);

      this.localStream.getTracks().forEach((track) => {
        if (this.localStream && pc) {
          pc.addTrack(track, this.localStream);
        }
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candPayload = { candidate: event.candidate, targetPeerId: targetId };
          this.sendBroadcast({
            type: 'ice-candidate',
            payload: candPayload,
            senderId: this.peerId,
            senderName: this.userName,
            targetId,
            timestamp: Date.now(),
          });
          this.sendSignal('ice-candidate', candPayload);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const offerPayload = { offer, targetPeerId: targetId, streamType: this.currentStreamType };

      // Broadcast immediately to tabs on same browser
      this.sendBroadcast({
        type: 'sdp-offer',
        payload: offerPayload,
        senderId: this.peerId,
        senderName: this.userName,
        targetId,
        timestamp: Date.now(),
      });

      // Send to server signaling
      this.sendSignal('sdp-offer', offerPayload);
    } catch (err) {
      console.warn('Error creating WebRTC offer for peer:', targetId, err);
    }
  }

  // Student handles incoming offer from host
  private async handleIncomingOffer(offer: RTCSessionDescriptionInit, hostSenderId = 'host') {
    try {
      let pc = this.peerConnections.get('student_pc');
      if (pc) {
        try {
          pc.close();
        } catch {}
      }

      pc = new RTCPeerConnection(ICE_SERVERS);
      this.peerConnections.set('student_pc', pc);

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0] && this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(event.streams[0], this.currentStreamType || 'screen');
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candPayload = { candidate: event.candidate, targetPeerId: hostSenderId };
          this.sendBroadcast({
            type: 'ice-candidate',
            payload: candPayload,
            senderId: this.peerId,
            senderName: this.userName,
            targetId: hostSenderId,
            timestamp: Date.now(),
          });
          this.sendSignal('ice-candidate', candPayload);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const answerPayload = { answer, targetPeerId: hostSenderId };

      // Send answer via BroadcastChannel & Server
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
      console.warn('WebRTC handle offer error:', err);
    }
  }

  // Host handles incoming answer from student
  private async handleIncomingAnswer(answer: RTCSessionDescriptionInit, studentPeerId: string) {
    try {
      const pc = this.peerConnections.get(studentPeerId) || this.peerConnections.get('all');
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.warn('WebRTC handle answer error:', err);
    }
  }

  // Handle ICE candidate
  private async handleIncomingIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      const pc = this.role === 'student' ? this.peerConnections.get('student_pc') : this.peerConnections.get('all');
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.warn('Add ICE candidate error:', err);
    }
  }

  // Send whiteboard draw stroke to all students
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

  // Clear whiteboard
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

  // Send chat message
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

  // Update chat message (upvote / answer)
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

  // Send reaction emoji
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

  // Handle incoming broadcast message from same machine
  private handleBroadcastMessage(data: ClassroomEvent) {
    if (data.senderId === this.peerId) return; // Ignore own message

    if (data.type === 'host-stream') {
      if (this.onHostStatusCallback) {
        this.onHostStatusCallback(data.payload);
      }
      if (this.role === 'student' && data.payload.active) {
        // Request connection if teacher active
      }
    } else if (data.type === 'sdp-offer') {
      if (this.role === 'student' && (data.targetId === this.peerId || data.targetId === 'all' || !data.targetId)) {
        this.handleIncomingOffer(data.payload.offer, data.senderId);
      }
    } else if (data.type === 'sdp-answer') {
      if (this.role === 'teacher') {
        this.handleIncomingAnswer(data.payload.answer, data.senderId);
      }
    } else if (data.type === 'ice-candidate') {
      this.handleIncomingIceCandidate(data.payload.candidate);
    } else if (data.type === 'whiteboard-stroke' || data.type === 'whiteboard-clear') {
      if (this.onWhiteboardEventCallback) {
        this.onWhiteboardEventCallback(data);
      }
    } else if (data.type === 'chat-message') {
      if (this.onChatCallback) {
        this.onChatCallback(data.payload);
      }
    } else if (data.type === 'chat-update') {
      if (this.onChatUpdateCallback) {
        this.onChatUpdateCallback(data.payload);
      }
    } else if (data.type === 'reaction') {
      if (this.onReactionCallback) {
        this.onReactionCallback(data.payload.emoji);
      }
    }
  }

  // Helper to send message via BroadcastChannel
  private sendBroadcast(data: ClassroomEvent) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (err) {
        console.warn('Broadcast send error:', err);
      }
    }
  }

  // Helper to send signal to server
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
      // Ignore network hiccup
    }
  }

  // Periodic signaling poll
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
            recentReactions,
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

          // Update participants
          if (participants && this.onParticipantsCallback) {
            this.onParticipantsCallback(participants);
            // Track new student participants for host
            if (this.role === 'teacher' && this.isBroadcasting) {
              participants.forEach((p: any) => {
                if (p.role === 'student' && !this.knownParticipantIds.has(p.id)) {
                  this.knownParticipantIds.add(p.id);
                  this.createOfferForPeer(p.id);
                }
              });
            }
          }

          // Process new whiteboard events
          if (newWhiteboardEvents && newWhiteboardEvents.length > 0) {
            this.lastWhiteboardIndex = totalWhiteboardEvents;
            if (this.onWhiteboardEventCallback) {
              newWhiteboardEvents.forEach((evt: any) => this.onWhiteboardEventCallback!(evt));
            }
          }

          // Process new chat messages
          if (newChatMessages && newChatMessages.length > 0) {
            this.lastChatIndex = totalChatMessages;
            if (this.onChatCallback) {
              newChatMessages.forEach((msg: any) => this.onChatCallback!(msg));
            }
          }

          // Student connects WebRTC if offer received
          if (this.role === 'student' && sdpOffer && !this.peerConnections.has('student_pc')) {
            this.handleIncomingOffer(sdpOffer);
          }

          // Teacher processes student answer
          if (this.role === 'teacher' && sdpAnswer) {
            this.handleIncomingAnswer(sdpAnswer.answer, sdpAnswer.fromPeerId);
          }

          // Process ICE candidates
          if (iceCandidates && iceCandidates.length > 0) {
            iceCandidates.forEach((item: any) => {
              if (item.candidate) {
                this.handleIncomingIceCandidate(item.candidate);
              }
            });
          }
        }
      } catch {
        // Polling retry
      }
    };

    poll();
    this.pollingInterval = setInterval(poll, 1000);
  }

  public destroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
    }
    this.peerConnections.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    this.peerConnections.clear();
  }
}
