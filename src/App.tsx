import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScriptList } from './components/ScriptList';
import { ScriptDetail } from './components/ScriptDetail';
import { CreateStory } from './components/CreateStory';
import { Dashboard } from './components/Dashboard';
import { CURRENT_USER } from './mockData';
import { Script, ScriptStatus, Comment, User } from './types';
import { AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import * as api from './services/api';

export default function App() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isViewingDashboard, setIsViewingDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const selectedScript = scripts.find(s => s.id === selectedScriptId);

  // Load initial queue count and start polling
  useEffect(() => {
    const fetchQueue = () => {
      api.getQueueStatus().then(setQueueCount).catch(console.error);
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  // Frontend Worker: Processes the queue automatically
  useEffect(() => {
    if (queueCount > 0 && !isProcessingQueue) {
      const timer = setTimeout(async () => {
        setIsProcessingQueue(true);
        try {
          const res = await fetch('/api/cron/process-queue');
          if (res.ok) {
            // Se processou com sucesso, atualiza a lista de roteiros
            const fetchedScripts = await api.getScripts();
            const normalizedScripts = fetchedScripts.map(s => ({
              ...s,
              status: (s.status as string) === 'ti_review' ? 'draft' : s.status
            }));
            setScripts(normalizedScripts);
          }
          // Atualiza a contagem da fila independentemente
          const newCount = await api.getQueueStatus();
          setQueueCount(newCount);
        } catch (err) {
          console.error('Erro no processamento da fila:', err);
        } finally {
          setIsProcessingQueue(false);
        }
      }, 5000); // 5 seconds wait between each processing
      return () => clearTimeout(timer);
    }
  }, [queueCount, isProcessingQueue]);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedScripts, fetchedUsers] = await Promise.all([
          api.getScripts(),
          api.getUsers()
        ]);
        
        // Normalize legacy status
        const normalizedScripts = fetchedScripts.map(s => ({
          ...s,
          status: (s.status as string) === 'ti_review' ? 'draft' : s.status
        }));
        setScripts(normalizedScripts);
        
        const map: Record<string, User> = {};
        fetchedUsers.forEach(u => map[u.id] = u);
        setUsersMap(map);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: ScriptStatus) => {
    try {
      await api.updateScriptStatus(id, status);
      setScripts(prev => prev.map(s => 
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
      ));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Falha ao atualizar status");
    }
  };

  const handleAddComment = async (scriptId: string, text: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      scriptId,
      userId: CURRENT_USER.id,
      text,
      createdAt: new Date().toISOString(),
      resolved: false
    };

    try {
      await api.addComment(newComment);
      setScripts(prev => prev.map(s => 
        s.id === scriptId ? { ...s, comments: [newComment, ...s.comments] } : s
      ));
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
      alert("Falha ao adicionar comentário");
    }
  };

  const handleSaveVersion = async (scriptId: string, content: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    const currentVersionNumber = parseFloat(script.versions[0]?.versionNumber || '0.9');
    const newVersion = {
      id: `v_${Date.now()}`,
      scriptId: scriptId,
      versionNumber: (currentVersionNumber + 0.1).toFixed(1),
      content,
      createdAt: new Date().toISOString(),
      authorId: CURRENT_USER.id
    };

    try {
      await api.addVersion(scriptId, newVersion);
      setScripts(prev => prev.map(s => 
        s.id === scriptId 
          ? { ...s, versions: [newVersion, ...s.versions], updatedAt: new Date().toISOString() } 
          : s
      ));
    } catch (err) {
      console.error("Erro ao salvar nova versão:", err);
      alert("Falha ao salvar versão");
    }
  };

  const handleCreateNew = () => {
    setIsCreatingStory(true);
    setIsViewingDashboard(false);
  };

  const handleDeleteScript = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta história?')) {
      try {
        await api.deleteScript(id);
        setScripts(prev => prev.filter(s => s.id !== id));
        setSelectedScriptId(null);
      } catch (err) {
        console.error("Erro ao excluir história:", err);
        alert("Falha ao excluir história");
      }
    }
  };

  const handleStoryGenerated = async (storyData: { title: string; synopsis: string; content: string }) => {
    const newScript: Script = {
      id: `s_${Date.now()}`,
      title: storyData.title,
      synopsis: storyData.synopsis,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: CURRENT_USER.id,
      versions: [
        {
          id: `v_init_${Date.now()}`,
          scriptId: `s_${Date.now()}`,
          versionNumber: '1.0',
          content: storyData.content,
          createdAt: new Date().toISOString(),
          authorId: CURRENT_USER.id,
        }
      ],
      comments: []
    };
    
    try {
      await api.createScript(newScript);
      setScripts([newScript, ...scripts]);
      setIsCreatingStory(false);
      setSelectedScriptId(newScript.id);
    } catch (err) {
      console.error("Erro ao criar história:", err);
      alert("Falha ao criar história no banco de dados");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white h-[100dvh] w-full flex items-center justify-center flex-col gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p>Carregando histórias...</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-[100dvh] w-full text-gray-900 font-sans flex overflow-hidden">
      {/* Left Pane (Sidebar) - Script List */}
      <div className={`w-full md:w-[400px] md:min-w-[400px] shrink-0 border-r border-gray-200 flex flex-col h-full bg-gray-50/50 ${(selectedScript || isCreatingStory || isViewingDashboard) ? 'hidden md:flex' : 'flex'}`}>
        <ScriptList 
          scripts={scripts} 
          queueCount={queueCount}
          onSelectScript={(id) => {
            setSelectedScriptId(id);
            setIsCreatingStory(false);
            setIsViewingDashboard(false);
          }} 
          onCreateNew={handleCreateNew}
          onHome={() => {
            setSelectedScriptId(null);
            setIsCreatingStory(false);
            setIsViewingDashboard(false);
          }}
          onOpenDashboard={() => setIsViewingDashboard(true)}
        />
      </div>

      {/* Right Pane (Main Content) - Details or Create */}
      <div className={`flex-1 h-full relative ${(selectedScript || isCreatingStory || isViewingDashboard) ? 'flex flex-col' : 'hidden md:flex md:flex-col md:items-center md:justify-center md:bg-gray-50'}`}>
        {/* Dashboard for empty state */}
        {!selectedScript && !isCreatingStory && (
          <div className="flex-1 overflow-y-auto w-full">
            {isViewingDashboard && (
              <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 flex items-center gap-4 border-b border-gray-100 shrink-0">
                <button 
                  onClick={() => setIsViewingDashboard(false)}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
              </header>
            )}
            <Dashboard scripts={scripts} />
          </div>
        )}

        <AnimatePresence>
          {isCreatingStory && (
            <CreateStory 
              onBack={() => setIsCreatingStory(false)} 
              onStoryGenerated={handleStoryGenerated} 
              onQueueBatch={async (prompt, count) => {
                await api.queueBatchStories(prompt, count, CURRENT_USER.id);
              }}
            />
          )}
          {selectedScript && !isCreatingStory && (
            <ScriptDetail
              key={selectedScript.id}
              script={selectedScript}
              currentUser={CURRENT_USER}
              usersMap={usersMap}
              onBack={() => setSelectedScriptId(null)}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onSaveVersion={handleSaveVersion}
              onDeleteScript={handleDeleteScript}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
