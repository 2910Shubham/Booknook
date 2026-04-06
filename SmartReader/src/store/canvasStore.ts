import { create } from 'zustand';

export type Tool = 'cursor' | 'pen' | 'highlighter' | 'eraser' | 'shape';
export type ShapeType = 'rectangle' | 'circle' | 'line';

interface CanvasState {
  activeTool: Tool;
  activeColor: string;
  strokeWidth: number;
  activeShape: ShapeType;
  
  setActiveTool: (tool: Tool) => void;
  setActiveColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setActiveShape: (shape: ShapeType) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: 'cursor',
  activeColor: '#000000',
  strokeWidth: 2,
  activeShape: 'rectangle',

  setActiveTool: (activeTool) => set({ activeTool }),
  setActiveColor: (activeColor) => set({ activeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setActiveShape: (activeShape) => set({ activeShape }),
}));