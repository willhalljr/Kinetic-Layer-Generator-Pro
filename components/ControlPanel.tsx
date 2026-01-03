
import React, { useState, useRef, useEffect } from 'react';
import { AppConfig, DEFAULT_CONFIG, PRESETS, RenderMode } from '../types.ts';
import { saveFont, getAllFonts } from '../fontDb.ts';

interface ControlPanelProps {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
  onAIGenerate: (prompt: string) => void;
  onDeploy: () => void;
  isGenerating: boolean;
}

const ControlGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 px-6">
    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 border-b border-white/10 pb-1">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Slider: React.FC<{ 
  label: string, 
  value: number, 
  min: number, 
  max: number, 
  step: number, 
  name: keyof AppConfig,
  onChange: (updates: Partial<AppConfig>) => void 
}> = ({ label, value, min, max, step, name, onChange }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center text-[11px] font-mono text-white/70">
      <span>{label}</span>
      <input 
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange({ [name]: parseFloat(e.target.value) || 0 })}
        className="bg-white/10 px-1 rounded w-16 text-right focus:outline-none focus:bg-white/20 transition-colors"
      />
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e) => onChange({ [name]: parseFloat(e.target.value) })}
      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer hover:bg-white/30 transition-colors"
    />
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange, onAIGenerate, onDeploy, isGenerating }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [customPresets, setCustomPresets] = useState<Record<string, AppConfig>>({});
  const [newPresetName, setNewPresetName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const restoreData = async () => {
      try {
        const storedFonts = await getAllFonts();
        for (const f of storedFonts) {
          const fontFace = new FontFace(f.name, f.data);
          const loadedFace = await fontFace.load();
          document.fonts.add(loadedFace);
        }
        
        const activeFontName = localStorage.getItem('kinetic_active_font');
        if (activeFontName && activeFontName.startsWith('UploadedFont_')) {
          onChange({ fontFamily: activeFontName });
        }

        const saved = localStorage.getItem('kinetic_custom_presets');
        if (saved) {
          setCustomPresets(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to restore data:", err);
      }
    };
    restoreData();
  }, []);

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    const updated = { ...customPresets, [newPresetName]: { ...config } };
    setCustomPresets(updated);
    localStorage.setItem('kinetic_custom_presets', JSON.stringify(updated));
    setNewPresetName("");
  };

  const handleDeletePreset = (name: string) => {
    const updated = { ...customPresets };
    delete updated[name];
    setCustomPresets(updated);
    localStorage.setItem('kinetic_custom_presets', JSON.stringify(updated));
  };

  const handlePNG = () => (window as any).exportPNG?.();
  const handleRecord = () => {
    if (isRecording) {
      (window as any).stopVideoRecord?.();
      setIsRecording(false);
    } else {
      (window as any).startVideoRecord?.();
      setIsRecording(true);
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fontName = `UploadedFont_${Date.now()}`;
      const fontData = await file.arrayBuffer();
      await saveFont({ name: fontName, data: fontData });
      const fontFace = new FontFace(fontName, fontData);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      onChange({ fontFamily: fontName });
      localStorage.setItem('kinetic_active_font', fontName);
    } catch (err) {
      console.error("Failed to load custom font:", err);
      alert("Could not load font file.");
    }
  };

  return (
    <div className="py-8 bg-black">
      <div className="px-6 mb-8">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Primary Text</label>
        <textarea 
          value={config.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full bg-white/5 border border-white/10 text-white p-3 font-black text-sm uppercase tracking-tighter h-20 focus:outline-none focus:border-white/40 transition-colors resize-none leading-tight"
          placeholder="TYPE SOMETHING..."
        />
      </div>

      <ControlGroup title="Render Mode">
        <div className="flex gap-2">
          {(['box', 'stack'] as RenderMode[]).map(m => (
            <button
              key={m}
              onClick={() => onChange({ renderMode: m })}
              className={`flex-1 py-2 text-[10px] font-bold border transition-colors ${config.renderMode === m ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:border-white/40'}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup title="Geometry">
        <Slider label="Layer Count" name="count" value={config.count} min={5} max={250} step={1} onChange={onChange} />
        <Slider label="Depth Scaling" name="depth" value={config.depth} min={0.001} max={0.2} step={0.001} onChange={onChange} />
        {config.renderMode === 'box' && (
          <>
            <Slider label="Inner Width" name="innerBoxWidth" value={config.innerBoxWidth} min={0} max={2000} step={10} onChange={onChange} />
            <Slider label="Inner Height" name="innerBoxHeight" value={config.innerBoxHeight} min={0} max={2000} step={10} onChange={onChange} />
          </>
        )}
        <Slider label="Drift Speed" name="speed" value={config.speed} min={-0.5} max={0.5} step={0.001} onChange={onChange} />
        <Slider label="Step Rotation" name="rotation" value={config.rotation} min={-90} max={90} step={0.1} onChange={onChange} />
      </ControlGroup>

      <ControlGroup title="Appearance">
        <Slider label="Font Size" name="fontSize" value={config.fontSize} min={10} max={800} step={1} onChange={onChange} />
        <div className="flex items-center gap-4 mt-2">
          <button 
            onClick={() => onChange({ strokeMode: !config.strokeMode })}
            className={`flex-1 py-2 text-[10px] font-bold border ${config.strokeMode ? 'bg-white text-black' : 'border-white/20 text-white'}`}
          >
            {config.strokeMode ? 'STROKE' : 'FILL'}
          </button>
        </div>
      </ControlGroup>

      <div className="px-6 mb-8 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handlePNG}
            className="bg-white text-black font-black text-[9px] py-3 uppercase tracking-tighter hover:bg-gray-200 transition-all"
          >
            PNG
          </button>
          <button 
            onClick={onDeploy}
            className="bg-indigo-600 text-white font-black text-[9px] py-3 uppercase tracking-tighter hover:bg-indigo-500 transition-all flex items-center justify-center gap-1"
          >
            DEPLOY
          </button>
          <button 
            onClick={handleRecord}
            className={`${isRecording ? 'bg-red-600 animate-pulse' : 'bg-zinc-800'} text-white font-black text-[9px] py-3 uppercase tracking-tighter hover:opacity-90 transition-all col-span-2`}
          >
            {isRecording ? 'STOP' : 'RECORD'}
          </button>
        </div>
      </div>
    </div>
  );
};
