import React, { useState } from 'react';

interface DeploymentModalProps {
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const shopifyCode = `{% comment %}
  Kinetic Layer Generator - Pro Section
  Production URL: [Paste your Cloudflare .pages.dev URL here]
{% endcomment %}

<div id="kinetic-layer-editor-{{ section.id }}" style="height: {{ section.settings.editor_height }}vh; position: relative; background: #000; overflow: hidden; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
  {% if section.settings.app_url != blank %}
    <iframe 
      src="{{ section.settings.app_url }}" 
      style="width: 100%; height: 100%; border: none; display: block;" 
      allow="clipboard-read; clipboard-write; fullscreen"
    ></iframe>
  {% else %}
    <div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-family: sans-serif; text-align: center; background: #111;">
      <p>Please enter your <b>Cloudflare URL</b> in the section settings.</p>
    </div>
  {% endif %}
</div>

{% schema %}
{
  "name": "Kinetic Layer Pro",
  "settings": [
    {
      "type": "url",
      "id": "app_url",
      "label": "Deployed App URL",
      "info": "Paste the URL of your deployed Cloudflare Pages site"
    },
    {
      "type": "range",
      "id": "editor_height",
      "min": 50,
      "max": 100,
      "step": 5,
      "unit": "vh",
      "label": "Section Height",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/40">
          <div>
            <h2 className="text-white text-lg font-black uppercase tracking-tighter">Production Settings</h2>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-1">Cloudflare Pages & Shopify Integration</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-2">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-white/80">
          <section className="bg-green-500/10 border border-green-500/20 p-6 rounded">
            <h3 className="text-green-400 text-xs font-black uppercase tracking-widest font-mono mb-4">1. Cloudflare Build Settings</h3>
            <p className="text-sm mb-4">To match your working "3D Text Exporter" app, use these values in your Cloudflare dashboard:</p>
            <div className="bg-black border border-white/10 p-4 font-mono text-[11px] text-white/70 space-y-2">
               <div className="grid grid-cols-2 gap-y-1">
                  <div className="text-white/30">Framework preset:</div>
                  <div className="text-white">None</div>
                  <div className="text-white/30">Build command:</div>
                  <div className="text-white">bun run build</div>
                  <div className="text-white/30">Build output directory:</div>
                  <div className="text-white">dist</div>
               </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xs font-black uppercase tracking-widest font-mono">2. Shopify Section Code</h3>
              <button 
                onClick={handleCopy} 
                className={`text-[9px] font-black uppercase px-3 py-1.5 transition-all ${copySuccess ? 'bg-green-600 text-white' : 'bg-white text-black'}`}
              >
                {copySuccess ? 'COPIED TO CLIPBOARD!' : 'COPY CODE'}
              </button>
            </div>
            <p className="text-xs mb-3 text-white/50 italic uppercase">Create a new section called 'kinetic-layer.liquid' in your Shopify theme and paste this code:</p>
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