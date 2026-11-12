import React from 'react';
import { AlertCircle, FileSpreadsheet, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmLabel = 'Confirmar y Proceder',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl flex-shrink-0 ${
                isDestructive
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isDestructive ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {message}
              </p>

              {details && details.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                  <span className="font-semibold text-slate-900 block mb-1">
                    Detalles de la operación en Google Workspace:
                  </span>
                  {details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
              } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
