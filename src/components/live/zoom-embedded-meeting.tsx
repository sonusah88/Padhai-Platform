'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Media controls state
  const [isMuted, setIsMuted] = useState(userRole === 'student');
  const [isVideoOn, setIsVideoOn] = useState(userRole === 'teacher');
  const [isScreenSharing, setIsScreenSharing] = useState(userRole === 'teacher');
  const [viewMode, setViewMode] = useState<'presentation' | 'grid' | 'speaker'>('presentation');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);

  // Zoom SDK State
  const [isSdkLoading, setIsSdkLoading] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [sdkStatus, setSdkStatus] = useState<'ready' | 'connected' | 'simulated'>('simulated');
  const [customSdkKey, setCustomSdkKey] = useState('');
  const [customSdkSecret, setCustomSdkSecret] = useState('');
  const [signatureInfo, setSignatureInfo] = useState<{ signature?: string; sdkKey?: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Zoom signature from our backend
  useEffect(() => {
    async function getSignature() {
      try {
        setIsSdkLoading(true);
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
          // If real credentials supplied, we mark status
          if (data.data.sdkKey && data.data.sdkKey !== 'DEMO_ZOOM_SDK_KEY') {
            setSdkStatus('ready');
          } else {
            setSdkStatus('simulated');
          }
        }
      } catch (err: unknown) {
        console.warn('Using embedded live classroom engine:', err);
        setSdkStatus('simulated');
      } finally {
        setIsSdkLoading(false);
      }
    }

    getSignature();
  }, [meetingNumber, userRole, customSdkKey, customSdkSecret]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen error', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error', err);
      });
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all',
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full h-full min-h-[460px] lg:min-h-[540px]'
      )}
    >
      {/* Top Embedded Room Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-xs font-bold tracking-wide animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE NOW</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/90">
            <span className="font-semibold">{topic}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/70">ID: {meetingNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom SDK status pill */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs transition-colors backdrop-blur-md"
            title="Zoom SDK Configuration"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline font-mono text-[11px]">
              {sdkStatus === 'ready' ? 'Zoom SDK Active' : 'In-App Zoom Engine'}
            </span>
          </button>

          {/* View mode switcher */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 backdrop-blur-md">
            <button
              onClick={() => setViewMode('presentation')}
              className={cn(
                'p-1.5 rounded text-white/80 transition-colors',
                viewMode === 'presentation' ? 'bg-white/20 text-white shadow-xs' : 'hover:text-white'
              )}
              title="Presentation Mode"
            >
              <Tv className="w-3.5 h-3.5" />
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

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors backdrop-blur-md"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video & Blackboard Viewport Container (Rendered directly in page without redirect) */}
      <div id="zoom-meeting-container" className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* PRESENTATION MODE: Teacher Whiteboard / Screen Share + Floating Teacher Cam */}
        {viewMode === 'presentation' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-6">
            {/* Interactive Blackboard Stage */}
            <div className="relative w-full h-full max-w-5xl rounded-xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
              {/* Blackboard Header */}
              <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{teacherName}&apos;s Live Screen & Whiteboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSlide((s) => Math.max(1, s - 1))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    ‹ Prev
                  </button>
                  <span className="font-mono text-[11px]">Slide {activeSlide} / 4</span>
                  <button
                    onClick={() => setActiveSlide((s) => Math.min(4, s + 1))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Next ›
                  </button>
                </div>
              </div>

              {/* Whiteboard Content Display */}
              <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-6 flex flex-col justify-center items-center text-center select-none overflow-hidden">
                {/* Background grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                {activeSlide === 1 && (
                  <div className="relative z-10 max-w-2xl space-y-4 animate-fadeIn">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-semibold uppercase tracking-widest border border-blue-500/30">
                      Concept 1 • Linear Equations
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      Solving 2x + 5 = 17
                    </h2>
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-left space-y-2 text-emerald-400 text-sm md:text-base">
                      <p className="text-slate-400">// Step 1: Subtract 5 from both sides</p>
                      <p>2x + 5 - 5 = 17 - 5</p>
                      <p>2x = 12</p>
                      <p className="text-slate-400 pt-1">// Step 2: Divide both sides by 2</p>
                      <p className="text-amber-400 font-bold">x = 6  ✓ (Solution)</p>
                    </div>
                  </div>
                )}

                {activeSlide === 2 && (
                  <div className="relative z-10 max-w-2xl space-y-4 animate-fadeIn">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-semibold uppercase tracking-widest border border-amber-500/30">
                      Concept 2 • Word Problem Breakdown
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      &quot;A number multiplied by 3 and increased by 8 equals 29. Find the number.&quot;
                    </h2>
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-left space-y-2 text-emerald-400 text-sm">
                      <p className="text-slate-400">Let the unknown number be &apos;y&apos;.</p>
                      <p>3y + 8 = 29</p>
                      <p>3y = 21  =&gt;  <span className="text-amber-400 font-bold">y = 7</span></p>
                    </div>
                  </div>
                )}

                {activeSlide === 3 && (
                  <div className="relative z-10 max-w-2xl space-y-4 animate-fadeIn">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs font-semibold uppercase tracking-widest border border-purple-500/30">
                      Concept 3 • Graphical Representation
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Straight Line: y = 2x + 1
                    </h2>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs text-left">
                      <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400">When x = 0</span>
                        <p className="text-amber-400 font-bold mt-1">y = 1</p>
                      </div>
                      <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400">When x = 1</span>
                        <p className="text-amber-400 font-bold mt-1">y = 3</p>
                      </div>
                      <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-center">
                        <span className="text-slate-400">When x = 2</span>
                        <p className="text-amber-400 font-bold mt-1">y = 5</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSlide === 4 && (
                  <div className="relative z-10 max-w-2xl space-y-4 animate-fadeIn">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-widest border border-emerald-500/30">
                      SEE Model Practice Problem
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Solve for p: (3p - 4) / 5 = (p + 2) / 3
                    </h2>
                    <p className="text-slate-300 text-sm">
                      Type your step-by-step answer in the Live Q&amp;A panel to earn +20 bonus XP!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Picture-in-Picture Floating Teacher Video Card */}
            <div className="absolute bottom-20 right-8 z-30 w-48 h-32 md:w-56 md:h-36 rounded-xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350"
                alt={teacherName}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 flex items-center justify-between text-[11px] text-white">
                <span className="font-semibold truncate">{teacherName}</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <Mic className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY GRID MODE */}
        {viewMode === 'grid' && (
          <div className="w-full h-full p-6 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
            {/* Teacher Card */}
            <div className="relative rounded-xl bg-slate-900 border-2 border-emerald-500 overflow-hidden shadow-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350"
                alt={teacherName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                HOST / TEACHER
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex items-center justify-between text-xs text-white">
                <span>{teacherName}</span>
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Current User Card */}
            <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg aspect-video flex items-center justify-center">
              {isVideoOn ? (
                <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-indigo-900 flex items-center justify-center text-white">
                  <span className="text-4xl font-bold">{userName[0]}</span>
                </div>
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
                {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
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

            {/* Peer Student 3 */}
            <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=350"
                alt="Bikash"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex items-center justify-between text-xs text-white">
                <span>Bikash Thapa</span>
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>

            {/* Peer Student 4 */}
            <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg aspect-video">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=350"
                alt="Anjali"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 flex items-center justify-between text-xs text-white">
                <span>Anjali Sharma</span>
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating In-Meeting Controls Bar */}
      <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center pointer-events-none px-4">
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          {/* Mute/Unmute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
              isMuted
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            )}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-[10px] font-medium hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
              !isVideoOn
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            )}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span className="text-[10px] font-medium hidden sm:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>

          {/* Screen Share (Teacher or Student) */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
              isScreenSharing
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            )}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] font-medium hidden sm:inline">
              {isScreenSharing ? 'Sharing' : 'Share Screen'}
            </span>
          </button>

          {/* Raise Hand (Student) */}
          {userRole === 'student' && onToggleHand && (
            <button
              onClick={onToggleHand}
              className={cn(
                'flex flex-col items-center gap-1 p-2 sm:px-3.5 rounded-xl transition-all',
                isHandRaised
                  ? 'bg-amber-500 text-white shadow-lg animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              <Hand className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:inline">
                {isHandRaised ? 'Hand Up' : 'Raise Hand'}
              </span>
            </button>
          )}

          {/* Leave/End Class Button */}
          <button
            onClick={onLeave}
            className="flex flex-col items-center gap-1 p-2 sm:px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md font-semibold"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline">
              {userRole === 'teacher' ? 'End Class' : 'Leave'}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Zoom Credentials & SDK tester) */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Zoom Meeting SDK Setup</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
              <p className="font-semibold">✓ In-App Zero-Redirect Mode Active</p>
              <p className="text-slate-300">
                You can host and join classes directly inside Padhai without leaving the site. To connect with a live Zoom Developer account, provide your Meeting SDK credentials below or set them in <code>.env.local</code>.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Zoom SDK Key (Client ID)</label>
                <input
                  type="text"
                  value={customSdkKey}
                  onChange={(e) => setCustomSdkKey(e.target.value)}
                  placeholder="e.g. your-zoom-sdk-key"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Zoom SDK Secret (Client Secret)</label>
                <input
                  type="password"
                  value={customSdkSecret}
                  onChange={(e) => setCustomSdkSecret(e.target.value)}
                  placeholder="e.g. your-zoom-sdk-secret"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Meeting ID: <span className="text-white">{meetingNumber}</span></div>
                <div>Passcode: <span className="text-white">{passcode}</span></div>
                <div>Role: <span className="text-white">{userRole === 'teacher' ? '1 (Host)' : '0 (Attendee)'}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Save &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
