import React, { useState, useEffect } from 'react';
import { Loader2, Wand2, ArrowLeft, PenTool, Save, FileText, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getQueueStatus } from '../services/api';

interface CreateStoryProps {
  onBack: () => void;
  onStoryGenerated: (storyData: { title: string; synopsis: string; content: string }) => void;
  onQueueBatch: (prompt: string, count: number) => Promise<void>;
}

type Mode = 'ai' | 'manual';

export function CreateStory({ onBack, onStoryGenerated, onQueueBatch }: CreateStoryProps) {
  const [mode, setMode] = useState<Mode>('ai');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(1);
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [queueCount, setQueueCount] = useState<number>(0);

  useEffect(() => {
    if (mode === 'ai') {
      getQueueStatus().then(setQueueCount).catch(console.error);
      const interval = setInterval(() => {
        getQueueStatus().then(setQueueCount).catch(console.error);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [mode, batchSuccess]);

  // Manual mode states
  const [manualTitle, setManualTitle] = useState('');
  const [manualSynopsis, setManualSynopsis] = useState('');
  const [manualContent, setManualContent] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      if (count > 1) {
        await onQueueBatch(prompt, count);
        setBatchSuccess(true);
        setPrompt('');
        return;
      }

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar história');
      }

      const data = await response.json();
      onStoryGenerated(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao gerar a história.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = () => {
    if (!manualTitle.trim() || !manualContent.trim()) return;
    onStoryGenerated({
      title: manualTitle.trim(),
      synopsis: manualSynopsis.trim() || 'Sem sinopse',
      content: manualContent.trim()
    });
  };

  const wordCount = manualContent.trim() ? manualContent.trim().split(/\s+/).length : 0;
  const totalSeconds = Math.round((wordCount / 150) * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const audioTimeDisplay = mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white z-40 flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 flex items-center gap-4 border-b border-gray-100 shrink-0">
          <button 
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Nova História</h2>
        </header>

        <div className="flex border-b border-gray-100 shrink-0">
          <button
            onClick={() => setMode('ai')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative
              ${mode === 'ai' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Wand2 className="w-4 h-4" />
            Gerar com IA
            {mode === 'ai' && <motion.div layoutId="modeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative
              ${mode === 'manual' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <PenTool className="w-4 h-4" />
            Escrever Manualmente
            {mode === 'manual' && <motion.div layoutId="modeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === 'ai' ? (
              <motion.div key="ai" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 flex-1">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                    Sobre o que é a história?
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Uma história sobre um detetive espacial que descobre que as estrelas são na verdade..."
                    className="w-full h-40 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all shadow-sm"
                    disabled={isGenerating}
                  />
                </div>

                {queueCount > 0 && (
                  <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><strong>{queueCount}</strong> histórias na fila de espera.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {window.location.hostname === 'localhost' && (
                        <button 
                          onClick={async () => {
                            await fetch('/api/cron/process-queue');
                            getQueueStatus().then(setQueueCount);
                          }}
                          className="text-xs font-bold bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded-lg transition-colors shadow-sm active:scale-95"
                        >
                          Forçar Cron (Local)
                        </button>
                      )}
                      <div className="text-xs font-semibold bg-amber-100 px-2 py-1.5 rounded-lg">
                        Tempo estimado: ~{queueCount} min
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {batchSuccess && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
                    🎉 {count} histórias foram adicionadas à fila! Elas aparecerão na sua lista gradativamente (1 por minuto) para não exceder os limites da Vercel.
                  </div>
                )}

                {!batchSuccess && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantidade a gerar
                    </label>
                    <div className="flex gap-2">
                      {[1, 5, 10, 15, 20].map(n => (
                        <button
                          key={n}
                          onClick={() => setCount(n)}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${count === n ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={`w-full py-4 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                    !prompt.trim() || isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {count > 1 ? 'Agendando na Fila...' : 'Gerando História...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      {count > 1 ? `Agendar ${count} Histórias` : 'Gerar História'}
                    </>
                  )}
                </button>

                {isGenerating && count === 1 && (
                  <div className="text-center text-sm text-gray-500 animate-pulse">
                    A IA está escrevendo a sua história. Isso pode levar alguns segundos.
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="manual" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4 flex flex-col h-full pb-8">
                <div className="space-y-1 shrink-0">
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Dê um título à sua história"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1 shrink-0">
                  <label className="block text-sm font-medium text-gray-700">Sinopse (Opcional)</label>
                  <input
                    type="text"
                    value={manualSynopsis}
                    onChange={(e) => setManualSynopsis(e.target.value)}
                    placeholder="Um breve resumo..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1 flex-1 flex flex-col min-h-[200px] relative">
                  <label className="block text-sm font-medium text-gray-700">Conteúdo da História</label>
                  <div className="border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-gray-900 transition-all shadow-sm flex flex-col flex-1 overflow-hidden bg-white">
                    <textarea
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      placeholder="Cole ou escreva o texto completo da história aqui..."
                      className="w-full flex-1 p-4 outline-none resize-none bg-transparent"
                    />
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium shrink-0">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-gray-400" /> {wordCount} palavras</span>
                        <span className="flex items-center gap-1.5"><Mic className="w-4 h-4 text-purple-400" /> {audioTimeDisplay} de áudio</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleManualSave}
                  disabled={!manualTitle.trim() || !manualContent.trim()}
                  className={`w-full py-4 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-4 shrink-0 ${
                    !manualTitle.trim() || !manualContent.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-black hover:shadow-gray-900/25'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  Salvar História
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
