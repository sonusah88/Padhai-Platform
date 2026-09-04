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
}: LiveChatPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat');
  const [inputText, setInputText] = useState('');
  const [isQuestionMode, setIsQuestionMode] = useState(false);
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
      id: `msg-${Date.now()}`,
      sender: currentUserName + (currentUserRole === 'teacher' ? ' (Teacher)' : ''),
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
  };

  const handleUpvote = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          const hasUpvoted = msg.hasUpvoted;
          return {
            ...msg,
            upvotes: (msg.upvotes || 0) + (hasUpvoted ? -1 : 1),
            hasUpvoted: !hasUpvoted,
          };
        }
        return msg;
      })
    );
  };

  const handleAnswerQuestion = (id: string, answerText: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          return {
            ...msg,
            isAnswered: true,
            answer: answerText,
          };
        }
        return msg;
      })
    );
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
            <span>Q&A</span>
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
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[hsl(var(--secondary))] text-white">
                      Question
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">
                  {msg.timestamp}
                </span>
              </div>

              <p className="text-xs text-[hsl(var(--foreground))] pl-7 leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>

              {/* Question Upvotes & Answer Box */}
              {msg.isQuestion && (
                <div className="pl-7 mt-1.5 space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpvote(msg.id)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors',
                        msg.hasUpvoted
                          ? 'bg-[hsl(var(--secondary))] text-white border-[hsl(var(--secondary))]'
                          : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground-secondary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                      )}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{msg.upvotes || 0} Upvotes</span>
                    </button>

                    {msg.isAnswered ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Answered
                      </span>
                    ) : (
                      currentUserRole === 'teacher' && (
                        <button
                          onClick={() => {
                            const ans = prompt('Write teacher answer for this question:');
                            if (ans) handleAnswerQuestion(msg.id, ans);
                          }}
                          className="text-[11px] font-semibold text-[hsl(var(--primary))] hover:underline"
                        >
                          Reply as Teacher
                        </button>
                      )
                    )}
                  </div>

                  {msg.isAnswered && msg.answer && (
                    <div className="p-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[11px] text-[hsl(var(--foreground))]">
                      <span className="font-semibold text-[hsl(var(--primary))]">Teacher Answer: </span>
                      {msg.answer}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] flex flex-col gap-2"
      >
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setIsQuestionMode(!isQuestionMode)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors font-medium',
              isQuestionMode || activeTab === 'qa'
                ? 'bg-[hsl(var(--secondary))] text-white'
                : 'text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))]'
            )}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isQuestionMode || activeTab === 'qa' ? 'Asking Question' : 'Ask a Question'}</span>
          </button>

          <span className="text-[10px] text-[hsl(var(--foreground-tertiary))]">
            Press Enter ↵ to send
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isQuestionMode || activeTab === 'qa'
                ? 'Type your question for the teacher...'
                : 'Send message in live class...'
            }
            className="flex-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg px-3.5 py-2 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[hsl(var(--primary-hover))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
