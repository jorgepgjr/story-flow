import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Activity } from 'lucide-react';
import { Script } from '../types';
import { statusConfig } from './ScriptList';

interface DashboardProps {
  scripts: Script[];
}

export function Dashboard({ scripts }: DashboardProps) {
  const totalScripts = scripts.length;

  const statusCounts = Object.keys(statusConfig).map((status) => {
    return {
      status,
      count: scripts.filter(s => s.status === status).length,
      ...statusConfig[status as keyof typeof statusConfig]
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-8 md:p-12 w-full max-w-4xl mx-auto h-full overflow-y-auto"
    >
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Dashboard de Produção</h2>
        <p className="text-gray-500">Visão geral do fluxo de histórias da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total de Histórias</p>
            <p className="text-4xl font-bold text-gray-900">{totalScripts}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-7 h-7" />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-gray-400" />
        Status do Funil
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statusCounts.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={item.status}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <span className="font-semibold text-gray-700">{item.label}</span>
            </div>
            
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-bold text-gray-900">{item.count}</span>
              <span className="text-sm font-medium text-gray-400 mb-1">
                {totalScripts > 0 ? Math.round((item.count / totalScripts) * 100) : 0}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
              <div 
                className={`h-full rounded-full ${item.color.split(' ')[0]}`}
                style={{ width: `${totalScripts > 0 ? (item.count / totalScripts) * 100 : 0}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
