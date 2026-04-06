'use client';

import React from 'react';
import { useCanvasStore, Tool, ShapeType } from '@/store/canvasStore';
import { useSettingsStore } from '@/store/settingsStore';
import { 
  MousePointer2, 
  PenLine, 
  Highlighter, 
  Eraser, 
  Square, 
  Circle, 
  Minus,
  Sun,
  Moon,
  Eye,
  Coffee
} from 'lucide-react';
import { ThemeMode } from '@/types';

const COLORS = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF'];
const TOOLS: { id: Tool; icon: any; label: string }[] = [
  { id: 'cursor', icon: MousePointer2, label: 'Select' },
  { id: 'pen', icon: PenLine, label: 'Pen' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'shape', icon: Square, label: 'Shapes' },
];

const SHAPES: { id: ShapeType; icon: any; label: string }[] = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'line', icon: Minus, label: 'Line' },
];

const THEMES: { id: ThemeMode; icon: any; label: string }[] = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'sepia', icon: Coffee, label: 'Sepia' },
  { id: 'night', icon: Moon, label: 'Night' },
  { id: 'eye-protection', icon: Eye, label: 'Eye Care' },
];

export default function Toolbar() {
  const { activeTool, activeColor, activeShape, setActiveTool, setActiveColor, setActiveShape } = useCanvasStore();
  const { theme, setTheme } = useSettingsStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="flex items-center gap-2 p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-lg rounded-2xl pointer-events-auto border border-zinc-200 dark:border-zinc-800">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-2 rounded-xl transition-colors ${
              activeTool === tool.id 
                ? 'bg-accent text-white' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            title={tool.label}
          >
            <tool.icon size={20} />
          </button>
        ))}

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {activeTool === 'shape' && (
          <div className="flex gap-1">
            {SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setActiveShape(shape.id)}
                className={`p-2 rounded-xl transition-colors ${
                  activeShape === shape.id 
                    ? 'bg-accent/20 text-accent' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
                title={shape.label}
              >
                <shape.icon size={20} />
              </button>
            ))}
          </div>
        )}

        {activeTool !== 'eraser' && activeTool !== 'cursor' && (
          <div className="flex gap-1 ml-1">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setActiveColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  activeColor === color ? 'scale-110 border-zinc-400' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 p-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-md rounded-xl pointer-events-auto border border-zinc-200 dark:border-zinc-800 w-fit mx-auto">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === t.id 
                ? 'bg-accent/10 text-accent' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}
            title={t.label}
          >
            <t.icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}