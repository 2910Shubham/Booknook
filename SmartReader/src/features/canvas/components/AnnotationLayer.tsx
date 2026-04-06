'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCanvasStore, Tool, ShapeType } from '@/store/canvasStore';
import { drawSmoothLine } from '../utils/canvasHelpers';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: Tool;
  shape?: ShapeType;
}

interface AnnotationLayerProps {
  offset: { x: number; y: number };
}

export default function AnnotationLayer({ offset }: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeTool, activeColor, strokeWidth, activeShape } = useCanvasStore();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'cursor') return;
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentStroke([pos]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTool === 'cursor') return;
    const pos = getPos(e);
    
    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      setCurrentStroke(prev => [...prev, pos]);
    } else if (activeTool === 'shape') {
      setCurrentStroke([currentStroke[0], pos]);
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const newStroke: Stroke = {
      points: currentStroke,
      color: activeColor,
      width: activeTool === 'highlighter' ? 20 : strokeWidth,
      tool: activeTool,
      shape: activeTool === 'shape' ? activeShape : undefined,
    };
    
    setStrokes(prev => [...prev, newStroke]);
    setCurrentStroke([]);
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const drawStroke = (stroke: Stroke, isDraft = false) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.4;
      } else if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 30;
      } else {
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      if (stroke.tool === 'shape') {
        const [start, end] = stroke.points;
        if (!start || !end) return;
        
        if (stroke.shape === 'rectangle') {
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (stroke.shape === 'circle') {
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (stroke.shape === 'line') {
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      } else {
        if (stroke.points.length < 2) return;
        drawSmoothLine(ctx, stroke.points);
      }
      
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    };

    strokes.forEach(s => drawStroke(s));
    
    if (isDrawing && currentStroke.length > 0) {
      drawStroke({
        points: currentStroke,
        color: activeColor,
        width: activeTool === 'highlighter' ? 20 : strokeWidth,
        tool: activeTool,
        shape: activeTool === 'shape' ? activeShape : undefined,
      }, true);
    }
  }, [strokes, currentStroke, isDrawing, activeColor, strokeWidth, activeTool, activeShape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
  }, [redraw]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${activeTool === 'cursor' ? 'pointer-events-none' : ''}`}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
    />
  );
}