/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { SurveyResponse } from './types';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import {
  createDiagnosticSpreadsheet,
  appendResponsesToGoogleSheet,
} from './services/googleSheets';
import { Header } from './components/Header';
import { SurveyForm } from './components/SurveyForm';
import { SheetsAdminPanel } from './components/SheetsAdminPanel';
import { PasswordAccessModal } from './components/PasswordAccessModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const INITIAL_RESPONSES: SurveyResponse[] = [
  {
    id: 'R-782101',
    createdAt: '2026-11-10T14:30:00.000Z',
    userNumber: '3411172',
    companyName: 'Alcaldía Municipal de Palmira - Dirección Administrativa',
    companyType: 'publica_territorial',
    companyTypeLabel: 'Empresa o Entidad Pública Territorial',
    municipality: 'Palmira',
    respondentRole: 'Líder de Archivo y Gestión Documental',
    q1GeneralCauses: [
      'Personal poco calificado para desarrollar la función archivística',
      'Equipos obsoletos, desactualizados o inexistentes para agilizar las tareas archivísticas',
      'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
    ],
    q2OperationalCauses: [
      'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
      'Equipos obsoletos, desactualizados o inexistentes para agilizar las tareas archivísticas',
    ],
    q3GovernanceCauses: [
      'Personal poco calificado para desarrollar la función archivística',
      'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
    ],
    additionalObservations:
      'Se requiere con urgencia una partida presupuestal para el depósito del archivo central y adecuación climática.',
    syncedToGoogleSheets: false,
  },
  {
    id: 'R-782102',
    createdAt: '2026-11-11T10:15:00.000Z',
    userNumber: '3411172',
    companyName: 'Notaría Cuarta del Círculo de Cali',
    companyType: 'privada_funciones_publicas',
    companyTypeLabel: 'Empresa Privada con Funciones Públicas',
    municipality: 'Santiago de Cali (Cali)',
    respondentRole: 'Secretario Notarial y Custodio de Protocolos',
    q1GeneralCauses: [
      'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
      'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
      'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
    ],
    q2OperationalCauses: [
      'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
    ],
    q3GovernanceCauses: [
      'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
      'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
    ],
    additionalObservations:
      'Las Tablas de Retención Documental no han sido actualizadas con la última reforma de la Superintendencia de Notariado y el AGN.',
    syncedToGoogleSheets: false,
  },
  {
    id: 'R-782103',
    createdAt: '2026-11-11T16:45:00.000Z',
    userNumber: '3411172',
    companyName: 'Curaduría Urbana No. 1 de Buenaventura',
    companyType: 'privada_funciones_publicas',
    companyTypeLabel: 'Empresa Privada con Funciones Públicas',
    municipality: 'Buenaventura',
    respondentRole: 'Coordinador de Licenciamiento y Archivo',
    q1GeneralCauses: [
      'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
      'Equipos obsoletos, desactualizados o inexistentes para agilizar las tareas archivísticas',
      'Personal poco calificado para desarrollar la función archivística',
    ],
    q2OperationalCauses: [
      'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
      'Equipos obsoletos, desactualizados o inexistentes para agilizar las tareas archivísticas',
    ],
    q3GovernanceCauses: [
      'Personal poco calificado para desarrollar la función archivística',
      'Alta rotación de contratistas y funcionarios sin empalme técnico archivístico',
    ],
    additionalObservations:
      'La alta humedad del puerto del Pacífico deteriora los expedientes físicos sin control de deshumidificación.',
    syncedToGoogleSheets: false,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'admin'>('form');
  const [currentUserNumber, setCurrentUserNumber] = useState<string>('3411172');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Google & Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Google Sheets state
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('valle_ley594_sheet_id');
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('valle_ley594_sheet_url');
  });

  // Survey responses state
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem('valle_ley594_responses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RESPONSES;
      }
    }
    return INITIAL_RESPONSES;
  });

  // Toast notifications
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  // Sync responses to localStorage
  useEffect(() => {
    localStorage.setItem('valle_ley594_responses', JSON.stringify(responses));
  }, [responses]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setFirebaseUser(user);
        setAccessToken(token);
      },
      () => {
        setFirebaseUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setFirebaseUser(result.user);
        setAccessToken(result.accessToken);
        showToast(
          'success',
          `Sesión iniciada como ${result.user.email}. Google Sheets habilitado.`
        );
      }
    } catch (err: any) {
      showToast(
        'error',
        err?.message || 'Error al conectar con la cuenta de Google'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  // Google Sign-Out
  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setFirebaseUser(null);
      setAccessToken(null);
      showToast('info', 'Sesión de Google cerrada.');
    } catch (err: any) {
      showToast('error', 'Error al cerrar sesión');
    }
  };

  // Create Spreadsheet
  const handleCreateSpreadsheet = async () => {
    let token = accessToken;
    if (!token) {
      const res = await googleSignIn();
      if (!res) return;
      token = res.accessToken;
      setFirebaseUser(res.user);
      setAccessToken(token);
    }

    setIsActionLoading(true);
    try {
      const { spreadsheetId: newId, spreadsheetUrl: newUrl } =
        await createDiagnosticSpreadsheet(
          token,
          `Diagnóstico Ley 594 Valle del Cauca - Usuario ${currentUserNumber || '3411172'}`
        );

      setSpreadsheetId(newId);
      setSpreadsheetUrl(newUrl);
      localStorage.setItem('valle_ley594_sheet_id', newId);
      localStorage.setItem('valle_ley594_sheet_url', newUrl);

      // Append existing responses
      if (responses.length > 0) {
        await appendResponsesToGoogleSheet(token, newId, responses);
        setResponses((prev) =>
          prev.map((r) => ({
            ...r,
            syncedToGoogleSheets: true,
            syncedAt: new Date().toISOString(),
            spreadsheetId: newId,
          }))
        );
      }

      showToast(
        'success',
        '¡Hoja de cálculo creada exitosamente en Google Sheets y respuestas transferidas!'
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        'error',
        err?.message || 'Error al crear la hoja en Google Sheets'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sync All Responses to existing sheet
  const handleSyncAllResponses = async () => {
    let token = accessToken;
    if (!token) {
      const res = await googleSignIn();
      if (!res) return;
      token = res.accessToken;
      setFirebaseUser(res.user);
      setAccessToken(token);
    }

    if (!spreadsheetId) {
      await handleCreateSpreadsheet();
      return;
    }

    setIsActionLoading(true);
    try {
      // Find un-synced responses or sync all
      const unsynced = responses.filter((r) => !r.syncedToGoogleSheets);
      const toSend = unsynced.length > 0 ? unsynced : responses;

      await appendResponsesToGoogleSheet(token, spreadsheetId, toSend);

      setResponses((prev) =>
        prev.map((r) => ({
          ...r,
          syncedToGoogleSheets: true,
          syncedAt: new Date().toISOString(),
          spreadsheetId,
        }))
      );

      showToast(
        'success',
        `Se enviaron ${toSend.length} respuestas correctamente a Google Sheets.`
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        'error',
        err?.message || 'Error al transferir datos a Google Sheets'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submit survey response
  const handleSubmitResponse = async (
    newResponseData: Omit<SurveyResponse, 'id' | 'createdAt' | 'syncedToGoogleSheets'>
  ): Promise<boolean> => {
    const newId = `R-${Date.now().toString().slice(-6)}`;
    const newRecord: SurveyResponse = {
      ...newResponseData,
      id: newId,
      createdAt: new Date().toISOString(),
      syncedToGoogleSheets: false,
    };

    // Check if we can automatically push to Google Sheets right away
    let token = accessToken;
    let didSyncToSheets = false;

    if (token && spreadsheetId) {
      try {
        await appendResponsesToGoogleSheet(token, spreadsheetId, [newRecord]);
        newRecord.syncedToGoogleSheets = true;
        newRecord.syncedAt = new Date().toISOString();
        newRecord.spreadsheetId = spreadsheetId;
        didSyncToSheets = true;
      } catch (err) {
        console.warn('No se pudo enviar inmediatamente a Google Sheets:', err);
      }
    }

    setResponses((prev) => [newRecord, ...prev]);

    if (didSyncToSheets) {
      showToast(
        'success',
        'Respuesta guardada y enviada automáticamente a su Google Sheets.'
      );
    } else {
      showToast(
        'info',
        'Respuesta guardada localmente. Puede enviarla a Google Sheets desde el panel.'
      );
    }

    return true;
  };

  // Delete response
  const handleDeleteResponse = (id: string) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
    showToast('info', 'Registro eliminado.');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium border ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-800 text-white border-red-700'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-300 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Password Modal to access Responses and Google Sheets */}
      <PasswordAccessModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setCurrentUserNumber('3411172');
          setActiveTab('admin');
          showToast('success', 'Contraseña 3411172 validada. Acceso concedido.');
        }}
        spreadsheetUrl={spreadsheetUrl}
        isGoogleConnected={!!firebaseUser && !!accessToken}
      />

      {/* Main Navigation Header with top-right 'Ver respuestas' button */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUserNumber={currentUserNumber}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        firebaseUser={firebaseUser}
        spreadsheetUrl={spreadsheetUrl}
        totalResponses={responses.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'form' ? (
          <SurveyForm
            currentUserNumber={currentUserNumber}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onSubmitResponse={handleSubmitResponse}
            isGoogleConnected={!!firebaseUser && !!accessToken}
            activeSpreadsheetUrl={spreadsheetUrl}
            onGoToSheetsPanel={() => setActiveTab('admin')}
          />
        ) : (
          <SheetsAdminPanel
            currentUserNumber={currentUserNumber}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            firebaseUser={firebaseUser}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            isSigningIn={isSigningIn}
            spreadsheetUrl={spreadsheetUrl}
            spreadsheetId={spreadsheetId}
            onCreateSpreadsheet={handleCreateSpreadsheet}
            onSyncAllResponses={handleSyncAllResponses}
            responses={responses}
            onDeleteResponse={handleDeleteResponse}
            isActionLoading={isActionLoading}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-slate-200 font-semibold">
              Diagnóstico de Gestión Documental en el Valle del Cauca
            </span>{' '}
            • Conforme a la Ley 594 de 2000 y lineamientos del Archivo General de la Nación (AGN).
          </div>
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
            <span>Usuario: {currentUserNumber || '3411172'}</span>
            <span>•</span>
            <span>Google Sheets Sync Activo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
