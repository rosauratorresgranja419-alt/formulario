export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  category?: 'talento' | 'materiales' | 'equipos' | 'procedimientos' | 'seguimiento' | 'instalaciones';
}

export interface QuestionData {
  id: 'q1' | 'q2' | 'q3';
  number: number;
  title: string;
  subtitle: string;
  legalContext: string;
  options: QuestionOption[];
}

export const SURVEY_QUESTIONS: QuestionData[] = [
  {
    id: 'q1',
    number: 1,
    title: 'Causas Principales de Incumplimiento en Gestión Documental',
    subtitle:
      'De acuerdo con su experiencia en entidades públicas y privadas con funciones públicas del Valle del Cauca, ¿cuáles causas impiden la correcta aplicación de la Ley 594 de 2000 y los lineamientos del Archivo General de la Nación?',
    legalContext:
      'Ley 594 de 2000 (Ley General de Archivos), Artículos 4 (Principios generales) y 11 (Obligatoriedad de la conformación de los archivos).',
    options: [
      {
        id: 'q1_personal_poco_calificado',
        label: 'Personal poco calificado para desarrollar la función archivística',
        description:
          'Falta de perfil idóneo, titulación en archivística o capacitación técnica del personal encargado de custodiar y organizar el acervo documental.',
        category: 'talento',
      },
      {
        id: 'q1_poca_disponibilidad_materiales',
        label: 'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
        description:
          'Escasez de insumos básicos normalizados: carpetas desacidificadas, cajas de archivo X-200 / X-300, ganchos plásticos legajadores, rótulos y material de conservación.',
        category: 'materiales',
      },
      {
        id: 'q1_equipos_obsoletos',
        label: 'Equipos obsoletos, desactualizados o inexistentes para agilizar las tareas archivísticas',
        description:
          'Carencia o desfase en escáneres de alta producción, software de gestión electrónica de documentos (SGDEA), servidores de almacenamiento o computadores.',
        category: 'equipos',
      },
      {
        id: 'q1_no_existen_procedimientos',
        label: 'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
        description:
          'Falta de adopción, actualización o socialización de Tablas de Retención Documental (TRD), Programa de Gestión Documental (PGD) y manuales operativos.',
        category: 'procedimientos',
      },
      {
        id: 'q1_poco_seguimiento',
        label: 'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
        description:
          'Ausencia de auditorías internas, falta de control en transferencias documentales y omisión del rol de vigilancia por parte del Comité Interno de Archivo.',
        category: 'seguimiento',
      },
      {
        id: 'q1_instalaciones_inadecuadas',
        label: 'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
        description:
          'Espacios con humedad, altas temperaturas, roedores, sin estanterías mecánicas rodantes, o sin cumplimiento del Acuerdo 049 de 2000 del AGN.',
        category: 'instalaciones',
      },
    ],
  },
  {
    id: 'q2',
    number: 2,
    title: 'Infraestructura Física, Equipos y Materiales de Archivo',
    subtitle:
      'En relación con los recursos físicos, tecnológicos e insumos suministrados en las empresas del departamento, ¿cuáles de las siguientes deficiencias materiales afectan con mayor gravedad el archivo?',
    legalContext:
      'Acuerdo 049 de 2000 (Condiciones de edificios y locales destinados a archivos) y Decreto 1080 de 2015 del Ministerio de Cultura.',
    options: [
      {
        id: 'q2_instalaciones_inadecuadas_detallado',
        label: 'Las instalaciones están poco adecuadas para el desarrollo de las funciones archivísticas',
        description:
          'Hacinamiento de expedientes, falta de ventilación, riesgo de plagas o áreas improvisadas sin seguridad contra incendios e inundaciones.',
        category: 'instalaciones',
      },
      {
        id: 'q2_equipos_obsoletos_detallado',
        label: 'Equipos obsoletos, desactualizados o inexistentes para agilizar las tareas archivísticas',
        description:
          'Imposibilidad de digitalizar con validez probatoria, equipos informáticos lentos o sin software seguro para índices y metadatos.',
        category: 'equipos',
      },
      {
        id: 'q2_poca_disponibilidad_materiales_detallado',
        label: 'Poca disponibilidad de materiales para desarrollar las tareas archivísticas',
        description:
          'Falta recurrente de papelería especializada, cajas técnicas de archivo, rótulos normalizados y elementos de protección personal (EPP) para archivistas.',
        category: 'materiales',
      },
      {
        id: 'q2_carencia_presupuesto_infraestructura',
        label: 'Ausencia de presupuesto formal asignado al rubro de infraestructura documental y custodia',
        description:
          'Las directivas no contemplan la inversión en depósitos adecuados en el Plan Operativo Anual de Inversiones (POAI).',
        category: 'instalaciones',
      },
      {
        id: 'q2_deterioro_fondos_acumulados',
        label: 'Presencia de fondos acumulados sin intervención por carencia de insumos y espacio físico',
        description:
          'Documentación histórica o inactiva en estado de deterioro biológico por falta de instalaciones acondicionadas.',
        category: 'materiales',
      },
    ],
  },
  {
    id: 'q3',
    number: 3,
    title: 'Talento Humano, Procedimientos y Seguimiento Institucional',
    subtitle:
      'Respecto a la idoneidad del personal, los manuales de procedimientos y la supervisión del cumplimiento normativo del AGN, ¿cuáles problemáticas son determinantes?',
    legalContext:
      'Ley 1409 de 2010 (Ejercicio de la profesión de archivística), Acuerdo 002 de 2014 y Decreto 2609 de 2012.',
    options: [
      {
        id: 'q3_personal_poco_calificado_detallado',
        label: 'Personal poco calificado para desarrollar la función archivística',
        description:
          'Delegación de la gestión documental a personal sin formación técnica o profesional en archivística y sin tarjeta profesional.',
        category: 'talento',
      },
      {
        id: 'q3_no_existen_procedimientos_detallado',
        label: 'No existen o no están claros los procedimientos para desarrollar los procesos archivísticos',
        description:
          'Carencia o falta de convalidación de Tablas de Retención Documental (TRD), Tablas de Valoración Documental (TVD) y Cuadros de Clasificación.',
        category: 'procedimientos',
      },
      {
        id: 'q3_poco_seguimiento_detallado',
        label: 'No se hace o se hace poco seguimiento al desarrollo de los procesos archivísticos',
        description:
          'Inexistencia de auditorías de control interno sobre el archivo de gestión, transferencias documentales y eliminación legal de documentos.',
        category: 'seguimiento',
      },
      {
        id: 'q3_inoperancia_comite_archivo',
        label: 'Inoperancia o falta de conformación del Comité Institucional de Gestión y Desempeño / Archivo',
        description:
          'No se sesiona ni se toman decisiones vinculantes para la política de gestión documental en la entidad.',
        category: 'seguimiento',
      },
      {
        id: 'q3_rotacion_personal_perdida_memoria',
        label: 'Alta rotación de contratistas y funcionarios sin empalme técnico archivístico',
        description:
          'Falta de continuidad en la organización de los expedientes físicos y electrónicos debido al cambio frecuente de personal.',
        category: 'talento',
      },
    ],
  },
];

