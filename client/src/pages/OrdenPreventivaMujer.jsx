import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaSearch, FaPlus, FaTimes, FaHeartbeat, FaThermometerHalf, FaMicrochip, FaBed, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaMoon, FaClock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import apiClient from '../config/axios';
import { DEFAULT_ORDER_PRICE } from '../utils/examPricing';

const COMPACT_VIEW_STORAGE_KEY = 'ordenPreventivaMujerCompactView';

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

function OrdenPreventivaMujer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedType, setSelectedType] = useState('todos');
  const [compactView, setCompactView] = useState(getInitialCompactView);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { addToCart, isInCart } = useCart();
  
  // Estados para datos biométricos
  const [biometricData, setBiometricData] = useState([]);
  const [loadingBiometric, setLoadingBiometric] = useState(false);
  const [biometricError, setBiometricError] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('DEVICE_001'); // Device ID por defecto

  const PACK_PRICE = DEFAULT_ORDER_PRICE;
  const PAGE_SIZE = 6;

  // Función para obtener datos biométricos del dispositivo
  const fetchBiometricData = async (deviceId) => {
    setLoadingBiometric(true);
    setBiometricError('');
    try {
      const response = await apiClient.get(`/health/devices/${deviceId}`);
      if (response.data.success) {
        setBiometricData(response.data.data);
      } else {
        setBiometricError('No se pudieron cargar los datos biométricos');
      }
    } catch (error) {
      console.error('Error fetching biometric data:', error);
      setBiometricError('Error al obtener datos del dispositivo: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingBiometric(false);
    }
  };

  // Efecto para cargar datos biométricos al montar el componente
  useEffect(() => {
    if (selectedDeviceId) {
      fetchBiometricData(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COMPACT_VIEW_STORAGE_KEY, String(compactView));
    }
  }, [compactView]);

  // Función para formatear la fecha
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente para mostrar datos biométricos
  const BiometricDataModule = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <FaHeartbeat className="text-red-500 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Datos Biométricos</h2>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Dispositivo:
          </label>
          <select 
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DEVICE_001">Dispositivo Principal (DEVICE_001)</option>
            <option value="OXIMETRO_001">Oxímetro (OXIMETRO_001)</option>
            <option value="TENSIOMETRO_001">Tensiómetro (TENSIOMETRO_001)</option>
            <option value="SLEEP_TRACKER_001">Monitor de Sueño (SLEEP_TRACKER_001)</option>
            <option value="WEARABLE_001">Dispositivo Portable (WEARABLE_001)</option>
          </select>
          <button 
            onClick={() => fetchBiometricData(selectedDeviceId)}
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            disabled={loadingBiometric}
          >
            {loadingBiometric ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {loadingBiometric && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Cargando datos biométricos...</p>
          </div>
        )}

        {biometricError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {biometricError}
          </div>
        )}

        {!loadingBiometric && !biometricError && biometricData.length === 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <FaMicrochip className="inline mr-2" />
            No hay datos biométricos disponibles para este dispositivo.
          </div>
        )}

        {!loadingBiometric && biometricData.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-3">
              Mostrando {biometricData.length} registro(s) del dispositivo <strong>{selectedDeviceId}</strong>
            </p>
            
            {biometricData.slice(0, 5).map((record, index) => (
              <div key={record._id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <FaMicrochip className="text-blue-500 mr-2" />
                    <span className="font-medium text-gray-800">Dispositivo: {record.deviceId}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(record.timestamp)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(record.data || {}).map(([key, value]) => {
                    // Función para obtener el icono apropiado
                    const getIcon = (key) => {
                      if (key.includes('temperatura')) return <FaThermometerHalf className="text-orange-500 mr-1" />;
                      if (key.includes('cardiaca') || key.includes('heartrate')) return <FaHeartbeat className="text-red-500 mr-1" />;
                      if (key.includes('sleep') || key.includes('sueño')) return <FaBed className="text-purple-500 mr-1" />;
                      if (key.includes('dream') || key.includes('rem')) return <FaMoon className="text-indigo-500 mr-1" />;
                      if (key.includes('duration') || key.includes('duracion')) return <FaClock className="text-blue-500 mr-1" />;
                      if (key.includes('bateria') || key.includes('battery')) {
                        const batteryLevel = typeof value === 'number' ? value : parseInt(value) || 0;
                        if (batteryLevel > 75) return <FaBatteryFull className="text-green-500 mr-1" />;
                        if (batteryLevel > 25) return <FaBatteryHalf className="text-yellow-500 mr-1" />;
                        return <FaBatteryQuarter className="text-red-500 mr-1" />;
                      }
                      return null;
                    };

                    // Función para formatear el valor
                    const formatValue = (key, value) => {
                      if (typeof value === 'object') return JSON.stringify(value);
                      
                      if (key.includes('bateria') || key.includes('battery')) {
                        const batteryLevel = typeof value === 'number' ? value : parseInt(value) || 0;
                        return `${batteryLevel}%`;
                      }
                      
                      if (key.includes('duration') || key.includes('duracion')) {
                        if (typeof value === 'number') {
                          const hours = Math.floor(value / 60);
                          const minutes = value % 60;
                          return `${hours}h ${minutes}m`;
                        }
                      }
                      
                      if (key.includes('temperatura') && typeof value === 'number') {
                        return `${value}°C`;
                      }
                      
                      if (key.includes('cardiaca') || key.includes('heartrate')) {
                        return `${value} bpm`;
                      }
                      
                      if (key.includes('oxigeno') || key.includes('oxygen')) {
                        return `${value}%`;
                      }
                      
                      if (key.includes('presion') && typeof value === 'number') {
                        return `${value} mmHg`;
                      }
                      
                      return value;
                    };

                    // Función para obtener el color de fondo basado en el tipo de dato
                    const getBackgroundColor = (key) => {
                      if (key.includes('sleep') || key.includes('sueño')) return 'bg-purple-50';
                      if (key.includes('bateria') || key.includes('battery')) return 'bg-green-50';
                      if (key.includes('temperatura')) return 'bg-orange-50';
                      if (key.includes('cardiaca')) return 'bg-red-50';
                      return 'bg-white';
                    };

                    return (
                      <div key={key} className={`${getBackgroundColor(key)} p-3 rounded border`}>
                        <div className="flex items-center mb-1">
                          {getIcon(key)}
                          <span className="text-xs font-medium text-gray-600 uppercase">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-gray-800">
                          {formatValue(key, value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {biometricData.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                ... y {biometricData.length - 5} registro(s) más
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const packsSource = [
    {
      source: "https://doctor911.cl/examenes/mujer",
      category: "Mujer",
      packs: [
        {
          name: "Control Preventivo Mujer 18 a 29 años",
          slug: "preventivo-mujer-18-29",
          type: "preventivo",
          sections: [
            {
              name: "Laboratorio",
              totalExams: 15,
              exams: [
                "Hemograma y VHS",
                "Perfil Lipídico",
                "Creatinina",
                "Electrolitos plasmáticos (Sodio, Potasio, Cloro)",
                "Electrocardiograma de reposo (12 derivadas)",
                "Perfil Hepático",
                "Hemoglobina glicosilada (HbA1c)",
                "Pruebas tiroideas (TSH, T4 libre, T3)",
                "Papanicolau (PAP)",
                "Test de ELISA para VIH",
                "VDRL",
                "Test de Elisa para VHC",
                "Hepatitis B, Antígeno de Superficie (HBsAg)",
                "Herpes Simplex (HSV-1 HSV-2) Serología IgG",
                "InBody - Composición corporal por Bioimpedancia"
              ]
            },
            {
              name: "Imágenes",
              totalExams: 1,
              exams: ["Ecografía mamaria bilateral"]
            }
          ]
        },
        {
          name: "Control Preventivo Mujer 30 a 39 años",
          slug: "preventivo-mujer-30-39",
          type: "preventivo",
          notes: "Similar a 18–29 con mayor foco cardiovascular + PAP + mamario"
        },
        {
          name: "Control Preventivo Mujer 40 a 49 años",
          slug: "preventivo-mujer-40-49",
          type: "preventivo",
          includesHighlights: ["Mamografía", "Papanicolau", "Perfil metabólico completo"]
        },
        {
          name: "Control Preventivo Mujer 50 a 59 años",
          slug: "preventivo-mujer-50-59",
          type: "preventivo",
          includesHighlights: ["Mamografía", "Perfil hormonal", "Densitometría ósea"]
        },
        {
          name: "Control Preventivo Mujer 60+",
          slug: "preventivo-mujer-60-plus",
          type: "preventivo",
          includesHighlights: ["Densitometría", "Evaluación cardiovascular", "Perfil completo adulto mayor"]
        },
        {
          name: "Chequeo General Adulto Mayor",
          slug: "chequeo-adulto-mayor",
          type: "preventivo"
        },
        {
          name: "Chequeo General de Salud",
          slug: "chequeo-general",
          type: "preventivo"
        },
        {
          name: "Evaluación Déficit Nutricional",
          slug: "deficit-nutricional",
          type: "nutricional"
        },
        {
          name: "Chequeo Veganos / Vegetarianos",
          slug: "veganos",
          type: "nutricional"
        },
        {
          name: "Evaluación de Tiroides",
          slug: "tiroides",
          type: "endocrino"
        },
        {
          name: "Detección Diabetes e Insulino Resistencia",
          slug: "diabetes",
          type: "metabolico"
        },
        {
          name: "Control Diabetes e Hipertensión",
          slug: "diabetes-hipertension",
          type: "cardiometabolico"
        },
        {
          name: "Evaluación Caída del Cabello",
          slug: "capilar",
          type: "dermatologico"
        },
        {
          name: "Evaluación Intolerancia Alimentaria - SIBO",
          slug: "sibo",
          type: "digestivo"
        },
        {
          name: "Mamografía Bilateral",
          slug: "mamografia",
          type: "cancer_mama",
          sections: [
            {
              name: "Imagen",
              exams: ["Mamografía bilateral"]
            }
          ]
        },
        {
          name: "Ecografía Mamaria Preventiva",
          slug: "eco-mamaria",
          type: "cancer_mama"
        },
        {
          name: "Ecografía Ginecológica Transvaginal",
          slug: "eco-ginecologica",
          type: "ginecologico"
        },
        {
          name: "Detección de Menopausia",
          slug: "menopausia",
          type: "hormonal"
        },
        {
          name: "Prueba de Embarazo (Test Sanguíneo)",
          slug: "embarazo",
          type: "ginecologico"
        },
        {
          name: "Detección de ETS",
          slug: "ets",
          sections: [
            {
              name: "Laboratorio",
              totalExams: 5,
              exams: ["VIH", "VDRL", "Hepatitis B", "Hepatitis C", "Herpes"]
            }
          ]
        },
        {
          name: "Perfil Renal y Orina",
          slug: "renal"
        },
        {
          name: "Detección de Drogas",
          slug: "drogas"
        },
        {
          name: "Grupo Sanguíneo",
          slug: "grupo-sanguineo"
        },
        {
          name: "Ecografía Abdominal",
          type: "imagen"
        },
        {
          name: "Ecografía Renal",
          type: "imagen"
        },
        {
          name: "Ecografía Hepática",
          type: "imagen"
        },
        {
          name: "Doppler Carótidas",
          type: "imagen"
        },
        {
          name: "Ecografía Cardíaca",
          type: "imagen"
        },
        {
          name: "Electrocardiograma",
          type: "cardiovascular"
        },
        {
          name: "Holter de Ritmo",
          type: "cardiovascular"
        },
        {
          name: "Holter de Presión",
          type: "cardiovascular"
        },
        {
          name: "Índice de Riesgo Cardiovascular",
          type: "cardiovascular"
        },
        {
          name: "Densitometría Ósea",
          type: "osteoporosis"
        },
        {
          name: "Control de Hipoacusia",
          type: "auditivo"
        },
        {
          name: "Test de Sangre Oculta",
          type: "digestivo"
        },
        {
          name: "InBody",
          type: "nutricional"
        },
        {
          name: "Exámenes Preocupacionales",
          slug: "preocupacional",
          type: "laboral"
        }
      ]
    }
  ];

  const allPacks = packsSource[0].packs;

  const availableTypes = useMemo(() => {
    const types = allPacks.map((pack) => pack.type || 'general');
    return ['todos', ...Array.from(new Set(types))];
  }, [allPacks]);

  const filteredPacks = useMemo(() => {
    return allPacks.filter((pack) => {
      const packType = pack.type || 'general';
      const matchesType = selectedType === 'todos' || packType === selectedType;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        pack.name.toLowerCase().includes(term) ||
        (pack.notes || '').toLowerCase().includes(term) ||
        (pack.includesHighlights || []).some((item) => item.toLowerCase().includes(term)) ||
        (pack.sections || []).some((section) =>
          (section.exams || []).some((exam) => exam.toLowerCase().includes(term))
        );

      return matchesType && matchesSearch;
    });
  }, [allPacks, selectedType, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPacks.length / PAGE_SIZE));
  const paginatedPacks = filteredPacks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedType]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const formatTypeLabel = (type) => {
    if (type === 'todos') return 'Todos';
    if (type === 'cardiometabolico') return 'Cardiometabólico';
    if (type === 'cancer_mama') return 'Cáncer de mama';
    return (type || 'General').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPackExamCount = (pack) => {
    if (!pack.sections || pack.sections.length === 0) return null;
    return pack.sections.reduce((acc, section) => acc + (section.exams?.length || section.totalExams || 0), 0);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Orden Preventiva Mujer</h1>
        
        {/* Módulo de Datos Biométricos */}
        <BiometricDataModule />
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Paquetes de Exámenes Disponibles</h2>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar paquetes de exámenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
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
                {formatTypeLabel(type)}
              </button>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
            <span>Mostrando {paginatedPacks.length} de {filteredPacks.length} paquetes</span>
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
          
          <div className={`grid grid-cols-1 ${compactView ? 'md:grid-cols-3 lg:grid-cols-4 gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
            {paginatedPacks.map((pack) => {
              const examCount = getPackExamCount(pack);
              const isSelected = selectedPack?.slug === pack.slug;

              return (
                <div key={pack.slug} className={`border border-gray-200 rounded-lg ${compactView ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow`}>
                  <button
                    type="button"
                    onClick={() => setSelectedPack(isSelected ? null : pack)}
                    className="w-full text-left"
                  >
                    <h3 className={`font-semibold text-gray-800 mb-2 hover:text-blue-700 transition-colors ${compactView ? 'text-sm leading-5' : ''}`}>{pack.name}</h3>
                  </button>
                  <div className={`${compactView ? 'mb-2' : 'mb-3'} flex items-center justify-between gap-3`}>
                    <span className={`text-xs font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 ${compactView ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded-full`}>
                      {formatTypeLabel(pack.type || 'general')}
                    </span>
                    {examCount ? (
                      <span className="text-xs text-gray-600">{examCount} exámenes</span>
                    ) : null}
                  </div>

                  {!compactView && isSelected && (
                    <div className="mb-3 border border-blue-100 bg-blue-50/50 rounded-md p-3 space-y-2">
                      {pack.notes ? (
                        <p className="text-sm text-gray-700">{pack.notes}</p>
                      ) : null}

                      {pack.includesHighlights?.length ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Incluye</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {pack.includesHighlights.map((item) => (
                              <li key={`${pack.slug}-${item}`}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {pack.sections?.length ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Detalle</p>
                          {pack.sections.map((section, sectionIndex) => (
                            <div key={`${pack.slug}-section-${sectionIndex}`} className="mb-2">
                              {section.name ? (
                                <p className="text-sm font-medium text-gray-700">{section.name}</p>
                              ) : null}
                              <ul className="text-sm text-gray-700 space-y-1">
                                {(section.exams || []).slice(0, 5).map((examName) => (
                                  <li key={`${pack.slug}-${sectionIndex}-${examName}`}>• {examName}</li>
                                ))}
                                {(section.exams || []).length > 5 ? (
                                  <li className="text-xs text-gray-500">
                                    + {(section.exams || []).length - 5} exámenes más
                                  </li>
                                ) : null}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {compactView && pack.includesHighlights?.length ? (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {pack.includesHighlights.slice(0, 2).join(' • ')}
                    </p>
                  ) : null}

                  <p className={`text-green-600 font-bold ${compactView ? 'text-sm mb-2' : 'mb-3'}`}>${PACK_PRICE.toLocaleString('es-CL')}</p>
                  <button
                    onClick={() => {
                      if (!isInCart(pack.slug)) {
                        addToCart({
                          id: pack.slug,
                          name: pack.name,
                          category: 'Pack Preventivo Mujer',
                          pricingType: 'pack',
                          price: PACK_PRICE
                        });
                        setMessage({ type: 'success', text: `${pack.name} agregado al carrito.` });
                      } else {
                        setMessage({ type: 'error', text: `${pack.name} ya está en el carrito.` });
                      }
                    }}
                    className={`w-full ${compactView ? 'py-1.5 px-3 text-sm' : 'py-2 px-4'} rounded-md transition-colors ${
                      isInCart(pack.slug) 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    disabled={isInCart(pack.slug)}
                  >
                    {isInCart(pack.slug) ? 'En el carrito' : 'Agregar al carrito'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredPacks.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No hay paquetes que coincidan con tu búsqueda.
            </div>
          )}

          {filteredPacks.length > PAGE_SIZE && (
            <div className="mt-6 flex items-center justify-center gap-3">
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
          
          {message.text && (
            <div className={`mt-4 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
      <SaludSimpleFooter />
    </div>
  );
}

export default OrdenPreventivaMujer;
