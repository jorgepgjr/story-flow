/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScriptList } from './components/ScriptList';
import { ScriptDetail } from './components/ScriptDetail';
import { MOCK_SCRIPTS, CURRENT_USER, MOCK_USERS } from './mockData';
import { Script, ScriptStatus, Version, Comment } from './types';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [scripts, setScripts] = useState<Script[]>(MOCK_SCRIPTS);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

  const selectedScript = scripts.find(s => s.id === selectedScriptId) || null;

  const handleUpdateStatus = (id: string, newStatus: ScriptStatus) => {
    setScripts(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return s;
    }));
  };

  const handleAddComment = (id: string, text: string) => {
    setScripts(prev => prev.map(s => {
      if (s.id === id) {
        const newComment: Comment = {
          id: `c_${Date.now()}`,
          userId: CURRENT_USER.id,
          text,
          createdAt: new Date().toISOString(),
          resolved: false,
        };
        return { 
          ...s, 
          comments: [...s.comments, newComment],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  const handleSaveVersion = (id: string, newContent: string) => {
    setScripts(prev => prev.map(s => {
      if (s.id === id) {
        const currentVersion = s.versions[s.versions.length - 1];
        
        // Simples bump da versão minor. Ex: "1.0" -> "1.1"
        const parts = currentVersion.versionNumber.split('.');
        let minor = parseInt(parts[1] || '0', 10);
        const nextVersionNumber = `${parts[0]}.${minor + 1}`;

        const newVersion: Version = {
          id: `v_${Date.now()}`,
          versionNumber: nextVersionNumber,
          content: newContent,
          createdAt: new Date().toISOString(),
          authorId: CURRENT_USER.id,
        };
        
        return { 
          ...s, 
          versions: [...s.versions, newVersion],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  const handleCreateNew = () => {
    const newScript: Script = {
      id: `s_${Date.now()}`,
      title: 'Novo Roteiro Sem Título',
      synopsis: 'Adicione uma sinopse aqui...',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: CURRENT_USER.id,
      versions: [
        {
          id: `v_init_${Date.now()}`,
          versionNumber: '1.0',
          content: '',
          createdAt: new Date().toISOString(),
          authorId: CURRENT_USER.id,
        }
      ],
      comments: []
    };
    
    setScripts([newScript, ...scripts]);
    setSelectedScriptId(newScript.id);
  };

  return (
    <div className="bg-gray-200 min-h-screen text-gray-900 font-sans sm:p-4 md:p-8 lg:p-12 flex justify-center items-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md mx-auto bg-white h-[100dvh] sm:h-[850px] sm:max-h-[90vh] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* Simula o entalhe superior em desktop para dar o vibe mobile */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-50"></div>

        <ScriptList 
          scripts={scripts} 
          onSelectScript={setSelectedScriptId} 
          onCreateNew={handleCreateNew}
        />

        <AnimatePresence>
          {selectedScript && (
            <ScriptDetail
              script={selectedScript}
              currentUser={CURRENT_USER}
              usersMap={MOCK_USERS}
              onBack={() => setSelectedScriptId(null)}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onSaveVersion={handleSaveVersion}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