export const VALLE_MUNICIPALITIES = [
  'Santiago de Cali (Cali)',
  'Palmira',
  'Buenaventura',
  'Guadalajara de Buga (Buga)',
  'Tuluá',
  'Cartago',
  'Yumbo',
  'Jamundí',
  'Candelaria',
  'Florida',
  'Pradera',
  'Sevilla',
  'Zarzal',
  'Roldanillo',
  'La Unión',
  'Caicedonia',
  'El Cerrito',
  'Dagua',
  'Guacarí',
  'Ginebra',
  'Ansermanuevo',
  'Bugalagrande',
  'Bolívar',
  'Trujillo',
  'Restrepo',
  'Riofrío',
  'Obando',
  'Toro',
  'Alcalá',
  'Ulloa',
  'La Victoria',
  'Versalles',
  'El Dovio',
  'San Pedro',
  'Yotoco',
  'Vijes',
  'La Cumbre',
  'Calima - El Darién',
  'Otro municipio del Valle del Cauca',
];

export const COMPANY_TYPES = [
  {
    id: 'publica_territorial',
    label: 'Empresa o Entidad Pública Territorial (Alcaldía, Gobernación, Concejo, E.S.E., etc.)',
  },
  {
    id: 'publica_nacional',
    label: 'Entidad Pública del Orden Nacional con sede en el Valle del Cauca',
  },
  {
    id: 'privada_funciones_publicas',
    label: 'Empresa Privada con Funciones Públicas (Notaría, Curaduría, Cámara de Comercio, E.S.P., etc.)',
  },
  {
    id: 'otra',
    label: 'Otra entidad sujeta a inspección y vigilancia archivística',
  },
] as const;
