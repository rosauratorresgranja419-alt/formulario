import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  X,
  FileSpreadsheet,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface PasswordAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  spreadsheetUrl: string | null;
  isGoogleConnected: boolean;
}

export const PasswordAccessModal: React.FC<PasswordAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  spreadsheetUrl,
  isGoogleConnected,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '3411172') {
      setError(null);
      setIsUnlocked(true);
      onSuccess();
      // If spreadsheet URL already exists, open it directly in a new tab as requested
      if (spreadsheetUrl) {
        window.open(spreadsheetUrl, '_blank');
      }
    } else {
      setError('Contraseña incorrecta. Verifique e intente nuevamente.');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    setIsUnlocked(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top color ribbon */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500" />

        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Acceso a Respuestas
                </h3>
                <p className="text-xs text-slate-500">
                  Hoja de cálculo de Google • Ley 594
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isUnlocked ? (
            <form onSubmit={handleVerify} className="mt-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Para acceder a las respuestas y a la hoja de cálculo de Google, ingrese la contraseña de seguridad autorizada:
              </p>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ingrese la contraseña"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5 font-medium">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <span>Ingresar a Respuestas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Acceso Autorizado
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Contraseña verificada correctamente para el usuario <span className="font-mono font-bold">3411172</span>.
                </p>
              </div>

              {spreadsheetUrl ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    Hoja de Cálculo de Google Disponible
                  </div>
                  <p className="text-[11px] text-emerald-700 mb-3">
                    Haga clic a continuación para abrir la hoja directamente en una nueva pestaña o ver el panel.
                  </p>
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir Hoja de Cálculo en Google Sheets
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left">
                  Conecte su cuenta de Google en el panel que se abrirá para generar y enlazar la hoja de cálculo.
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Continuar al Panel de Respuestas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
