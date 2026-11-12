import React, { useState } from 'react';
import {
  SURVEY_QUESTIONS,
  VALLE_MUNICIPALITIES,
  COMPANY_TYPES,
  QuestionOption,
} from '../data/surveyQuestions';
import { SurveyResponse } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Briefcase,
  HelpCircle,
  Send,
  Sparkles,
  FileSpreadsheet,
  Check,
  RotateCcw,
} from 'lucide-react';

interface SurveyFormProps {
  currentUserNumber: string;
  onOpenLoginModal: () => void;
  onSubmitResponse: (
    response: Omit<SurveyResponse, 'id' | 'createdAt' | 'syncedToGoogleSheets'>
  ) => Promise<boolean>;
  isGoogleConnected: boolean;
  activeSpreadsheetUrl?: string | null;
  onGoToSheetsPanel: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  currentUserNumber,
  onOpenLoginModal,
  onSubmitResponse,
  isGoogleConnected,
  activeSpreadsheetUrl,
  onGoToSheetsPanel,
}) => {
  // Form fields state
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState<
    'publica_territorial' | 'publica_nacional' | 'privada_funciones_publicas' | 'otra'
  >('publica_territorial');
  const [municipality, setMunicipality] = useState(VALLE_MUNICIPALITIES[0]);
  const [respondentRole, setRespondentRole] = useState('');

  // 3 multiple selection questions state
  const [q1Selected, setQ1Selected] = useState<string[]>([]);
  const [q2Selected, setQ2Selected] = useState<string[]>([]);
  const [q3Selected, setQ3Selected] = useState<string[]>([]);

  const [additionalObservations, setAdditionalObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleOption = (
    questionId: 'q1' | 'q2' | 'q3',
    optionLabel: string
  ) => {
    if (questionId === 'q1') {
      setQ1Selected((prev) =>
        prev.includes(optionLabel)
          ? prev.filter((item) => item !== optionLabel)
          : [...prev, optionLabel]
      );
    } else if (questionId === 'q2') {
      setQ2Selected((prev) =>
        prev.includes(optionLabel)
          ? prev.filter((item) => item !== optionLabel)
          : [...prev, optionLabel]
      );
    } else if (questionId === 'q3') {
      setQ3Selected((prev) =>
        prev.includes(optionLabel)
          ? prev.filter((item) => item !== optionLabel)
          : [...prev, optionLabel]
      );
    }
  };

  const selectAll = (questionId: 'q1' | 'q2' | 'q3', options: QuestionOption[]) => {
    const allLabels = options.map((o) => o.label);
    if (questionId === 'q1') setQ1Selected(allLabels);
    if (questionId === 'q2') setQ2Selected(allLabels);
    if (questionId === 'q3') setQ3Selected(allLabels);
  };

  const clearAll = (questionId: 'q1' | 'q2' | 'q3') => {
    if (questionId === 'q1') setQ1Selected([]);
    if (questionId === 'q2') setQ2Selected([]);
    if (questionId === 'q3') setQ3Selected([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!companyName.trim()) {
      setValidationError('Por favor ingrese el nombre de la empresa o entidad evaluada.');
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    if (q1Selected.length === 0) {
      setValidationError('Por favor seleccione al menos una causa en la Pregunta 1.');
      window.scrollTo({ top: 750, behavior: 'smooth' });
      return;
    }

    if (q2Selected.length === 0) {
      setValidationError('Por favor seleccione al menos una opción en la Pregunta 2.');
      window.scrollTo({ top: 1200, behavior: 'smooth' });
      return;
    }

    if (q3Selected.length === 0) {
      setValidationError('Por favor seleccione al menos una opción en la Pregunta 3.');
      window.scrollTo({ top: 1650, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const typeObj = COMPANY_TYPES.find((t) => t.id === companyType);
      const companyTypeLabel = typeObj ? typeObj.label : 'Entidad';

      const success = await onSubmitResponse({
        userNumber: currentUserNumber || '3411172',
        companyName: companyName.trim(),
        companyType,
        companyTypeLabel,
        municipality,
        respondentRole: respondentRole.trim() || 'No especificado',
        q1GeneralCauses: q1Selected,
        q2OperationalCauses: q2Selected,
        q3GovernanceCauses: q3Selected,
        additionalObservations: additionalObservations.trim(),
      });

      if (success) {
        setSubmittedSuccess(true);
        setLastSubmittedId(`R-${Date.now().toString().slice(-6)}`);
        // Reset form
        setCompanyName('');
        setRespondentRole('');
        setQ1Selected([]);
        setQ2Selected([]);
        setQ3Selected([]);
        setAdditionalObservations('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Error al guardar la respuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'talento':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
            Talento Humano
          </span>
        );
      case 'materiales':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
            Materiales e Insumos
          </span>
        );
      case 'equipos':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
            Tecnología y Equipos
          </span>
        );
      case 'procedimientos':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            Procedimientos e Instrumentos
          </span>
        );
      case 'seguimiento':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
            Control y Auditoría
          </span>
        );
      case 'instalaciones':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
            Instalaciones Físicas
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Success banner */}
      {submittedSuccess && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading">
                  ¡Respuesta Registrada con Éxito!
                </h3>
                <p className="mt-1 text-sm text-emerald-50">
                  La evaluación diagnóstica de su entidad para el Valle del Cauca ha sido procesada y almacenada correctamente en el sistema.
                </p>
                <p className="mt-2 text-xs font-medium text-emerald-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Los datos han sido incorporados a la base del estudio sobre la Ley 594 de 2000.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="text-white/80 hover:text-white p-1 text-xl cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-white/20 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Diligenciar Otra Encuesta
            </button>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Institutional Introduction Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Instrumento de Investigación y Diagnóstico Departamental
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Cuestionario Oficial • Confidencial
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
              ¿Por qué algunas empresas del Valle del Cauca no aplican correctamente la gestión documental según la Ley 594 de 2000?
            </h2>

            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Este formulario tiene como objetivo identificar y ponderar las causas críticas por las cuales entidades públicas (del orden territorial y nacional) y entidades privadas que cumplen funciones públicas en los municipios del departamento del Valle del Cauca presentan dificultades para implementar la Ley General de Archivos y las disposiciones técnicas del Archivo General de la Nación (AGN).
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-bold text-slate-900 block">Marco Legal:</span>
                Ley 594 de 2000, Decreto 1080 de 2015 y Acuerdos AGN 049/2000, 002/2014.
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Ámbito Territorial:</span>
                Entidades situadas en los 42 municipios del Valle del Cauca.
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Destino de la Información:</span>
                Consolidación en base de datos para análisis de gestión documental.
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Entity Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                1. Identificación de la Entidad u Organización
              </h3>
              <p className="text-xs text-slate-500">
                Datos de contexto para el análisis estadístico y geográfico en el Valle del Cauca
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Entity Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nombre de la Empresa o Entidad evaluada *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej: Alcaldía Municipal de Palmira, Notaría Segunda de Cali, Curaduría Urbana, etc."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Entity Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Naturaleza de la Entidad *
              </label>
              <select
                value={companyType}
                onChange={(e: any) => setCompanyType(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              >
                {COMPANY_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Municipio del Valle del Cauca *
              </label>
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              >
                {VALLE_MUNICIPALITIES.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>

            {/* Respondent Role */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                Cargo o Rol de quien responde (opcional)
              </label>
              <input
                type="text"
                value={respondentRole}
                onChange={(e) => setRespondentRole(e.target.value)}
                placeholder="Ej: Coordinador de Gestión Documental, Auxiliar de Archivo, Jefe Jurídico, etc."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* The 3 Multiple Choice Questions */}
        {SURVEY_QUESTIONS.map((q) => {
          const currentSelected =
            q.id === 'q1' ? q1Selected : q.id === 'q2' ? q2Selected : q3Selected;

          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-heading font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                    {q.number}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Pregunta de Selección Múltiple
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {q.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => selectAll(q.id, q.options)}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Seleccionar todas
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => clearAll(q.id)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Subtitle & legal context */}
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {q.subtitle}
                </p>
                <div className="mt-2 text-xs text-slate-500 italic flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Sustento legal: {q.legalContext}</span>
                </div>
              </div>

              {/* Options Cards */}
              <div className="mt-5 space-y-3">
                {q.options.map((opt) => {
                  const isChecked = currentSelected.includes(opt.label);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleOption(q.id, opt.label)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`text-sm font-semibold leading-snug ${
                                isChecked ? 'text-emerald-950 font-bold' : 'text-slate-900'
                              }`}
                            >
                              {opt.label}
                            </span>
                            {getCategoryBadge(opt.category)}
                          </div>
                          {opt.description && (
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-right">
                <span className="text-xs text-slate-500 font-medium">
                  {currentSelected.length} de {q.options.length} opciones seleccionadas
                </span>
              </div>
            </div>
          );
        })}

        {/* Section: Additional Observations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            Observaciones o Propuestas de Mejora Institucional
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Comentarios adicionales sobre la aplicación de decretos y acuerdos del AGN en el departamento del Valle del Cauca.
          </p>
          <textarea
            rows={3}
            value={additionalObservations}
            onChange={(e) => setAdditionalObservations(e.target.value)}
            placeholder="Añada aquí cualquier detalle relevante sobre fondos acumulados, transferencias secundarias o inspección de la Procuraduría / AGN..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all resize-y"
          />
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Submission Bar */}
        <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Instrumento Diagnóstico Departamental
              </div>
              <div className="text-sm font-bold text-white">
                Valle del Cauca • Ley 594 de 2000 y AGN
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Respuestas de la Encuesta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
