import { SurveyResponse } from '../types';

const SHEET_NAME = 'Respuestas_Ley594';

const HEADERS = [
  'ID Respuesta',
  'Fecha y Hora (Colombia)',
  'ID Usuario',
  'Entidad u Organización',
  'Tipo de Entidad',
  'Municipio (Valle del Cauca)',
  'Cargo / Rol Archivístico',
  'Pregunta 1: Causas Generales de Incumplimiento (Ley 594)',
  'Pregunta 2: Infraestructura, Equipos y Materiales',
  'Pregunta 3: Gobernanza, Procedimientos y Talento Humano',
  'Observaciones y Recomendaciones AGN',
];

/**
 * Creates a new Google Spreadsheet formatted for the diagnostic survey
 */
export async function createDiagnosticSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title =
    customTitle ||
    `Diagnóstico Ley 594 de 2000 - Valle del Cauca (Usuario 3411172) - ${new Date().toLocaleDateString('es-CO')}`;

  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: SHEET_NAME,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Error al crear hoja de cálculo (${response.status})`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers to the new spreadsheet
  await appendRowValues(accessToken, spreadsheetId, [HEADERS]);

  // Style header row with styling (dark emerald background, white bold text)
  try {
    await formatHeaderRow(accessToken, spreadsheetId, data.sheets?.[0]?.properties?.sheetId || 0);
  } catch (err) {
    console.warn('No se pudo aplicar estilo al encabezado, pero los datos se guardaron:', err);
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Formats the first row with bold text, green header background, and auto-resize
 */
async function formatHeaderRow(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number
): Promise<void> {
  const batchUpdateRequest = {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: HEADERS.length,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.05, green: 0.35, blue: 0.25 }, // Deep archival green
              textFormat: {
                foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                bold: true,
                fontSize: 10,
              },
              horizontalAlignment: 'CENTER',
              wrapStrategy: 'WRAP',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)',
        },
      },
    ],
  };

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(batchUpdateRequest),
  });
}

/**
 * Appends raw row values to a specific spreadsheet
 */
async function appendRowValues(
  accessToken: string,
  spreadsheetId: string,
  rows: (string | number)[][]
): Promise<void> {
  const range = encodeURIComponent(`'${SHEET_NAME}'!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: rows }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Error al registrar fila en Google Sheets (${response.status})`
    );
  }
}

/**
 * Formats and appends a list of SurveyResponse objects to Google Sheets
 */
export async function appendResponsesToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  responses: SurveyResponse[]
): Promise<void> {
  if (responses.length === 0) return;

  const rows = responses.map((r) => [
    r.id,
    new Date(r.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    r.userNumber || '3411172',
    r.companyName || 'Sin especificar',
    r.companyTypeLabel,
    r.municipality,
    r.respondentRole || 'No especificado',
    r.q1GeneralCauses.join(' | '),
    r.q2OperationalCauses.join(' | '),
    r.q3GovernanceCauses.join(' | '),
    r.additionalObservations || 'Ninguna observación adicional registrada',
  ]);

  await appendRowValues(accessToken, spreadsheetId, rows);
}
