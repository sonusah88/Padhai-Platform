'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Plus,
  Sparkles,
  Eraser,
  PenTool,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveWhiteboardNotesProps {
  sessionTitle: string;
  subject: string;
}

export function LiveWhiteboardNotes({ sessionTitle, subject }: LiveWhiteboardNotesProps) {
  const [notes, setNotes] = useState<string>(`# Class Notes: ${sessionTitle}
**Subject**: ${subject}
**Date**: ${new Date().toLocaleDateString('en-GB')}

---
### Key Formulae & Concepts
1. Standard Linear Form: ax + b = c  =>  x = (c - b) / a
2. Transposition Rule: Addition becomes subtraction across '=' sign.
3. Multiplication / Division: If ax = b, then x = b / a (a ≠ 0).

---
### Solved Board Examples:
• Example 1: 3x + 9 = 24
  => 3x = 24 - 9
  => 3x = 15
  => x = 5

• Example 2 (Fractional):
  (x / 4) + 3 = 8
  => x / 4 = 5
  => x = 20

---
### Homework / Assignment:
- Textbook Exercise 4.2: Questions 1 to 10.
- Daily Challenge in Practice Tab.`);

  const [copied, setCopied] = useState(false);

  const formulaShortcuts = [
    { label: 'x = (c - b) / a', text: 'x = (c - b) / a' },
    { label: '√x', text: '√(' },
    { label: '∑', text: '∑' },
    { label: 'θ', text: 'θ' },
    { label: 'π', text: 'π' },
    { label: 'Δ', text: 'Δ' },
    { label: 'a²', text: '²' },
    { label: '≠', text: '≠' },
    { label: '±', text: '±' },
    { label: '÷', text: '÷' },
    { label: 'λ', text: 'λ' },
  ];

  const insertShortcut = (snippet: string) => {
    setNotes((prev) => prev + ` ${snippet} `);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sessionTitle.replace(/[^a-zA-Z0-9]/g, '_')}_notes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Smart Live Notes & Whiteboard</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted)/0.8)] text-[hsl(var(--foreground))] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Math Formula Toolbar */}
      <div className="p-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-wrap items-center gap-1">
        <span className="text-[10px] font-semibold text-[hsl(var(--foreground-tertiary))] uppercase tracking-wider mr-1">
          Quick Math:
        </span>
        {formulaShortcuts.map((item) => (
          <button
            key={item.label}
            onClick={() => insertShortcut(item.text)}
            className="px-2 py-0.5 text-xs font-mono rounded bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary-light))] hover:text-[hsl(var(--primary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] transition-colors"
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setNotes('')}
          className="ml-auto p-1 text-[10px] text-[hsl(var(--foreground-tertiary))] hover:text-red-500 transition-colors flex items-center gap-1"
          title="Clear notes"
        >
          <Eraser className="w-3 h-3" />
        </button>
      </div>

      {/* Editor text area */}
      <div className="flex-1 p-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take collaborative class notes, write equations, or copy teacher board solutions..."
          className="w-full h-full p-3 font-mono text-xs leading-relaxed bg-[hsl(var(--muted)/0.2)] text-[hsl(var(--foreground))] rounded-lg border border-[hsl(var(--border))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        />
      </div>

      <div className="px-3.5 py-1.5 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] text-[10px] text-[hsl(var(--foreground-tertiary))] flex items-center justify-between">
        <span>Autosaved locally to your session</span>
        <span>{notes.length} characters</span>
      </div>
    </div>
  );
}
