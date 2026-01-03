import React, { useState } from 'react';

interface DeploymentModalProps {
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const shopifyCode = `{% comment %}
  Kinetic Layer Generator - Pro Section
  Production URL: https://kinetic-layer-generator-pro.pages.dev/
{% endcomment %}

<div id="kinetic-layer-editor-{{ section.id }}" style="height: {{ section.settings.editor_height }}vh; position: relative; background: #000; overflow: hidden; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
  <iframe 
    src="https://kinetic-layer-generator-pro.pages.dev/" 
    style="width: 100%; height: 100%; border: none; display: block;" 
    allow="clipboard-read; clipboard-write; fullscreen"
  ></iframe>
</div>

{% schema %}
{
  "name": "Kinetic Layer Pro",
  "settings": [
    {
      "type": "range",
      "id": "editor_height",
      "min": 50,
      "max": 100,
      "step": 5,
      "unit": "vh",
      "label": "Height",
      "default": 90
    }
  ],
  "presets": [
    {
      "name": "Kinetic Layer Pro"
    }
  ]
}
{% endschema %}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shopifyCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto text-white">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/40">
          <div>
            <h2 className="text-white text-lg font-black uppercase tracking-tighter">Fixing Build Errors</h2>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-1">Cloudflare Pages Dashboard Settings</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-2 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section className="bg-red-500/10 border border-red-500/20 p-6 rounded">
            <h3 className="text-red-400 text-xs font-black uppercase tracking-widest font-mono mb-4">🚨 STOP: Check your Dashboard</h3>
            <p className="text-sm mb-4">Your log showed Cloudflare tried to run <b>"/"</b> as a command. This is why the build failed. You MUST update these fields in your Cloudflare project settings:</p>
            <div className="bg-black border border-white/10 p-4 font-mono text-[11px] text-white/70 space-y-3">
               <div className="grid grid-cols-2 gap-y-2 border-b border-white/5 pb-2">
                  <div className="text-white/30">Build command:</div>
                  <div className="text-green-400 font-bold">npm run build</div>
               </div>
               <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-white/30">Build output directory:</div>
                  <div className="text-green-400 font-bold">dist</div>
               </div>
            </div>
            <p className="text-[10px] mt-4 text-white/40 italic">Go to: Settings > Build & deployments > Build settings > Edit</p>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xs font-black uppercase tracking-widest font-mono">Shopify Setup Code</h3>
              <button 
                onClick={handleCopy} 
                className={`text-[9px] font-black uppercase px-3 py-1.5 transition-all ${copySuccess ? 'bg-green-600 text-white' : 'bg-white text-black'}`}
              >
                {copySuccess ? 'COPIED!' : 'COPY CODE'}
              </button>
            </div>
            <pre className="bg-black border border-white/10 p-4 text-[10px] font-mono text-white/70 overflow-x-auto max-h-48 scrollbar-thin">
              <code>{shopifyCode}</code>
            </pre>
          </section>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/40">
          <button onClick={onClose} className="w-full bg-white text-black py-3 font-black text-xs uppercase hover:bg-gray-200 transition-colors">Return to Editor</button>
        </div>
      </div>
    </div>
  );
};