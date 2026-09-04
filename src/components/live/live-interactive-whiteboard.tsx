'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  Minus,
  RotateCcw,
  Download,
  Trash2,
  Type,
  Sparkles,
  Palette,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveInteractiveWhiteboardProps {
  isTeacher: boolean;
  topicTitle: string;
  onStroke?: (strokeData: any) => void;
  onClear?: () => void;
  remoteEvent?: any;
}

type Tool = 'pen' | 'eraser' | 'line' | 'rect' | 'circle';

export function LiveInteractiveWhiteboard({
  isTeacher,
  topicTitle,
  onStroke,
  onClear,
  remoteEvent,
}: LiveInteractiveWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#10b981'); // Emerald default
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  const colors = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Blue', hex: '#38bdf8' },
    { name: 'Amber', hex: '#fbbf24' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Purple', hex: '#c084fc' },
  ];

  // Helper to draw background grid & header
  const redrawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Draw grid dots
    ctx.fillStyle = '#1e293b';
    const spacing = 32;
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw default title watermark
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`📐 Padhai Live Board: ${topicTitle}`, 24, 32);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('// Write formulas, equations, or sketch diagrams collaboratively in real-time', 24, 52);
  }, [topicTitle]);

  // Initialize Canvas on mount & resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = containerRef.current || canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      if (width === 0 || height === 0) return;

      if (canvas.width !== width || canvas.height !== height) {
        // Save current canvas content if exists
        let prevImg: ImageData | null = null;
        if (canvas.width > 0 && canvas.height > 0) {
          try {
            prevImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch {}
        }

        canvas.width = width;
        canvas.height = height;

        if (!prevImg) {
          redrawBackground(ctx, width, height);
          setHistory([ctx.getImageData(0, 0, width, height)]);
        } else {
          redrawBackground(ctx, width, height);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawBackground]);

  // Handle incoming remote stroke from peer / teacher
  useEffect(() => {
    if (!remoteEvent) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    if (remoteEvent.type === 'whiteboard-clear' || remoteEvent.type === 'clear') {
      redrawBackground(ctx, width, height);
      return;
    }

    const payload = remoteEvent.payload || remoteEvent;
    if (!payload.tool) return;

    ctx.save();
    ctx.strokeStyle = payload.tool === 'eraser' ? '#090d16' : payload.color || '#10b981';
    ctx.lineWidth = payload.tool === 'eraser' ? (payload.lineWidth || 3) * 4 : payload.lineWidth || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Support both normalized (0..1) and pixel coordinates
    const toPx = (pt: { x: number; y: number }) => {
      const x = pt.x <= 1.0 ? pt.x * width : pt.x;
      const y = pt.y <= 1.0 ? pt.y * height : pt.y;
      return { x, y };
    };

    if (payload.tool === 'pen' || payload.tool === 'eraser') {
      if (payload.points && payload.points.length > 1) {
        ctx.beginPath();
        const p0 = toPx(payload.points[0]);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < payload.points.length; i++) {
          const pi = toPx(payload.points[i]);
          ctx.lineTo(pi.x, pi.y);
        }
        ctx.stroke();
      }
    } else if (payload.tool === 'line' && payload.start && payload.end) {
      const p1 = toPx(payload.start);
      const p2 = toPx(payload.end);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else if (payload.tool === 'rect' && payload.start && payload.end) {
      const p1 = toPx(payload.start);
      const p2 = toPx(payload.end);
      const w = p2.x - p1.x;
      const h = p2.y - p1.y;
      ctx.strokeRect(p1.x, p1.y, w, h);
    } else if (payload.tool === 'circle' && payload.start && payload.end) {
      const p1 = toPx(payload.start);
      const p2 = toPx(payload.end);
      const radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (payload.tool === 'formula' && payload.text) {
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = payload.color || '#10b981';
      const p = toPx({ x: payload.x || 0.1, y: payload.y || 0.2 });
      ctx.fillText(payload.text, p.x, p.y);
    }
    ctx.restore();
  }, [remoteEvent, redrawBackground]);

  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imgData]);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);
    setCurrentPath([coords]);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = currentTool === 'eraser' ? '#090d16' : color;
      ctx.lineWidth = currentTool === 'eraser' ? lineWidth * 4 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setCurrentPath((prev) => [...prev, coords]);
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (currentTool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (currentTool === 'rect') {
        const w = coords.x - startPos.x;
        const h = coords.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, w, h);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const endCoords = getCoordinates(e);
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    // Convert to normalized coordinates (0..1) so it renders identically across different client screen sizes
    const toNorm = (pt: { x: number; y: number }) => ({
      x: Number((pt.x / width).toFixed(4)),
      y: Number((pt.y / height).toFixed(4)),
    });

    // Broadcast stroke to remote peers
    if (onStroke) {
      if (currentTool === 'pen' || currentTool === 'eraser') {
        const allPoints = [...currentPath, endCoords].map(toNorm);
        onStroke({
          tool: currentTool,
          color,
          lineWidth,
          points: allPoints,
        });
      } else if (startPos) {
        onStroke({
          tool: currentTool,
          color,
          lineWidth,
          start: toNorm(startPos),
          end: toNorm(endCoords),
        });
      }
    }

    saveStateToHistory();
    setStartPos(null);
    setCurrentPath([]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawBackground(ctx, canvas.width, canvas.height);
    saveStateToHistory();

    if (onClear) onClear();
  };

  const handleInsertFormula = (formula: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = color;
    const x = 50 + Math.random() * (canvas.width - 250);
    const y = 100 + Math.random() * (canvas.height - 180);
    ctx.fillText(formula, x, y);
    saveStateToHistory();

    if (onStroke) {
      onStroke({
        tool: 'formula',
        text: formula,
        color,
        x: Number((x / canvas.width).toFixed(4)),
        y: Number((y / canvas.height).toFixed(4)),
      });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Padhai_Whiteboard_${Date.now()}.png`;
    a.click();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Interactive Toolbar */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Drawing Tools Bar */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md">
          <button
            onClick={() => setCurrentTool('pen')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentTool === 'pen' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
            title="Pen (Freehand Draw)"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('eraser')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentTool === 'eraser' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('line')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentTool === 'line' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
            title="Straight Line"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('rect')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentTool === 'rect' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTool('circle')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              currentTool === 'circle' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Color Picker Palette */}
          <div className="flex items-center gap-1 px-1">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className={cn(
                  'w-4 h-4 rounded-full transition-transform',
                  color === c.hex ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Line Width */}
          <div className="flex items-center gap-1 px-1 text-xs text-slate-400">
            <button
              onClick={() => setLineWidth(2)}
              className={cn('w-4 h-4 rounded flex items-center justify-center font-bold text-[10px]', lineWidth === 2 ? 'bg-slate-700 text-white' : '')}
            >
              S
            </button>
            <button
              onClick={() => setLineWidth(4)}
              className={cn('w-4 h-4 rounded flex items-center justify-center font-bold text-[10px]', lineWidth === 4 ? 'bg-slate-700 text-white' : '')}
            >
              M
            </button>
            <button
              onClick={() => setLineWidth(8)}
              className={cn('w-4 h-4 rounded flex items-center justify-center font-bold text-[10px]', lineWidth === 8 ? 'bg-slate-700 text-white' : '')}
            >
              L
            </button>
          </div>
        </div>

        {/* Quick Math Formulas & Actions */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md">
          {isTeacher && (
            <div className="hidden md:flex items-center gap-1 pr-1 border-r border-slate-700">
              {['2x + 5 = 17', 'a² + b² = c²', 'E = mc²', '∫ f(x)dx', 'sin²θ + cos²θ = 1'].map((formula) => (
                <button
                  key={formula}
                  onClick={() => handleInsertFormula(formula)}
                  className="px-2 py-1 rounded-md text-[11px] font-mono text-emerald-400 bg-slate-800/80 hover:bg-slate-700 transition-colors"
                  title={`Insert ${formula}`}
                >
                  {formula}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleUndo}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-colors"
            title="Save PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save PNG</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Element */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full cursor-crosshair block"
      />
    </div>
  );
}
