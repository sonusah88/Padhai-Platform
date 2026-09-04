'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Pin,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'teacher' | 'student' | 'system';
  avatar?: string;
  text: string;
  timestamp: string;
  isQuestion?: boolean;
  upvotes?: number;
  hasUpvoted?: boolean;
  isAnswered?: boolean;
  answer?: string;
}

interface LiveChatPanelProps {
  currentUserName: string;
  currentUserRole: 'teacher' | 'student';
  sessionId: string;
}

export function LiveChatPanel({
  currentUserName,
  currentUserRole,
  sessionId,
}: LiveChatPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat');
  const [inputText, setInputText] = useState('');
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [answeringMsgId, setAnsweringMsgId] = useState<string | null>(null);
  const [answerInputText, setAnswerInputText] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'System',
      role: 'system',
      text: '🎉 Welcome to tonight\'s live class! Keep discussions respectful and relevant to the lesson.',
      timestamp: '7:00 PM',
    },
    {
      id: 'm2',
      sender: 'Ram Sharma (Teacher)',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      text: 'Namaste everyone! Please ensure you have your notebook ready. We are starting with solving 2x + 5 = 17.',
      timestamp: '7:01 PM',
    },
    {
      id: 'm3',
      sender: 'Suman Shrestha',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      text: 'Sir, when we transpose +5 to the right side, does the sign always become negative?',
      timestamp: '7:03 PM',
      isQuestion: true,
      upvotes: 4,
      isAnswered: true,
      answer: 'Yes Suman, addition becomes subtraction when transposing across the equal sign.',
    },
    {
      id: 'm4',
      sender: 'Pooja Karki',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      text: 'Understood sir! x = 6.',
      timestamp: '7:04 PM',
    },
    {
      id: 'm5',
      sender: 'Bikash Thapa',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250',
      text: 'Can we also solve this using fractional coefficients like 3/4x - 2 = 7?',
      timestamp: '7:06 PM',
      isQuestion: true,
      upvotes: 7,
      isAnswered: false,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for instant cross-window sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(`padhai_live_${sessionId}`);
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const data = event.data;
          if (data && data.type === 'chat-message') {
            const incomingMsg: ChatMessage = data.payload;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incomingMsg.id)) return prev;
              return [...prev, incomingMsg];
            });
          } else if (data && data.type === 'chat-update') {
            const update = data.payload;
            setMessages((prev) =>
              prev.map((msg) => (msg.id === update.id ? { ...msg, ...update } : msg))
            );
          }
        };

        return () => {
          channel.close();
        };
      } catch {}
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: currentUserName + (currentUserRole === 'teacher' && !currentUserName.includes('Teacher') ? ' (Teacher)' : ''),
      role: currentUserRole,
      avatar: currentUserRole === 'teacher'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuestion: isQuestionMode || activeTab === 'qa',
      upvotes: (isQuestionMode || activeTab === 'qa') ? 1 : 0,
      hasUpvoted: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsQuestionMode(false);

    // Broadcast message to other tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'chat-message',
        payload: newMsg,
        senderId: 'chat',
        senderName: currentUserName,
        timestamp: Date.now(),
      });
    }

    // Also send to API
    fetch('/api/live/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        type: 'chat-message',
        payload: newMsg,
      }),
    }).catch(() => {});
  };

  const handleUpvote = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          const hasUpvoted = msg.hasUpvoted;
          const newUpvotes = (msg.upvotes || 0) + (hasUpvoted ? -1 : 1);
          const updatePayload = { id, upvotes: newUpvotes };

          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              type: 'chat-update',
              payload: updatePayload,
              senderId: 'chat',
              senderName: currentUserName,
              timestamp: Date.now(),
            });
          }

          return {
            ...msg,
            upvotes: newUpvotes,
            hasUpvoted: !hasUpvoted,
          };
        }
        return msg;
      })
    );
  };

  const submitAnswer = (id: string) => {
    if (!answerInputText.trim()) return;
    const answerText = answerInputText.trim();

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          const updatePayload = { id, isAnswered: true, answer: answerText };

          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              type: 'chat-update',
              payload: updatePayload,
              senderId: 'chat',
              senderName: currentUserName,
              timestamp: Date.now(),
            });
          }

          return {
            ...msg,
            isAnswered: true,
            answer: answerText,
          };
        }
        return msg;
      })
    );

    setAnsweringMsgId(null);
    setAnswerInputText('');
  };

  const filteredMessages = activeTab === 'qa'
    ? messages.filter((m) => m.isQuestion)
    : messages;

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-xs">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
        <div className="flex items-center gap-1.5 p-1 bg-[hsl(var(--muted))] rounded-lg">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
              activeTab === 'chat'
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all relative',
              activeTab === 'qa'
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs'
                : 'text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
            )}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[hsl(var(--secondary))]" />
            <span>Q&amp;A</span>
            <span className="w-4 h-4 rounded-full bg-[hsl(var(--secondary)/0.15)] text-[hsl(var(--secondary))] text-[10px] flex items-center justify-center font-bold">
              {messages.filter((m) => m.isQuestion && !m.isAnswered).length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--foreground-tertiary))]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Pinned announcement banner */}
      <div className="px-3.5 py-2 bg-[hsl(var(--primary-light))] border-b border-[hsl(var(--primary)/0.15)] flex items-center gap-2">
        <Pin className="w-3.5 h-3.5 text-[hsl(var(--primary))] shrink-0 -rotate-45" />
        <p className="text-xs text-[hsl(var(--foreground))] truncate">
          <span className="font-semibold text-[hsl(var(--primary))]">Teacher Pin:</span> Practice worksheet uploaded in Resources tab!
        </p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {filteredMessages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div
                key={msg.id}
                className="text-center p-2 rounded-lg bg-[hsl(var(--muted)/0.6)] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground-secondary))]"
              >
                {msg.text}
              </div>
            );
          }

          const isMe = msg.sender.startsWith(currentUserName);
          const isTeacher = msg.role === 'teacher';

          return (
            <div
              key={msg.id}
              className={cn(
                'group flex flex-col gap-1 rounded-xl p-3 text-xs transition-colors',
                msg.isQuestion
                  ? 'bg-[hsl(var(--secondary-light))] border border-[hsl(var(--secondary)/0.25)]'
                  : isTeacher
                  ? 'bg-[hsl(var(--primary-light))] border border-[hsl(var(--primary)/0.15)]'
                  : 'bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted)/0.7)]'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-[hsl(var(--primary)/0.2)] shrink-0 flex items-center justify-center font-bold text-[10px]">
                    {msg.sender[0]}
                  </div>
                  <span
                    className={cn(
                      'font-semibold text-xs',
                      isTeacher
                        ? 'text-[hsl(var(--primary))]'
                        : isMe
                        ? 'text-[hsl(var(--foreground))] font-bold'
                        : 'text-[hsl(var(--foreground))]'
                    )}
                  >
                    {msg.sender}
                  </span>
                  {msg.isQuestion && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[hsl(var(--secondary)/0.2)] text-[hsl(var(--secondary))]">
                      QUESTION
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">{msg.timestamp}</span>
              </div>

              <p className="text-[hsl(var(--foreground))] leading-relaxed pl-7">{msg.text}</p>

              {/* Question Upvote & Answers */}
              {msg.isQuestion && (
                <div className="mt-1 pl-7 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpvote(msg.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors',
                        msg.hasUpvoted
                          ? 'bg-[hsl(var(--secondary)/0.15)] text-[hsl(var(--secondary))] border-[hsl(var(--secondary)/0.3)]'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.8)]'
                      )}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{msg.upvotes || 0} Helpful</span>
                    </button>

                    {msg.isAnswered ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Answered</span>
                      </span>
                    ) : currentUserRole === 'teacher' ? (
                      <button
                        onClick={() => setAnsweringMsgId(answeringMsgId === msg.id ? null : msg.id)}
                        className="text-[11px] font-semibold text-[hsl(var(--primary))] hover:underline"
                      >
                        {answeringMsgId === msg.id ? 'Cancel' : 'Reply Answer'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-[hsl(var(--foreground-tertiary))]">Pending Answer</span>
                    )}
                  </div>

                  {/* Teacher's Official Answer Bubble */}
                  {msg.isAnswered && msg.answer && (
                    <div className="p-2.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))] space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--primary))]">
                        <Sparkles className="w-3 h-3" />
                        <span>Teacher&apos;s Answer</span>
                      </div>
                      <p>{msg.answer}</p>
                    </div>
                  )}

                  {/* Inline Reply Input for Teacher */}
                  {answeringMsgId === msg.id && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Type answer to this doubt..."
                        value={answerInputText}
                        onChange={(e) => setAnswerInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitAnswer(msg.id)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs focus:outline-hidden focus:border-[hsl(var(--primary))]"
                      />
                      <button
                        onClick={() => submitAnswer(msg.id)}
                        className="px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-xs"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsQuestionMode(!isQuestionMode)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors',
              isQuestionMode || activeTab === 'qa'
                ? 'bg-[hsl(var(--secondary)/0.15)] text-[hsl(var(--secondary))] border border-[hsl(var(--secondary)/0.3)]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))]'
            )}
          >
            <HelpCircle className="w-3 h-3" />
            <span>{isQuestionMode || activeTab === 'qa' ? 'Asking Question / Doubt' : 'Ask Question'}</span>
          </button>

          <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">Press Enter to send</span>
        </div>

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isQuestionMode || activeTab === 'qa'
                ? 'Type your doubt/question to the teacher...'
                : 'Send message to class...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-[hsl(var(--muted)/0.6)] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-hidden focus:border-[hsl(var(--primary))] transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] disabled:opacity-40 disabled:cursor-not-allowed text-[hsl(var(--primary-foreground))] transition-all shrink-0"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
