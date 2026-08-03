import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { DEFAULT_ORDER_PRICE } from '../utils/examPricing';

const COMPACT_VIEW_STORAGE_KEY = 'ordenPreventivaHombreCompactView';

const getInitialCompactView = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const savedPreference = window.localStorage.getItem(COMPACT_VIEW_STORAGE_KEY);
  if (savedPreference !== null) {
    return savedPreference === 'true';
  }

  return window.innerWidth < 768;
};

function OrdenPreventivaHombre() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedType, setSelectedType] = useState('todos');
  const [compactView, setCompactView] = useState(getInitialCompactView);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { addToCart, isInCart } = useCart();

  const PACK_PRICE = DEFAULT_ORDER_PRICE;
  const PAGE_SIZE = 8;

  const normalizeExamName = (examName) => {
    const aliases = {
      'Test de HOMA - Resitencia a la Insulina': 'Test de HOMA - Resistencia a la Insulina',
      'Electrolitos plasmáticos': 'Electrolitos plasmáticos (Sodio, Potasio, Cloro)',
      'Holter de presión arterial 24 horas': 'Holter de presión',
      'Ecografía Abdominal Preventiva': 'Ecografía Abdominal',
      'Ecografía Hepática': 'Ecografía de Hígado',
      'Ecografía cardíaca Doppler transtorácica': 'Ecografía Cardíaca Doppler transtorácica',
    };

    return aliases[examName] || examName;
  };

  const controlPreventivoBaseExams = [
    'Hemograma y VHS',
    'Perfil Lipídico',
    'Creatinina',
    'Electrolitos plasmáticos (Sodio, Potasio, Cloro)',
    'Electrocardiograma de reposo (12 derivadas)',
    'Test de esfuerzo',
    'Perfil Hepático',
    'Perfil Bioquímico',
    'Hemoglobina glicosilada (HbA1c)',
    'Pruebas tiroideas (TSH, T4 libre, T3)',
    'Holter de presión',
    'Vitamina B12 (VIT B12)',
    'Vitamina D (VIT D)',
    'Test de hemorragias ocultas en deposiciones',
    'Calcio Total',
    'Ácido Úrico',
    'InBody - Composición corporal por Bioimpedancia',
    'Antígeno Prostático Específico',
    'Test de ELISA para VIH',
    'VDRL',
    'Test de Elisa para VHC',
    'Hepatitis B, Antígeno de Superficie (HBsAg)'
  ];

  const chequeoAdultoMayorExams = [
    'Hemograma y VHS',
    'Perfil Bioquímico',
    'Perfil Lipídico',
    'Creatinina',
    'Ácido Úrico',
    'Vitamina D (VIT D)',
    'Vitamina B12 (VIT B12)',
    'Ácido Fólico',
    'Calcio Total',
    'Fosfato',
    'Electrocardiograma de reposo (12 derivadas)',
    'Holter de Ritmo',
    'Densitometría ósea',
    'Ecografía Abdominal',
    'Test de hemorragias ocultas en deposiciones',
    'Antígeno Prostático Específico',
    'Orina Completa'
  ];

  const packsSource = [
    {
      name: 'Evaluación Composición Corporal Inbody',
      slug: 'evaluacion-inbody',
      sections: [
        { exams: ['InBody - Composición corporal por Bioimpedancia'] }
      ]
    },
    {
      name: 'Holter de Ritmo',
      slug: 'holter-de-ritmo',
      sections: [
        { exams: ['Holter de Ritmo'] }
      ]
    },
    {
      name: 'Evaluación Déficit Nutricional',
      slug: 'evaluacion-deficit-nutricional',
      sections: [
        {
          exams: [
            'Hemograma y VHS',
            'Perfil Lipídico',
            'Pruebas tiroideas (TSH, T4 libre, T3)',
            'Vitamina B12 (VIT B12)',
            'Vitamina D (VIT D)',
            'Calcio Total',
            'Cinética de Fierro',
            'Magnesio plasmático',
            'Ácido Fólico',
            'Fosfato',
            'Zinc Plasmático',
            'Albúmina plasmática',
            'Prealbúmina',
            'InBody - Composición corporal por Bioimpedancia'
          ]
        }
      ]
    },
    {
      name: 'Chequeo para Veganos / Vegetarianos',
      slug: 'chequeo-veganos-vegetarianos',
      sections: [
        {
          exams: [
            'Hemograma y VHS',
            'Perfil Lipídico',
            'Creatinina',
            'Perfil Hepático',
            'Perfil Bioquímico',
            'Pruebas tiroideas (TSH, T4 libre, T3)',
            'Vitamina B12 (VIT B12)',
            'Vitamina D (VIT D)',
            'Calcio Total',
            'Cinética de Fierro',
            'Magnesio plasmático',
            'Ácido Fólico',
            'Fosfato',
            'Zinc Plasmático',
            'Albúmina plasmática',
            'Orina Completa',
            'Prealbúmina',
            'InBody - Composición corporal por Bioimpedancia'
          ]
        }
      ]
    },
    {
      name: 'Evaluación de Tiroides',
      slug: 'evaluacion-tiroides',
      sections: [
        { exams: ['Pruebas tiroideas (TSH, T4 libre, T3)'] },
        { exams: ['Ecografía de Tiroides'] }
      ]
    },
    {
      name: 'Detección Diabetes e Insulino Resistencia',
      slug: 'deteccion-diabetes',
      sections: [
        {
          exams: [
            'Hemoglobina glicosilada (HbA1c)',
            'Pruebas tiroideas (TSH, T4 libre, T3)',
            'Orina Completa',
            'PTGO - Prueba de tolerancia a la Glucosa Oral',
            'Test de HOMA - Resitencia a la Insulina',
            'Glucosa en ayunas',
            'Ácido Úrico',
            'PCR ultrasensible',
            'Perfil Lipídico',
            'InBody - Composición corporal por Bioimpedancia'
          ]
        }
      ]
    },
    {
      name: 'Detección de Grupo Sanguíneo',
      slug: 'deteccion-grupo-sanguineo',
      sections: [
        { exams: ['Grupo Sanguíneo (ABO y Rh)'] }
      ]
    },
    {
      name: 'Detección de Drogas',
      slug: 'deteccion-drogas',
      sections: [
        {
          exams: [
            'Test de Anfetaminas',
            'Test de THC',
            'Test de Cocaína',
            'Test de Benzodiacepinas',
            'Test de Opiáceos'
          ]
        }
      ]
    },
    {
      name: 'Examen de Orina y Perfil Renal',
      slug: 'examenes-de-orina-y-perfil-renal',
      sections: [
        {
          exams: [
            'Orina Completa',
            'Ácido Úrico',
            'Nitrógeno Uréico',
            'Urocultivo',
            'Creatinina'
          ]
        },
        { exams: ['Ecografía Renal Preventiva'] }
      ]
    },
    {
      name: 'Control para Diabetes e Hipertensión',
      slug: 'chequeo-general-para-diabetes-e-hipertension',
      sections: [
        {
          exams: [
            'Hemograma y VHS',
            'Perfil Lipídico',
            'Creatinina',
            'Electrolitos plasmáticos (Sodio, Potasio, Cloro)',
            'Electrocardiograma de reposo (12 derivadas)',
            'Perfil Hepático',
            'Perfil Bioquímico',
            'Hemoglobina glicosilada (HbA1c)',
            'Pruebas tiroideas (TSH, T4 libre, T3)',
            'Orina Completa',
            'PCR ultrasensible',
            'Urocultivo',
            'Microalbuminuria',
            'Creatinina en orina',
            'InBody - Composición corporal por Bioimpedancia',
            'Ácido Úrico',
            'Nitrógeno Uréico'
          ]
        },
        { exams: ['Ecografía Cardíaca Doppler transtorácica'] }
      ]
    },
    {
      name: 'Detección de Enfermedades Sexuales (ETS)',
      slug: 'deteccion-ets',
      sections: [
        {
          exams: [
            'Test de ELISA para VIH',
            'VDRL',
            'Test de Elisa para VHC',
            'Hepatitis B, Antígeno de Superficie (HBsAg)',
            'Herpes Simplex (HSV-1 HSV-2) Serología IgG'
          ]
        }
      ]
    },
    {
      name: 'Evaluación Caída del Cabello',
      slug: 'examenes-preventivos-pack-capilar',
      sections: [
        {
          exams: [
            'Hemograma y VHS',
            'Perfil Hepático',
            'Perfil Bioquímico',
            'Pruebas tiroideas (TSH, T4 libre, T3)',
            'Vitamina B12 (VIT B12)',
            'Vitamina D (VIT D)',
            'VDRL',
            'Cinética de Fierro',
            'Zinc Plasmático'
          ]
        }
      ]
    },
    {
      name: 'Evaluación Intolerancia Alimentaria - SIBO',
      slug: 'examen-sibo',
      sections: [
        {
          exams: [
            'Test de aire espirado - Detección Helycobacter pylori',
            'Test de aire espirado - Detección de intolerancia a Lactosa, Lactulosa y Fructosa'
          ]
        }
      ]
    },
    {
      name: 'Electrocardiograma',
      slug: 'examen-electrocardiograma',
      sections: [
        { exams: ['Electrocardiograma de reposo (12 derivadas)'] }
      ]
    },
    {
      name: 'Índice de riesgo Cardiovascular',
      slug: 'indice-riesgo-cardiovascular',
      sections: [
        {
          exams: [
            'Perfil Lipídico',
            'Electrocardiograma de reposo (12 derivadas)',
            'Hemoglobina glicosilada (HbA1c)',
            'Holter de presión',
            'Glucosa en ayunas'
          ]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 18 a 29 años',
      slug: 'preventivo-hombre-18-29',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 30 a 39 años',
      slug: 'preventivo-hombre-30-39',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 40 a 49 años',
      slug: 'preventivo-hombre-40-49',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 50 a 59 años',
      slug: 'preventivo-hombre-50-59',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 60 a 69 años',
      slug: 'preventivo-hombre-60-69',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 70 a 79 años',
      slug: 'preventivo-hombre-70-79',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 80 a 99 años',
      slug: 'preventivo-hombre-80-99',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Control Preventivo Hombre 99 años y más...',
      slug: 'preventivo-hombre-99-mas',
      sections: [
        {
          exams: [...controlPreventivoBaseExams]
        }
      ]
    },
    {
      name: 'Chequeo General Adulto Mayor',
      slug: 'chequeo-general-adulto-mayor',
      sections: [
        {
          exams: [...chequeoAdultoMayorExams]
        }
      ]
    },
    {
      name: 'Chequeo General de Salud',
      slug: 'chequeo-general-salud',
      sections: [
        {
          exams: [
            'Hemograma y VHS',
            'Perfil Lipídico',
            'Perfil Bioquímico',
            'Perfil Hepático',
            'Creatinina',
            'Electrolitos plasmáticos',
            'Hemoglobina glicosilada (HbA1c)',
            'Pruebas tiroideas (TSH, T4 libre, T3)',
            'Orina Completa',
            'Ácido Úrico',
            'Vitamina D (VIT D)',
            'InBody - Composición corporal por Bioimpedancia'
          ]
        }
      ]
    },
    {
      name: 'Ecografía Renal Preventiva',
      slug: 'eco-renal',
      sections: [
        { exams: ['Ecografía Renal Preventiva'] }
      ]
    },
    {
      name: 'Holter de Presión',
      slug: 'holter-presion',
      sections: [
        { exams: ['Holter de presión arterial 24 horas'] }
      ]
    },
    {
      name: 'Exámenes Preocupacionales y Evaluación Laboral',
      slug: 'preocupacionales',
      sections: [
        {
          exams: [
            'Hemograma',
            'Perfil Bioquímico',
            'Orina Completa',
            'Grupo Sanguíneo',
            'Test de drogas',
            'Electrocardiograma',
            'Radiografía de tórax',
            'Audiometría'
          ]
        }
      ]
    },
    {
      name: 'Ecografía Abdominal Preventiva',
      slug: 'eco-abdominal',
      sections: [
        { exams: ['Ecografía Abdominal Preventiva'] }
      ]
    },
    {
      name: 'Ecografía Tiroídea Preventiva',
      slug: 'eco-tiroidea',
      sections: [
        { exams: ['Ecografía de Tiroides'] }
      ]
    },
    {
      name: 'Ecografía de Hígado',
      slug: 'eco-hepatica',
      sections: [
        { exams: ['Ecografía Hepática'] }
      ]
    },
    {
      name: 'Ecografía Doppler de Carótidas',
      slug: 'doppler-carotidas',
      sections: [
        { exams: ['Ecografía Doppler de Carótidas'] }
      ]
    },
    {
      name: 'Control de Hipoacusia',
      slug: 'hipoacusia',
      sections: [
        { exams: ['Audiometría', 'Impedanciometría'] }
      ]
    },
    {
      name: 'Test de Hemorragias Ocultas',
      slug: 'sangre-oculta',
      sections: [
        { exams: ['Test de hemorragias ocultas en deposiciones'] }
      ]
    },
    {
      name: 'Densitometría Ósea',
      slug: 'densitometria',
      sections: [
        { exams: ['Densitometría ósea'] }
      ]
    },
    {
      name: 'Ecografía Cardíaca Preventiva',
      slug: 'eco-cardiaca',
      sections: [
        { exams: ['Ecografía cardíaca Doppler transtorácica'] }
      ]
    }
  ];

  const categories = packsSource.map((pack) => {
    const exams = (pack.sections || [])
      .flatMap((section) => section.exams || [])
      .map((examName) => normalizeExamName(examName));

    return {
      id: pack.slug,
      name: pack.name,
      type: inferPackType(pack.name),
      count: exams.length,
      exams,
      price: PACK_PRICE,
    };
  });

  const typeLabels = {
    todos: 'Todos',
    preventivo: 'Preventivos',
    cardiovascular: 'Cardiovascular',
    imagen: 'Imagen',
    laboratoro_perfiles: 'Perfiles',
    general: 'General',
  };

  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(categories.map((cat) => cat.type)));
    return ['todos', ...types];
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesType = selectedType === 'todos' || cat.type === selectedType;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        cat.name.toLowerCase().includes(term) ||
        cat.exams.some((exam) => exam.toLowerCase().includes(term));

      return matchesType && matchesSearch;
    });
  }, [categories, selectedType, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const paginatedCategories = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedType]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COMPACT_VIEW_STORAGE_KEY, String(compactView));
    }
  }, [compactView]);

  const handleAddPack = (pack) => {
    const cartItemId = `pack-hombre-${pack.id}`;
    addToCart({
      id: cartItemId,
      name: pack.name,
      category: 'Pack Preventivo Hombre',
      pricingType: 'pack',
      price: PACK_PRICE,
      exams: pack.exams,
      packSlug: pack.id,
    });

    setMessage({
      type: 'success',
      text: `${pack.name} fue agregado al carrito por $${PACK_PRICE.toLocaleString('es-CL')}.`
    });
  };

  function inferPackType(name) {
    const normalized = name.toLowerCase();
    if (normalized.includes('preventivo')) return 'preventivo';
    if (normalized.includes('ecografía') || normalized.includes('doppler')) return 'imagen';
    if (normalized.includes('holter') || normalized.includes('cardio')) return 'cardiovascular';
    if (normalized.includes('evaluación') || normalized.includes('chequeo') || normalized.includes('detección')) {
      return 'laboratoro_perfiles';
    }
    return 'general';
  }

  // Precios ocultos en la UI (se pueden mantener para cálculo interno si se requiere a futuro)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hombre
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Ordenes de exámenes médicos
          </p>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl p-6 mb-8">
          <p className="text-gray-700 text-center">
            Recuerda crear tu cuenta para activar tu Bitácora. Ahí podrás ver y guardar tus órdenes de examen de forma ordenada y siempre disponible.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pack o examen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {availableTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {typeLabels[type] || type}
              </button>
            ))}
          </div>
        </div>

        {message.text && (
          <div className={`max-w-4xl mx-auto mb-8 px-6 py-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Pack Cards */}
        <div className="max-w-6xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <span>Mostrando {paginatedCategories.length} de {filteredCategories.length} paquetes</span>
          <button
            type="button"
            onClick={() => setCompactView((prev) => !prev)}
            className={`px-3 py-1.5 rounded-md border font-medium transition-colors ${
              compactView
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700'
            }`}
          >
            {compactView ? 'Vista estándar' : 'Vista compacta'}
          </button>
        </div>
        <div className={`max-w-6xl mx-auto grid grid-cols-1 ${compactView ? 'md:grid-cols-3 lg:grid-cols-4 gap-3' : 'md:grid-cols-2 gap-6'} mb-8`}>
          {paginatedCategories.map((category) => {
            const cartItemId = `pack-hombre-${category.id}`;
            const alreadyInCart = isInCart(cartItemId);

            return (
              <div key={category.id} className={`bg-white rounded-xl shadow-lg ${compactView ? 'p-3' : 'p-6'} border border-gray-100`}>
                <button
                  type="button"
                  onClick={() => setSelectedPack(category)}
                  className="text-left w-full"
                >
                  <h3 className={`font-bold text-gray-900 hover:text-blue-700 transition-colors ${compactView ? 'text-sm leading-5' : 'text-xl'}`}>
                    {category.name}
                  </h3>
                </button>

                <p className={`text-gray-600 ${compactView ? 'text-xs mt-1' : 'text-sm mt-2'}`}>
                  {category.count} {category.count === 1 ? 'examen incluido' : 'exámenes incluidos'}
                </p>

                <div className={`flex items-center justify-between ${compactView ? 'mt-3' : 'mt-5'}`}>
                  <p className={`font-extrabold text-blue-700 ${compactView ? 'text-base' : 'text-2xl'}`}>
                    ${category.price.toLocaleString('es-CL')}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddPack(category)}
                    className={`rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 ${compactView ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2'}`}
                  >
                    <FaPlus />
                    <span>{alreadyInCart ? 'Agregar otra vez' : (compactView ? 'Agregar' : 'Agregar pack')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="max-w-6xl mx-auto text-center py-10 text-gray-500">
            No hay paquetes que coincidan con tu búsqueda.
          </div>
        )}

        {filteredCategories.length > PAGE_SIZE && (
          <div className="max-w-6xl mx-auto mb-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition"
          >
            Ir al carrito
          </button>
        </div>
      </div>

      {selectedPack && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">{selectedPack.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedPack(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-500 mb-4">
                Este pack incluye {selectedPack.count} {selectedPack.count === 1 ? 'examen' : 'exámenes'}.
              </p>
              <ul className="space-y-2">
                {selectedPack.exams.map((examName, index) => (
                  <li key={`${selectedPack.id}-exam-${index}`} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-gray-800">
                    {examName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-5 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Precio del pack (incluye IVA 19%)</p>
                <span className="text-2xl font-extrabold text-blue-700">
                  ${PACK_PRICE.toLocaleString('es-CL')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleAddPack(selectedPack);
                    setSelectedPack(null);
                    navigate('/cart');
                  }}
                  className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaPlus />
                  <span>Agregar y seguir al carrito</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddPack(selectedPack);
                    setSelectedPack(null);
                  }}
                  className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Seguir comprando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SaludSimpleFooter />
    </div>
  );
}

export default OrdenPreventivaHombre;
