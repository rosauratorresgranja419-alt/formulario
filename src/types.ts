export interface SurveyResponse {
  id: string;
  createdAt: string;
  userNumber: string; // e.g. "3411172" or respondent ID
  companyName: string;
  companyType: 'publica_territorial' | 'publica_nacional' | 'privada_funciones_publicas' | 'otra';
  companyTypeLabel: string;
  municipality: string;
  respondentRole: string;
  q1GeneralCauses: string[];
  q2OperationalCauses: string[];
  q3GovernanceCauses: string[];
  additionalObservations?: string;
  syncedToGoogleSheets: boolean;
  syncedAt?: string;
  spreadsheetId?: string;
}

export interface SheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  lastSyncAt: string | null;
}
