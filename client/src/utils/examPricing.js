export const DEFAULT_ORDER_PRICE = 5990;

export const EXAM_PRICES = {
  'Herpes Simplex (HSV-1 HSV-2) Serología IgG': 2990,
  'Audiometría Bilateral': 3990,
  'Impedanciometría': 2990,
  'Magnesio plasmático': 1990,
  'Albúmina plasmática': 1990,
  'Prealbúmina': 1990,
  'InBody - Composición corporal por Bioimpedancia': 4990,
  'PTGO - Prueba de tolerancia a la Glucosa Oral': 3990,
  'Test de HOMA - Resistencia a la Insulina': 2990,
  'Glucosa en ayunas': 1990,
  'PCR ultrasensible': 2990,
  'Test de Opiáceos': 3990,
  'HCG.beta - Gonadotrofina Coriónica Subunidad Beta cuantitativa': 2990,
  'Test de aire espirado - Detección Helycobacter pylori': 3990,
  'Test de aire espirado - Detección de intolerancia a Lactosa, Lactulosa y Fructosa': 3990,
  'Creatinina en orina': 1990,
  'FSH - Hormona Folículo Estimulante': 2990,
  'LH - Hormona Luteizante': 2990,
  'Estradiol': 2990,
  'Hemograma y VHS': 2990,
  'Perfil Hepático': 2990,
  'Perfil Lipídico': 2990,
  'Perfil Bioquímico': 3990,
  'Creatinina': 1990,
  'Hemoglobina glicosilada (HbA1c)': 2990,
  'Electrolitos plasmáticos (Sodio, Potasio, Cloro)': 2990,
  'Pruebas tiroideas (TSH, T4 libre, T3)': 3990,
  'Electrocardiograma de reposo (12 derivadas)': 3990,
  'Holter de presión': 4990,
  'Antígeno Prostático Específico': 3990,
  'Test de hemorragias ocultas en deposiciones': 2990,
  'Grupo Sanguíneo (ABO y Rh)': 1990,
  'Microalbuminuria': 2990,
  'Orina Completa': 1990,
  'Urocultivo': 2990,
  'Cinética de Fierro': 2990,
  'Vitamina B12 (VIT B12)': 2990,
  'Vitamina D (VIT D)': 3990,
  'Ácido Fólico': 2990,
  'Calcio Total': 1990,
  'Fosfato': 1990,
  'Zinc Plasmático': 1990,
  'Test de esfuerzo': 4990,
  'Test de Anfetaminas': 3990,
  'Test de THC': 3990,
  'Test de Cocaína': 3990,
  'Test de Benzodiacepinas': 3990,
  'Espirometría basal': 3990,
  'Hepatitis B, Antígeno de Superficie (HBsAg)': 2990,
  'Nitrógeno Uréico': 1990,
  'Ácido Úrico': 1990,
  'VDRL': 2990,
  'Holter de Ritmo': 4990,
  'Papanicolau (PAP)': 3990,
  'Test de ELISA para VIH': 2990,
  'Test de Elisa para VHC': 2990,
  'Gonadotrofina Coriónica Subunidad Beta (HCG-beta) cuantitativa': 2990,
  'Ecografía Abdominal': 3990,
  'Ecografía Ginecológica Transvaginal': 4990,
  'Ecografía mamaria bilateral': 4990,
  'Mamografía bilateral': 4990,
  'Densitometría ósea': 4990,
  'Ecografía de Tiroides': 3990,
  'Ecografía Renal Preventiva': 3990,
  'Ecografía Doppler de Carótidas': 4990,
  'Ecografía Cardíaca Doppler transtorácica': 5990,
  'Ecografía de Hígado': 3990
};

export function isKnownExamName(name) {
  return Object.prototype.hasOwnProperty.call(EXAM_PRICES, String(name || '').trim());
}

export function getExamPrice(name) {
  return DEFAULT_ORDER_PRICE;
}

export function normalizeCartItemPrice(item) {
  const normalizedName = String(item?.name || '').trim();
  if (!normalizedName) {
    return item;
  }

  const isPack = Array.isArray(item.exams) && item.exams.length > 0;
  const normalizedPrice = isPack
    ? DEFAULT_ORDER_PRICE
    : getExamPrice(normalizedName);

  return {
    ...item,
    price: normalizedPrice
  };
}
