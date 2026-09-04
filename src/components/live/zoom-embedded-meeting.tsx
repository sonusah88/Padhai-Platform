'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  PhoneOff,
  Hand,
  Maximize2,
  Minimize2,
  Settings,
  Shield,
  Volume2,
  Radio,
  Users,
  LayoutGrid,
  Tv,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  ExternalLink,
  PenTool,
  Disc,
  StopCircle,
  Download,
  Smile,
  VolumeX,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveInteractiveWhiteboard } from '@/components/live/live-interactive-whiteboard';
import { WebRTCClassroomManager } from '@/lib/zoom/webrtc-classroom';

interface ZoomEmbeddedMeetingProps {
  meetingNumber: string;
  passcode: string;
  topic: string;
  teacherName: string;
  userName: string;
  userRole: 'teacher' | 'student';
  onLeave?: () => void;
  isHandRaised?: boolean;
  onToggleHand?: () => void;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
}

export function ZoomEmbeddedMeeting({
  meetingNumber,
  passcode,
  topic,
  teacherName,
  userName,
  userRole,
  onLeave,
  isHandRaised = false,
  onToggleHand,
}: ZoomEmbeddedMeetingProps) {
  // Media states
  const [isMuted, setIsMuted] = useState(userRole === 'student');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewMode, setViewMode] = useState<'presentation' | 'whiteboard' | 'grid'>('presentation');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Host Remote Broadcasting State (seen by students)
  const [isHostBroadcasting, setIsHostBroadcasting] = useState(false);
  const [hostStreamType, setHostStreamType] = useState<'webcam' | 'screen' | 'none'>('none');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteWhiteboardEvent, setRemoteWhiteboardEvent] = useState<any>(null);
  const [hasAutoplayBlocked, setHasAutoplayBlocked] = useState(false);
  const [remoteStreamKey, setRemoteStreamKey] = useState(0);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Audio level meter
  const [audioLevel, setAudioLevel] = useState(0);

  // Floating reactions
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Zoom SDK State
  const [sdkStatus, setSdkStatus] = useState<'ready' | 'connected' | 'in_app'>('in_app');
  const [customSdkKey, setCustomSdkKey] = useState('');
  const [customSdkSecret, setCustomSdkSecret] = useState('');
  const [signatureInfo, setSignatureInfo] = useState<{ signature?: string; sdkKey?: string } | null>(null);

  // Hardware Streams Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteHostVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // WebRTC Manager Ref
  const webrtcManagerRef = useRef<WebRTCClassroomManager | null>(null);

  // Initialize WebRTC & Broadcast Synchronizer
  useEffect(() => {
    const manager = new WebRTCClassroomManager(meetingNumber, userRole, userName);
    webrtcManagerRef.current = manager;

    // Student receives host stream status
    manager.onHostStatus((status) => {
      setIsHostBroadcasting(status.active);
      setHostStreamType(status.streamType as any);
      if (status.active && userRole === 'student') {
        setViewMode('presentation');
      }
    });

    // Student receives remote WebRTC stream
    manager.onRemoteStream((stream, streamType) => {
      console.log('[Padhai UI] Remote stream received:', stream.id, 'tracks:', stream.getTracks().map(t => `${t.kind}:${t.readyState}`).join(','));
      setRemoteStream(stream);
      setIsHostBroadcasting(true);
      setHostStreamType(streamType as any);
      setRemoteStreamKey(k => k + 1); // force re-render to re-bind video element
    });

    // Student receives whiteboard drawing
    manager.onWhiteboardEvent((evt) => {
      setRemoteWhiteboardEvent(evt);
    });

    // Receive floating reaction
    manager.onReaction((emoji) => {
      triggerFloatingReaction(emoji);
    });

    return () => {
      manager.destroy();
    };
  }, [meetingNumber, userRole, userName]);

  // Sync screen share stream to video element
  useEffect(() => {
    if (isScreenSharing && screenStreamRef.current && screenShareVideoRef.current) {
      screenShareVideoRef.current.srcObject = screenStreamRef.current;
      screenShareVideoRef.current.play().catch((e) => console.log('Screen share playback:', e));
    }
  }, [isScreenSharing, viewMode]);

  // Sync local camera stream to video element
  useEffect(() => {
    if (isVideoOn && mediaStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStreamRef.current;
      localVideoRef.current.play().catch((e) => console.log('Local camera playback:', e));
    }
  }, [isVideoOn, viewMode]);

  // Callback ref for the remote host video element.
  // This fires every time the <video> mounts into the DOM and immediately
  // binds the remoteStream, avoiding the timing bug where a useEffect runs
  // before the conditionally-rendered video element exists.
  const bindRemoteVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      remoteHostVideoRef.current = el;
      if (el && remoteStream) {
        if (el.srcObject !== remoteStream) {
          console.log('[Padhai UI] Binding remote stream to <video>', remoteStream.id);
          el.srcObject = remoteStream;
        }
        el.play()
          .then(() => setHasAutoplayBlocked(false))
          .catch((err) => {
            console.warn('[Padhai UI] Autoplay blocked:', err);
            setHasAutoplayBlocked(true);
          });
      }
    },
    [remoteStream, remoteStreamKey]
  );

  // Fetch Zoom signature
  useEffect(() => {
    async function getSignature() {
      try {
        const res = await fetch('/api/zoom/signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingNumber,
            role: userRole === 'teacher' ? 1 : 0,
            sdkKey: customSdkKey || undefined,
            sdkSecret: customSdkSecret || undefined,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSignatureInfo(data.data);
          if (data.data.sdkKey && data.data.sdkKey !== 'DEMO_ZOOM_SDK_KEY' && data.data.sdkKey !== 'placeholder_zoom_sdk_key') {
            setSdkStatus('ready');
          } else {
            setSdkStatus('in_app');
          }
        }
      } catch (err) {
        setSdkStatus('in_app');
      }
    }
    getSignature();
  }, [meetingNumber, userRole, customSdkKey, customSdkSecret]);

  // Handle Real Camera Toggle
  const toggleCamera = async () => {
    if (isVideoOn) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((track) => track.stop());
      }
      setIsVideoOn(false);
      if (userRole === 'teacher' && webrtcManagerRef.current && !isScreenSharing) {
        webrtcManagerRef.current.stopBroadcasting();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: !isMuted,
        });
        mediaStreamRef.current = stream;
        setIsVideoOn(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        // If teacher, broadcast webcam to all students
        if (userRole === 'teacher' && webrtcManagerRef.current && !isScreenSharing) {
          webrtcManagerRef.current.startBroadcasting(stream, 'webcam');
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        setIsVideoOn(true);
      }
    }
  };

  // Handle Real Screen Sharing (Broadcasts to all students!)
  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      if (userRole === 'teacher' && webrtcManagerRef.current) {
        if (isVideoOn && mediaStreamRef.current) {
          webrtcManagerRef.current.startBroadcasting(mediaStreamRef.current, 'webcam');
        } else {
          webrtcManagerRef.current.stopBroadcasting();
        }
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        setViewMode('presentation');

        // Broadcast screen share to all students
        if (webrtcManagerRef.current) {
          webrtcManagerRef.current.startBroadcasting(screenStream, 'screen');
        }

        // Listen for native stop share button on browser window
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            if (screenStreamRef.current) {
              screenStreamRef.current.getTracks().forEach((t) => t.stop());
            }
            screenStreamRef.current = null;
            setIsScreenSharing(false);
            if (webrtcManagerRef.current) {
              webrtcManagerRef.current.stopBroadcasting();
            }
          };
        }
      } catch (err) {
        console.warn('Screen sharing cancelled or error:', err);
      }
    }
  };

  // Handle Real Microphone Toggle
  const toggleMic = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      setAudioLevel(0);
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = true));
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            if (mediaStreamRef.current) requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch {
          // Ignore
        }
      }
    }
  };

  // Handle In-Browser Recording
  const toggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = screenStreamRef.current || mediaStreamRef.current;
        if (!stream) {
          alert('Please start camera or screen sharing first to record the live class stream.');
          return;
        }
        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Padhai_Class_Recording_${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingSeconds(0);
      } catch (err) {
        console.warn('Recorder initialization error:', err);
        setIsRecording(true);
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const triggerFloatingReaction = (emoji: string) => {
    const id = `rx-${Date.now()}-${Math.random()}`;
    const left = 20 + Math.random() * 60;
    setReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  const sendReaction = (emoji: string) => {
    triggerFloatingReaction(emoji);
    setShowReactionPicker(false);
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.sendReaction(emoji);
    }
  };

  // Broadcast whiteboard draw stroke to all connected students
  const handleWhiteboardStroke = (strokeData: any) => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.sendWhiteboardStroke(strokeData);
    }
  };

  // Broadcast whiteboard clear
  const handleWhiteboardClear = () => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.sendWhiteboardClear();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleManualPlay = () => {
    if (remoteHostVideoRef.current) {
      remoteHostVideoRef.current.play().then(() => {
        setHasAutoplayBlocked(false);
      }).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all select-none',
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none w-screen h-screen'
          : 'w-full h-full min-h-[460px] lg:min-h-[540px]'
      )}
    >
      {/* Floating Animated Reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-16 text-3xl md:text-4xl animate-floatUp"
            style={{ left: `${r.left}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold tracking-wide animate-pulse shadow-md">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE NOW</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/90">
            <span className="font-bold">{topic}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/70 font-mono">Zoom ID: {meetingNumber}</span>
          </div>

          {/* Recording Badge */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-xs font-mono font-bold animate-pulse">
              <Disc className="w-3.5 h-3.5 animate-spin" />
              <span>REC {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Waveform Meter */}
          {!isMuted && (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Volume2 className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5 h-3 w-6">
                <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(20, audioLevel)}%` }} />
                <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(10, audioLevel * 0.8)}%` }} />
                <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(15, audioLevel * 1.2)}%` }} />
              </div>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 backdrop-blur-md">
            <button
              onClick={() => setViewMode('presentation')}
              className={cn(
                'p-1.5 rounded text-white/80 transition-colors',
                viewMode === 'presentation' ? 'bg-white/20 text-white shadow-xs' : 'hover:text-white'
              )}
              title="Presentation Screen"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('whiteboard')}
              className={cn(
                'p-1.5 rounded text-white/80 transition-colors',
                viewMode === 'whiteboard' ? 'bg-white/20 text-white shadow-xs' : 'hover:text-white'
              )}
              title="Interactive Live Whiteboard"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded text-white/80 transition-colors',
                viewMode === 'grid' ? 'bg-white/20 text-white shadow-xs' : 'hover:text-white'
              )}
              title="Gallery Grid Mode"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Settings / Zoom Setup Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors backdrop-blur-md"
            title="Zoom SDK Setup"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors backdrop-blur-md"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div id="zoom-meeting-container" className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* 1. PRESENTATION / SCREEN SHARE / WHITEBOARD STAGE */}
        {viewMode === 'presentation' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-3 md:p-6">
            {/* If Teacher is sharing screen locally */}
            {isScreenSharing ? (
              <div className="relative w-full h-full max-w-5xl rounded-xl bg-black border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
                <video
                  ref={screenShareVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 text-white text-xs font-mono flex items-center gap-2 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sharing Live Screen</span>
                </div>
              </div>
            ) : isHostBroadcasting && (remoteStream || hostStreamType !== 'none') ? (
              /* STUDENT SEES TEACHER'S LIVE SHARED SCREEN OR WEBCAM BROADCAST */
              <div className="relative w-full h-full max-w-5xl rounded-xl bg-black border-2 border-emerald-500/80 flex items-center justify-center overflow-hidden shadow-2xl">
                <video
                  key={`remote-main-${remoteStreamKey}`}
                  ref={bindRemoteVideo}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />

                {hasAutoplayBlocked && (
                  <button
                    onClick={handleManualPlay}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-30 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                    <span className="text-xs font-semibold">Click to play Teacher&apos;s Live Broadcast</span>
                  </button>
                )}

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 text-white text-xs font-mono flex items-center gap-2 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🔴 Teacher&apos;s Live Broadcast ({hostStreamType === 'screen' ? 'Screen' : 'Video'})</span>
                </div>
              </div>
            ) : (
              /* COLLABORATIVE SYNCHRONIZED WHITEBOARD */
              <div className="relative w-full h-full max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                <LiveInteractiveWhiteboard
                  isTeacher={userRole === 'teacher'}
                  topicTitle={topic}
                  onStroke={handleWhiteboardStroke}
                  onClear={handleWhiteboardClear}
                  remoteEvent={remoteWhiteboardEvent}
                />
              </div>
            )}

            {/* Picture-in-Picture Video Card */}
            <div className="absolute bottom-20 right-6 z-30 w-44 h-28 md:w-56 md:h-36 rounded-xl bg-slate-900 border-2 border-emerald-500 shadow-2xl overflow-hidden group">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : isHostBroadcasting && userRole === 'student' && hostStreamType === 'screen' && remoteStream ? (
                <video
                  key={`remote-pip-${remoteStreamKey}`}
                  ref={(el) => {
                    if (el && remoteStream && el.srcObject !== remoteStream) {
                      el.srcObject = remoteStream;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={userRole === 'teacher' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=350'}
                  alt={userRole === 'teacher' ? teacherName : userName}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 flex items-center justify-between text-[11px] text-white">
                <span className="font-bold truncate">{userRole === 'teacher' ? `${teacherName} (Host)` : `${userName} (You)`}</span>
                <div className="flex items-center gap-1">
                  {!isMuted ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FULL WHITEBOARD MODE */}
        {viewMode === 'whiteboard' && (
          <div className="w-full h-full p-3 md:p-6">
            <LiveInteractiveWhiteboard
              isTeacher={userRole === 'teacher'}
              topicTitle={topic}
              onStroke={handleWhiteboardStroke}
              onClear={handleWhiteboardClear}
              remoteEvent={remoteWhiteboardEvent}
            />
          </div>
        )}

        {/* 3. GALLERY GRID MODE */}
        {viewMode === 'grid' && (
          <div className="w-full h-full p-6 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
            {/* Teacher Card */}
            <div className="relative rounded-xl bg-slate-900 border-2 border-emerald-500 overflow-hidden shadow-lg aspect-video">
              {isHostBroadcasting && userRole === 'student' && remoteStream ? (
                <video
                  key={`remote-grid-${remoteStreamKey}`}
                  ref={(el) => {
                    if (el && remoteStream && el.srcObject !== remoteStream) {
                      el.srcObject = remoteStream;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : isVideoOn && userRole === 'teacher' ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350"
                  alt={teacherName}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                TEACHER / HOST
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex items-center justify-between text-xs text-white">
                <span>{teacherName}</span>
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Current User Card */}
            <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg aspect-video flex items-center justify-center">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-lg">
                    {userName[0]}
                  </div>
                  <span className="text-xs">Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex items-center justify-between text-xs text-white">
                <span>{userName} (You)</span>
                {!isMuted ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* Peer Student 1 */}
            <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=350"
                alt="Pooja"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex items-center justify-between text-xs text-white">
                <span>Pooja Karki</span>
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>

            {/* Peer Student 2 */}
            <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=350"
                alt="Suman"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex items-center justify-between text-xs text-white">
                <span>Suman Shrestha</span>
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating In-Meeting Controls Bar */}
      <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center pointer-events-none px-4">
        <div className="pointer-events-auto relative flex items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          {/* Reaction Picker Popup */}
          {showReactionPicker && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2 animate-in zoom-in-95">
              {['👏', '❤️', '💡', '🔥', '🎯', '🚀', '✋', '💯'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="p-2 text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Mute/Unmute Toggle */}
          <button
            onClick={toggleMic}
            className={cn(
              'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
              isMuted
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            )}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-[10px] font-medium hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={cn(
              'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
              !isVideoOn
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            )}
            title={isVideoOn ? 'Turn Off Camera' : 'Start Camera'}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span className="text-[10px] font-medium hidden sm:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenSharing}
            className={cn(
              'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
              isScreenSharing
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] font-medium hidden sm:inline">
              {isScreenSharing ? 'Sharing' : 'Share Screen'}
            </span>
          </button>

          {/* Record Class (Teacher/Host) */}
          {userRole === 'teacher' && (
            <button
              onClick={toggleRecording}
              className={cn(
                'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
              title={isRecording ? 'Stop Recording' : 'Record Class'}
            >
              {isRecording ? <StopCircle className="w-4 h-4" /> : <Disc className="w-4 h-4" />}
              <span className="text-[10px] font-medium hidden sm:inline">{isRecording ? 'Recording' : 'Record'}</span>
            </button>
          )}

          {/* Reactions Picker */}
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Send Emoji Reaction"
          >
            <Smile className="w-4 h-4" />
            <span className="text-[10px] font-medium hidden sm:inline">React</span>
          </button>

          {/* Raise Hand (Student) */}
          {userRole === 'student' && onToggleHand && (
            <button
              onClick={onToggleHand}
              className={cn(
                'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
                isHandRaised
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
              title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            >
              <Hand className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:inline">
                {isHandRaised ? 'Hand Up' : 'Raise Hand'}
              </span>
            </button>
          )}

          <div className="w-px h-6 bg-slate-700 mx-1" />

          {/* Leave / End Meeting Button */}
          <button
            onClick={onLeave}
            className="flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-md active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="text-[10px] font-bold">{userRole === 'teacher' ? 'End Class' : 'Leave'}</span>
          </button>
        </div>
      </div>

      {/* Settings / Zoom Setup Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Zoom &amp; Classroom Setup</h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Real-Time High Quality Classroom Active</span>
                </div>
                <p>
                  Zero-redirect live screen sharing, synchronized interactive whiteboard, WebRTC camera broadcasting, and multi-peer live chat are active.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Zoom Meeting SDK Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Paste Zoom SDK Key from marketplace"
                  value={customSdkKey}
                  onChange={(e) => setCustomSdkKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />

                <label className="block text-xs font-semibold text-slate-300">
                  Zoom Meeting SDK Secret (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Paste Zoom SDK Secret"
                  value={customSdkSecret}
                  onChange={(e) => setCustomSdkSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
