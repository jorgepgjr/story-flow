import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, History, CheckCircle2, Send, Edit3, Save, Mic, FileText, Trash2 } from 'lucide-react';
import { Script, Comment, Version, User, ScriptStatus } from '../types';
import { statusConfig } from './ScriptList';

interface ScriptDetailProps {
  script: Script;
  currentUser: User;
  usersMap: Record<string, User>;
  onBack: () => void;
  onUpdateStatus: (id: string, status: ScriptStatus) => void;
  onUpdateTitle?: (id: string, newTitle: string) => void;
  onAddComment: (id: string, text: string) => void;
  onSaveVersion: (id: string, content: string) => void;
  onDeleteScript: (id: string) => void;
}

type Tab = 'editor' | 'comments' | 'versions' | 'flow';

export function ScriptDetail({ 
  script, currentUser, usersMap, onBack, onUpdateStatus, onUpdateTitle, onAddComment, onSaveVersion, onDeleteScript 
}: ScriptDetailProps) {
  
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  
  const currentVersion = script.versions[script.versions.length - 1];
  const [draftContent, setDraftContent] = useState(currentVersion?.content || '');
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(script.title);

  useEffect(() => {
    if (!isEditingTitle) {
      setEditTitle(script.title);
    }
  }, [script.title, isEditingTitle]);

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle !== script.title) {
      onUpdateTitle?.(script.id, editTitle.trim());
    } else {
      setEditTitle(script.title);
    }
    setIsEditingTitle(false);
  };

  // Auto-scroll comments
  useEffect(() => {
    if (activeTab === 'comments') {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [script.comments.length, activeTab]);

  const hasUnsavedChanges = draftContent !== currentVersion?.content;

  const handleSaveDraft = () => {
    if (hasUnsavedChanges && draftContent.trim()) {
      onSaveVersion(script.id, draftContent);
    }
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      onAddComment(script.id, commentText);
      setCommentText('');
    }
  };

  const config = statusConfig[script.status];

  const wordCount = draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0;
  const totalSeconds = Math.round((wordCount / 150) * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const audioTimeDisplay = mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white z-20 flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100 flex items-start gap-4 shadow-sm z-10 shrink-0">
        <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {isEditingTitle ? (
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="text-xl font-bold text-gray-900 w-full bg-transparent border-b-2 border-gray-900 outline-none pb-0.5"
              />
            ) : (
              <h2 
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold text-gray-900 truncate cursor-pointer hover:opacity-70 transition-opacity"
                title="Clique para editar"
              >
                {script.title}
              </h2>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                {config.label}
              </span>
              <span className="text-xs text-gray-400 font-medium">v{currentVersion?.versionNumber}</span>
            </div>
          </div>
          <button 
            onClick={() => onDeleteScript(script.id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0"
            title="Excluir História"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-100 shrink-0 bg-white px-2">
        {(['editor', 'comments', 'versions', 'flow'] as Tab[]).map((tab) => {
          const labels = { editor: 'Texto', comments: 'Notas', versions: 'Versões', flow: 'Fluxo' };
          const icons = { editor: Edit3, comments: MessageSquare, versions: History, flow: CheckCircle2 };
          const Icon = icons[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors relative
                ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon className="w-4 h-4" />
              {labels[tab]}
              {tab === 'comments' && script.comments.length > 0 && (
                <span className="bg-gray-900 text-white rounded-full px-1.5 py-0.5 text-[9px] absolute -top-1 ml-12">
                  {script.comments.length}
                </span>
              )}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 relative flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* EDITOR TAB */}
          {activeTab === 'editor' && (
            <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 flex-1 flex flex-col">
              <div className="bg-white border text-gray-900 border-gray-200 rounded-xl overflow-hidden flex-1 flex flex-col shadow-sm focus-within:ring-2 ring-gray-200 transition-all">
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  className="w-full flex-1 p-5 resize-none outline-none text-base leading-relaxed"
                  placeholder="Escreva seu roteiro aqui..."
                />
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-gray-400" /> {wordCount} palavras</span>
                    <span className="flex items-center gap-1.5"><Mic className="w-4 h-4 text-purple-400" /> {audioTimeDisplay} de áudio</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveDraft}
                  disabled={!hasUnsavedChanges}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all
                    ${hasUnsavedChanges 
                      ? 'bg-gray-900 text-white shadow-lg active:scale-95' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <Save className="w-4 h-4" />
                  Salvar Revisão
                </button>
              </div>
            </motion.div>
          )}

          {/* COMMENTS TAB */}
          {activeTab === 'comments' && (
            <motion.div key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col bg-gray-50">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {script.comments.length === 0 ? (
                  <div className="text-center text-gray-400 p-8 flex flex-col items-center">
                    <MessageSquare className="w-10 h-10 opacity-20 mb-2" />
                    <p className="text-sm">Nenhum comentário nesta versão.</p>
                  </div>
                ) : (
                  script.comments.map(c => {
                    const isMe = c.userId === currentUser.id;
                    const cAuthor = usersMap[c.userId];
                    const time = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(c.createdAt));
                    
                    return (
                      <div key={c.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <img src={cAuthor?.avatar} alt={cAuthor?.name} className="w-8 h-8 rounded-full border border-gray-200 bg-white shrink-0" />
                        <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-100'}`}>
                          <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 opacity-70 ${isMe ? 'text-gray-300 text-right' : 'text-gray-500'}`}>
                            {isMe ? 'Você' : cAuthor?.name} • {time}
                          </div>
                          <p className="text-sm leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={commentsEndRef} />
              </div>
              
              {/* Comment Input */}
              <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="Adicionar nota para revisão..."
                  className="flex-1 bg-gray-100 placeholder:text-gray-400 px-4 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-gray-200 transition-shadow"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!commentText.trim()}
                  className="bg-gray-900 text-white p-3 rounded-full disabled:opacity-50 transition-opacity active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* VERSIONS TAB */}
          {activeTab === 'versions' && (
            <motion.div key="versions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
              {[...script.versions].reverse().map((v, i) => {
                const isLatest = i === 0;
                const author = usersMap[v.authorId];
                const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(v.createdAt));
                
                return (
                  <div key={v.id} className={`p-4 rounded-xl border ${isLatest ? 'bg-white border-gray-200 shadow-sm' : 'bg-transparent border-gray-200/60 opacity-80'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">v{v.versionNumber}</span>
                        {isLatest && <span className="text-[10px] uppercase font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600 tracking-wider">Atual</span>}
                      </div>
                      <span className="text-xs text-gray-400">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <img src={author?.avatar} className="w-4 h-4 rounded-full" />
                      <span>Editado por {author?.name}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* FLOW TAB */}
          {activeTab === 'flow' && (
            <motion.div key="flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 flex flex-col flex-1 h-full">
              <h3 className="font-bold text-gray-900 text-lg mb-6">Status de Aprovação</h3>
              
              <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                
                {/* Timeline Nodes */}
                {[
                  { state: 'draft', label: 'Roteiro (Rascunho)', desc: 'Autor escrevendo as ideias iniciais.' },
                  { state: 'review', label: 'Em Revisão', desc: 'Aguardando notas críticas da equipe.' },
                  { state: 'approved', label: 'Aprovado', desc: 'Roteiro finalizado e liberado.' },
                  { state: 'audio_generation', label: 'Produção de Áudio', desc: 'Sintetização e foley em andamento.' }
                ].map((step, idx) => {
                  const states: ScriptStatus[] = ['draft', 'generating', 'review', 'approved', 'audio_generation'];
                  const currentIndex = states.indexOf(script.status);
                  const stepIndex = states.indexOf(step.state as ScriptStatus);
                  
                  const isCompleted = stepIndex < currentIndex;
                  const isActive = stepIndex === currentIndex;
                  
                  return (
                    <div key={step.state} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shadow shrink-0 z-10 transition-colors
                        ${isCompleted ? 'bg-emerald-500 border-white text-white' : isActive ? 'bg-gray-900 border-white text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (isActive && step.state === 'audio_generation' ? <Mic className="w-5 h-5"/> : <div className="w-2.5 h-2.5 rounded-full bg-current" />)}
                      </div>
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm border transition-colors
                        ${isActive ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-transparent'}`}>
                        <h4 className={`font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</h4>
                        <p className={`text-xs mt-1 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons based on state */}
              <div className="mt-8 pt-4 border-t border-gray-100 shrink-0">
                {script.status === 'draft' && (
                  <button onClick={() => onUpdateStatus(script.id, 'review')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2">
                    Enviar para Revisão <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {script.status === 'review' && (
                   <div className="flex gap-3">
                     <button onClick={() => onUpdateStatus(script.id, 'draft')} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-transform">
                       Retornar
                     </button>
                     <button onClick={() => onUpdateStatus(script.id, 'approved')} className="flex-1 bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2">
                       Aprovar Roteiro <CheckCircle2 className="w-4 h-4" />
                     </button>
                   </div>
                )}
                {script.status === 'approved' && (
                  <button onClick={() => onUpdateStatus(script.id, 'audio_generation')} className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2">
                    Enviar para Estúdio de Áudio <Mic className="w-4 h-4" />
                  </button>
                )}
                {script.status === 'audio_generation' && (
                  <div className="w-full bg-purple-50 border border-purple-100 text-purple-700 font-bold py-4 rounded-xl flex justify-center items-center gap-2">
                    <Mic className="w-4 h-4 animate-pulse" /> Áudio em Geração...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Reuse chevron icon locally since it wasn't exported from index intentionally for minimal token usage
function ChevronRight(props: any) {
  return <ChevronRightIcon {...props} />;
}
import { ChevronRight as ChevronRightIcon } from 'lucide-react';
