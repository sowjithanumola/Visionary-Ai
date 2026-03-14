import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Layout, 
  Maximize2, 
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1";

const ASPECT_RATIOS: { label: string; value: AspectRatio; icon: React.ReactNode }[] = [
  { label: 'Square', value: '1:1', icon: <Layout className="w-4 h-4" /> },
  { label: 'Portrait', value: '9:16', icon: <div className="w-3 h-5 border-2 border-current rounded-sm" /> },
  { label: 'Landscape', value: '16:9', icon: <div className="w-5 h-3 border-2 border-current rounded-sm" /> },
  { label: 'Classic', value: '4:3', icon: <div className="w-4 h-3 border-2 border-current rounded-sm" /> },
  { label: 'Tall', value: '3:4', icon: <div className="w-3 h-4 border-2 border-current rounded-sm" /> },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `visionary-ai-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Visionary AI</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              Creation Prompt
            </h2>
            
            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create in detail..."
                  className="w-full h-40 bg-gray-50 border-none rounded-2xl p-5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-mono">
                  {prompt.length} characters
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-4 block">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-3">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        aspectRatio === ratio.value 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                          : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {ratio.icon}
                      <span className="text-xs font-medium">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </section>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-7">
          <div className="relative aspect-square lg:aspect-auto lg:h-[700px] bg-white rounded-[40px] shadow-sm border border-black/5 overflow-hidden flex items-center justify-center group">
            <AnimatePresence mode="wait">
              {generatedImage ? (
                <motion.div 
                  key="image"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="w-full h-full relative"
                >
                  <img 
                    src={generatedImage} 
                    alt="Generated artwork" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={handleDownload}
                      className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-medium transition-all hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button 
                      onClick={() => window.open(generatedImage, '_blank')}
                      className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 p-3 rounded-full shadow-2xl transition-all hover:scale-105"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-12"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {isGenerating ? (
                      <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-200" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isGenerating ? 'Creating your vision...' : 'Your masterpiece awaits'}
                  </h3>
                  <p className="text-gray-400 max-w-xs mx-auto">
                    {isGenerating 
                      ? 'Gemini is processing your prompt to generate a high-quality image.' 
                      : 'Enter a prompt on the left to start generating unique AI artwork.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Progress Bar */}
            {isGenerating && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-emerald-600"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Powered by Gemini 3.1 Flash Image
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>High Resolution 1K Output</span>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Privacy</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Terms</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Help</a>
        </div>
      </footer>
    </div>
  );
}
