import React from 'react';
import {
  FileSpreadsheet,
  ClipboardList,
  UserCheck,
  ShieldAlert,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'form' | 'admin';
  setActiveTab: (tab: 'form' | 'admin') => void;
  currentUserNumber: string;
  onOpenLoginModal: () => void;
  firebaseUser: User | null;
  spreadsheetUrl?: string | null;
  totalResponses: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUserNumber,
  onOpenLoginModal,
  firebaseUser,
  spreadsheetUrl,
  totalResponses,
}) => {
  const isMasterUser = currentUserNumber === '3411172';

  return (
    <header className="bg-slate-900 text-white border-b border-emerald-950/60 sticky top-0 z-40 shadow-lg">
      {/* Top Colombian flag / departmental thin ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FCD116]" />
        <div className="h-full w-1/3 bg-[#003893]" />
        <div className="h-full w-1/3 bg-[#CE1126]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Institutional Context */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-900/40 border border-emerald-500/30 flex-shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Building2 className="w-3 h-3" />
                  Valle del Cauca
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Ley 594 de 2000 • Archivo General de la Nación (AGN)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-heading text-white tracking-tight flex items-center gap-2 mt-0.5">
                Diagnóstico de Gestión Documental
              </h1>
            </div>
          </div>

          {/* User Button and View Navigation */}
          <div className="flex items-center gap-3">
            {activeTab === 'admin' ? (
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-700 shadow-xs"
              >
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Volver al Formulario</span>
              </button>
            ) : null}

            {/* Top-Right "Ver respuestas" Button */}
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-98 ring-1 ring-emerald-400/40"
              title="Acceso protegido con contraseña (3411172)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ver respuestas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
