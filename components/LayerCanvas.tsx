
import React, { useRef, useEffect, useState } from 'react';
import { AppConfig } from '../types.ts';

interface LayerCanvasProps {
  config: AppConfig;
}

export const LayerCanvas: React.FC<LayerCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const lastTimeRef = useRef<number>(0);

  const render = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fix: Handle the first frame correctly to prevent a massive jump
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, w, h);

    const isCapturing = mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording';
    const timeScale = isCapturing ? 1 : Math.min(dt / 16.66, 3); 
    const ROTATION_MULTIPLIER = 0.02;

    offsetRef.current += config.speed * timeScale;
    if (config.isAutoRotating) {
        rotationRef.current += config.autoRotateSpeed * ROTATION_MULTIPLIER * timeScale;
    }

    ctx.save();
    const centerX = w / 2;
    const centerY = h / 2;
    const originX = centerX + (config.originX * w / 2);
    const originY = centerY + (config.originY * h / 2);
    const layerCount = Math.floor(config.count);
    
    ctx.font = `900 ${config.fontSize}px ${config.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Check for letterSpacing support (Experimental in some browsers)
    if ('letterSpacing' in ctx) {
      (ctx as any).letterSpacing = `${config.letterSpacing}px`;
    }

    for (let i = layerCount; i >= 0; i--) {
      let z = (i - offsetRef.current) % layerCount;
      if (z < 0) z += layerCount;
      
      const depthFactor = z / layerCount;
      const scale = Math.pow(1 - config.depth, z);
      
      if (scale < 0.001) continue;

      const currentX = centerX + (originX - centerX) * depthFactor;
      const currentY = centerY + (originY - centerY) * depthFactor;
      const layerRotation = (z * config.rotation * Math.PI / 180) + rotationRef.current;
      const alpha = Math.max(0, 1 - (z / (layerCount * 0.95)));

      ctx.save();
      ctx.translate(currentX, currentY);
      ctx.rotate(layerRotation);
      ctx.scale(scale, scale);
      
      const skewX = config.tiltX;
      const skewY = config.tiltY;
      ctx.transform(1, skewY, skewX, 1, 0, 0);
      ctx.globalAlpha = alpha;

      const drawText = (tx: number, ty: number, angle: number) => {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle);
        if (config.strokeMode) {
          ctx.strokeStyle = config.color;
          ctx.lineWidth = Math.max(0.1, config.strokeWidth / scale);
          ctx.strokeText(config.text, 0, 0);
        } else {
          ctx.fillStyle = config.color;
          ctx.fillText(config.text, 0, 0);
        }
        ctx.restore();
      };

      if (config.renderMode === 'box') {
        const bw = config.innerBoxWidth / 2;
        const bh = config.innerBoxHeight / 2;
        drawText(0, -bh, 0);
        drawText(0, bh, Math.PI);
        drawText(-bw, 0, -Math.PI / 2);
        drawText(bw, 0, Math.PI / 2);
      } else {
        if (config.strokeMode) {
          ctx.strokeStyle = config.color;
          ctx.lineWidth = Math.max(0.1, config.strokeWidth / scale);
          ctx.strokeText(config.text, 0, 0);
        } else {
          ctx.fillStyle = config.color;
          ctx.fillText(config.text, 0, 0);
        }
      }
      ctx.restore();
    }
    ctx.restore();
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [config]);

  useEffect(() => {
    (window as any).exportPNG = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `kinetic-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    (window as any).startVideoRecord = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 12000000 
      });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kinetic-render-${Date.now()}.webm`;
        a.click();
        setIsRecording(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    };

    (window as any).stopVideoRecord = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute top-0 left-0 cursor-crosshair" />
      {isRecording && (
        <div className="absolute top-8 left-8 flex items-center gap-3 z-50 pointer-events-none">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
          <span className="text-white text-[10px] font-black uppercase tracking-widest mix-blend-difference">
            RECORDING // STABLE MODE
          </span>
        </div>
      )}
    </div>
  );
};
