'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCanvasStore, Tool } from '@/store/canvasStore';
import { useSettingsStore } from '@/store/settingsStore';
import Toolbar from './Toolbar';
import DocumentLayer from './DocumentLayer';
import AnnotationLayer from './AnnotationLayer';

export default function SmartBoardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const theme = useSettingsStore((s) => s.theme);
  
  // Canvas offset for panning
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'cursor' && e.button === 0) {
      setIsPanning(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPos]);

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, handleMouseMove]);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden select-none bg-canvas-bg"
      style={{ backgroundColor: 'var(--canvas-bg)' }}
      onMouseDown={handleMouseDown}
      data-theme={theme}
    >
      <Toolbar />
      
      <div 
        ref={containerRef}
        className="absolute inset-0 transition-transform duration-0 ease-linear"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <DocumentLayer />
        <AnnotationLayer offset={offset} />
      </div>
    </div>
  );
}