import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { SurveyResponse } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmationModal } from './ConfirmationModal';
import {
  FileSpreadsheet,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  LogOut,
  Building2,
  MapPin,
  HelpCircle,
  Layers,
} from 'lucide-react';

interface SheetsAdminPanelProps {
  currentUserNumber: string;
  onOpenLoginModal: () => void;
  firebaseUser: User | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  isSigningIn: boolean;
  spreadsheetUrl: string | null;
  spreadsheetId: string | null;
  onCreateSpreadsheet: () => Promise<void>;
  onSyncAllResponses: () => Promise<void>;
  responses: SurveyResponse[];
  onDeleteResponse: (id: string) => void;
  isActionLoading: boolean;
}

export const SheetsAdminPanel: React.FC<SheetsAdminPanelProps> = ({
  currentUserNumber,
  onOpenLoginModal,
  firebaseUser,
  onGoogleSignIn,
  onGoogleSignOut,
  isSigningIn,
  spreadsheetUrl,
  spreadsheetId,
  onCreateSpreadsheet,
  onSyncAllResponses,
  responses,
  onDeleteResponse,
  isActionLoading,
}) => {
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string[];
    confirmLabel?: string;
    isDestructive?: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const isMasterUser = currentUserNumber === '3411172';

  // Calculate statistics across responses for the 6 core causes
  const causeStats = [
    {
      key: 'personal',
      label: 'Personal poco calificado para desarrollar la función archivística',
      category: 'Talento Humano',
      count: responses.filter(
        (r) =>
          r.q1GeneralCauses.some((c) => c.toLowerCase().includes('personal poco calificado')) ||
          r.q3GovernanceCauses.some((c) => c.toLowerCase().includes('personal poco calificado'))
      ).length,
    },
    {
      key: 'materiales',
      label: 'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
      category: 'Materiales e Insumos',
      count: responses.filter(
        (r) =>
          r.q1GeneralCauses.some((c) => c.toLowerCase().includes('materiales')) ||
          r.q2OperationalCauses.some((c) => c.toLowerCase().includes('materiales'))
      ).length,
    },
    {
      key: 'equipos',
      label: 'Equipos obsoletos, desactualizados o inexistentes para agilizar tareas',
      category: 'Tecnología',
      count: responses.filter(
        (r) =>
          r.q1GeneralCauses.some((c) => c.toLowerCase().includes('obsoletos')) ||
          r.q2OperationalCauses.some((c) => c.toLowerCase().includes('obsoletos'))
      ).length,
    },
    {
      key: 'procedimientos',
      label: 'No existen o no están claros los procedimientos (TRD, TVD, PGD)',
      category: 'Instrumentos Archivísticos',
      count: responses.filter(
        (r) =>
          r.q1GeneralCauses.some((c) => c.toLowerCase().includes('procedimientos')) ||
          r.q3GovernanceCauses.some((c) => c.toLowerCase().includes('procedimientos'))
      ).length,
    },
    {
      key: 'seguimiento',
      label: 'No se hace o se hace poco seguimiento al desarrollo de procesos',
      category: 'Control y Auditoría',
      count: responses.filter(
        (r) =>
          r.q1GeneralCauses.some((c) => c.toLowerCase().includes('seguimiento')) ||
          r.q3GovernanceCauses.some((c) => c.toLowerCase().includes('seguimiento'))
      ).length,
    },
    {
      key: 'instalaciones',
      label: 'Las instalaciones están poco adecuadas para el desarrollo de funciones',
      category: 'Infraestructura Física',
      count: responses.filter(
        (r) =>
          r.q1GeneralCauses.some((c) => c.toLowerCase().includes('instalaciones')) ||
          r.q2OperationalCauses.some((c) => c.toLowerCase().includes('instalaciones'))
      ).length,
    },
  ];

  const totalResponses = responses.length;
  const syncedCount = responses.filter((r) => r.syncedToGoogleSheets).length;
  const pendingCount = totalResponses - syncedCount;

  // Confirm creating a new spreadsheet
  const promptCreateSpreadsheet = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: '¿Crear nueva Hoja de Cálculo en Google Sheets?',
      message:
        'Se creará un nuevo archivo en su cuenta de Google Drive con el nombre "Diagnóstico Ley 594 de 2000 - Valle del Cauca (Usuario 3411172)" con los encabezados técnicos archivísticos formateados.',
      details: [
        'Archivo: Hoja de cálculo de Google Sheets con pestaña "Respuestas_Ley594"',
        'Encabezados con formato oficial verde esmeralda y textos protegidos',
        'Se transferirán automáticamente las respuestas registradas en la aplicación',
      ],
      confirmLabel: 'Sí, Crear Hoja en Google Sheets',
      isDestructive: false,
      action: async () => {
        await onCreateSpreadsheet();
      },
    });
  };

  // Confirm syncing all responses
  const promptSyncAll = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: '¿Sincronizar respuestas con Google Sheets?',
      message: `Se enviarán ${pendingCount > 0 ? pendingCount : totalResponses} registros de respuestas a la hoja de cálculo de Google activa.`,
      details: [
        `Destino: Hoja de cálculo con ID ${spreadsheetId || 'activa'}`,
        `Registros a sincronizar: ${pendingCount > 0 ? pendingCount : 'Todos los ' + totalResponses}`,
        `Usuario de control: ${currentUserNumber || '3411172'}`,
      ],
      confirmLabel: 'Confirmar y Enviar a Google Sheets',
      isDestructive: false,
      action: async () => {
        await onSyncAllResponses();
      },
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const headers = [
      'ID',
      'Fecha',
      'Usuario',
      'Entidad',
      'Tipo Entidad',
      'Municipio',
      'Cargo',
      'P1 Causas Generales',
      'P2 Infraestructura y Equipos',
      'P3 Procedimientos y Talento',
      'Observaciones',
      'Sincronizado Google Sheets',
    ];

    const rows = responses.map((r) => [
      r.id,
      r.createdAt,
      r.userNumber,
      `"${r.companyName.replace(/"/g, '""')}"`,
      `"${r.companyTypeLabel.replace(/"/g, '""')}"`,
      `"${r.municipality}"`,
      `"${r.respondentRole.replace(/"/g, '""')}"`,
      `"${r.q1GeneralCauses.join(' | ').replace(/"/g, '""')}"`,
      `"${r.q2OperationalCauses.join(' | ').replace(/"/g, '""')}"`,
      `"${r.q3GovernanceCauses.join(' | ').replace(/"/g, '""')}"`,
      `"${(r.additionalObservations || '').replace(/"/g, '""')}"`,
      r.syncedToGoogleSheets ? 'SI' : 'NO',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Diagnostico_Ley594_ValleCauca_${currentUserNumber || '3411172'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        details={confirmModalConfig.details}
        confirmLabel={confirmModalConfig.confirmLabel}
        isDestructive={confirmModalConfig.isDestructive}
        isLoading={isActionLoading}
        onConfirm={async () => {
          await confirmModalConfig.action();
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() =>
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* Top Banner with User 3411172 & Google Workspace Status */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                Panel de Integración Google Workspace
              </span>
              {isMasterUser && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Usuario 3411172
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Sincronización con Google Sheets
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consolide las respuestas de las entidades públicas y privadas con funciones públicas del Valle del Cauca directamente en su hoja de cálculo de Google.
            </p>
          </div>

          {/* Google Auth Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col items-center sm:items-start gap-3">
            {firebaseUser ? (
              <div className="w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {firebaseUser.displayName?.charAt(0) || firebaseUser.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conectado con Google
                    </div>
                    <div className="text-xs font-medium text-white truncate max-w-[200px]">
                      {firebaseUser.email}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2 w-full">
                  <span className="text-[11px] text-slate-300">
                    Permisos de Google Sheets activos
                  </span>
                  <button
                    type="button"
                    onClick={onGoogleSignOut}
                    className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" /> Desconectar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-200 mb-2">
                  Inicie sesión para enviar las respuestas a su Google Drive / Sheets:
                </p>
                <GoogleSignInButton
                  onClick={onGoogleSignIn}
                  isLoading={isSigningIn}
                  text="Conectar con Google"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Sheets Active File Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 flex-shrink-0">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Hoja de Cálculo en Google Sheets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {spreadsheetId
                  ? 'Hoja activa y enlazada al Usuario 3411172'
                  : 'Aún no se ha generado una hoja de cálculo vinculada'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en Google Sheets
              </a>
            )}

            {firebaseUser ? (
              <>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={promptCreateSpreadsheet}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  {spreadsheetId ? 'Crear Nueva Hoja' : 'Crear Hoja de Cálculo'}
                </button>

                {totalResponses > 0 && (
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={promptSyncAll}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-700/20 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isActionLoading ? 'animate-spin' : ''}`} />
                    Sincronizar Todas ({totalResponses})
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Conectar Google para Enviar Datos
              </button>
            )}
          </div>
        </div>

        {/* Sync Summary Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Total de Respuestas</span>
            <div className="mt-1 text-2xl font-bold font-heading text-slate-900">
              {totalResponses}
            </div>
            <span className="text-[11px] text-slate-500">Registradas en el sistema</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-xs text-emerald-700 font-semibold block">Sincronizadas con Google</span>
            <div className="mt-1 text-2xl font-bold font-heading text-emerald-900">
              {syncedCount}
            </div>
            <span className="text-[11px] text-emerald-700">Enviadas a Google Sheets</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-xs text-amber-800 font-semibold block">Pendientes de Envío</span>
            <div className="mt-1 text-2xl font-bold font-heading text-amber-900">
              {pendingCount}
            </div>
            <span className="text-[11px] text-amber-700">
              {pendingCount > 0 ? 'Listas para transferir' : 'Todo sincronizado'}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics: Frequency of Causes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Ponderación de Causas Identificadas en el Valle del Cauca
              </h3>
              <p className="text-xs text-slate-500">
                Frecuencia relativa de las 6 problemáticas consultadas en la Ley 594 de 2000
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {causeStats.map((stat, idx) => {
            const percentage =
              totalResponses > 0 ? Math.round((stat.count / totalResponses) * 100) : 0;

            return (
              <div key={stat.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-start sm:items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {stat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs text-slate-500 font-medium">
                      {stat.count} {stat.count === 1 ? 'mención' : 'menciones'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, totalResponses > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Responses Data Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Registros Recibidos de Entidades
            </h3>
            <p className="text-xs text-slate-500">
              Respuestas recolectadas en los municipios del Valle del Cauca
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={responses.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Descargar CSV
            </button>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Aún no hay respuestas registradas</p>
            <p className="text-xs mt-1">Diligencie el formulario para comenzar a capturar datos.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Entidad / Empresa</th>
                  <th className="py-3 px-3">Municipio</th>
                  <th className="py-3 px-3">Usuario</th>
                  <th className="py-3 px-3">Causas Seleccionadas</th>
                  <th className="py-3 px-3 text-center">Estado Sheets</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{r.companyName}</div>
                      <div className="text-[11px] text-slate-500">{r.companyTypeLabel}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {r.municipality}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                      {r.userNumber}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-[11px] line-clamp-2 text-slate-700">
                        {r.q1GeneralCauses.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      {r.syncedToGoogleSheets ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Sincronizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteResponse(r.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar registro de prueba"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
