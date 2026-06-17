import React from 'react';
import { motion } from 'motion/react';
import { FileText, Clock, ChevronRight, CheckCircle2, Mic, FileEdit, LayoutDashboard, Loader2 } from 'lucide-react';
import { Script, ScriptStatus } from '../types';

interface ScriptListProps {
  scripts: Script[];
  onSelectScript: (id: string) => void;
  onCreateNew: () => void;
  onHome: () => void;
  onOpenDashboard?: () => void;
  queueCount?: number;
}

export const statusConfig: Record<ScriptStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: <FileEdit className="w-3 h-3 mr-1" /> },
  generating: { label: 'Gerando', color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3 mr-1" /> },
  review: { label: 'Em Revisão', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3 mr-1" /> },
  approved: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
  audio_generation: { label: 'Gerando Áudio', color: 'bg-purple-100 text-purple-700', icon: <Mic className="w-3 h-3 mr-1" /> },
};

export function ScriptList({ scripts, onSelectScript, onCreateNew, onHome, onOpenDashboard, queueCount = 0 }: ScriptListProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-20">
      <div className="p-6 pb-2 pt-12 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div 
            onClick={onHome}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            title="Voltar ao Dashboard"
          >
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">StoryFlow</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Meus Roteiros</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDashboard}
              className="md:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-3 shadow-sm active:scale-95 transition-transform"
              title="Ver Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <button
              onClick={onCreateNew}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full p-3 shadow-lg active:scale-95 transition-transform"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {queueCount > 0 && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Gerando... ({queueCount} na fila)</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {scripts.map((script, idx) => {
          const config = statusConfig[script.status];
          const lastUpdated = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(script.updatedAt));

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={script.id}
              onClick={() => onSelectScript(script.id)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                  {config.icon}
                  {config.label}
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {lastUpdated}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{script.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                {script.synopsis}
              </p>
              
              <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-3">
                <div className="text-xs font-medium text-gray-400">
                  v{script.versions[script.versions.length - 1]?.versionNumber} • {script.comments.length} notas
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </motion.div>
          );
        })}

        {scripts.length === 0 && (
          <div className="text-center p-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum roteiro ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
