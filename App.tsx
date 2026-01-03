
import React, { useState } from 'react';
import { LayerCanvas } from './components/LayerCanvas.tsx';
import { ControlPanel } from './components/ControlPanel.tsx';
import { DeploymentModal } from './components/DeploymentModal.tsx';
import { AppConfig, DEFAULT_CONFIG } from './types.ts';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const generateAIPreset = async (prompt: string) => {
    console.log("AI Generation placeholder");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden select-none" style={{ backgroundColor: config.bgColor }}>
      <LayerCanvas config={config} />

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="flex justify-between items-start p-6 pointer-events-auto">
          <div className="flex flex-col">
            <h1 className="text-white text-xl font-black tracking-tighter mix-blend-difference uppercase">
              Kinetic Layer Gen
            </h1>
            <p className="text-white/50 text-xs font-mono uppercase tracking-widest mix-blend-difference">
              v1.0.6 / Production Ready
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-white text-black px-4 py-2 font-black text-xs uppercase hover:bg-gray-200 transition-colors shadow-lg"
            >
              {isSidebarOpen ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>
        </div>

        <div className={`
          absolute right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-l border-white/10 
          transform transition-transform duration-300 ease-in-out pointer-events-auto overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <ControlPanel 
            config={config} 
            onChange={updateConfig} 
            onAIGenerate={generateAIPreset}
            onDeploy={() => setIsDeploymentModalOpen(true)}
            isGenerating={false}
          />
        </div>

        <div className="absolute bottom-6 left-6 pointer-events-auto">
          <div className="flex gap-4">
             <div className="text-white/40 text-[10px] font-mono leading-tight uppercase">
               Projected Depth: {(config.count * config.depth).toFixed(2)}<br/>
               Sync Mode: 60FPS STABLE
             </div>
          </div>
        </div>
      </div>

      {isDeploymentModalOpen && (
        <DeploymentModal onClose={() => setIsDeploymentModalOpen(false)} />
      )}
    </div>
  );
};

export default App;
