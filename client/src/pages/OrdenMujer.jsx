import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { FaSearch, FaShoppingCart, FaPlus, FaCheck, FaLayerGroup, FaVial, FaImage } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { DEFAULT_ORDER_PRICE } from '../utils/examPricing';

function OrdenMujer() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [compactView, setCompactView] = useState(true);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { addToCart, isInCart, getCartItemCount } = useCart();

  const examOptions = [
    // Laboratorio
    { id: 'lab-1', name: 'Herpes Simplex (HSV-1 HSV-2) Serología IgG', category: 'Laboratorio', price: 2990 },
    { id: 'lab-2', name: 'Audiometría Bilateral', category: 'Laboratorio', price: 3990 },
    { id: 'lab-3', name: 'Impedanciometría', category: 'Laboratorio', price: 2990 },
    { id: 'lab-4', name: 'Magnesio plasmático', category: 'Laboratorio', price: 1990 },
    { id: 'lab-5', name: 'Albúmina plasmática', category: 'Laboratorio', price: 1990 },
    { id: 'lab-6', name: 'Prealbúmina', category: 'Laboratorio', price: 1990 },
    { id: 'lab-7', name: 'InBody - Composición corporal por Bioimpedancia', category: 'Laboratorio', price: 4990 },
    { id: 'lab-8', name: 'PTGO - Prueba de tolerancia a la Glucosa Oral', category: 'Laboratorio', price: 3990 },
    { id: 'lab-9', name: 'Test de HOMA - Resistencia a la Insulina', category: 'Laboratorio', price: 2990 },
    { id: 'lab-10', name: 'Glucosa en ayunas', category: 'Laboratorio', price: 1990 },
    { id: 'lab-11', name: 'PCR ultrasensible', category: 'Laboratorio', price: 2990 },
    { id: 'lab-12', name: 'Test de Opiáceos', category: 'Laboratorio', price: 3990 },
    { id: 'lab-13', name: 'HCG.beta - Gonadotrofina Coriónica Subunidad Beta cuantitativa', category: 'Laboratorio', price: 2990 },
    { id: 'lab-14', name: 'Test de aire espirado - Detección Helycobacter pylori', category: 'Laboratorio', price: 3990 },
    { id: 'lab-15', name: 'Test de aire espirado - Detección de intolerancia a Lactosa, Lactulosa y Fructosa', category: 'Laboratorio', price: 3990 },
    { id: 'lab-16', name: 'Creatinina en orina', category: 'Laboratorio', price: 1990 },
    { id: 'lab-17', name: 'FSH - Hormona Folículo Estimulante', category: 'Laboratorio', price: 2990 },
    { id: 'lab-18', name: 'LH - Hormona Luteizante', category: 'Laboratorio', price: 2990 },
    { id: 'lab-19', name: 'Estradiol', category: 'Laboratorio', price: 2990 },
    { id: 'lab-20', name: 'Hemograma y VHS', category: 'Laboratorio', price: 2990 },
    { id: 'lab-21', name: 'Perfil Hepático', category: 'Laboratorio', price: 2990 },
    { id: 'lab-22', name: 'Perfil Lipídico', category: 'Laboratorio', price: 2990 },
    { id: 'lab-23', name: 'Perfil Bioquímico', category: 'Laboratorio', price: 3990 },
    { id: 'lab-24', name: 'Creatinina', category: 'Laboratorio', price: 1990 },
    { id: 'lab-25', name: 'Hemoglobina glicosilada (HbA1c)', category: 'Laboratorio', price: 2990 },
    { id: 'lab-26', name: 'Electrolitos plasmáticos (Sodio, Potasio, Cloro)', category: 'Laboratorio', price: 2990 },
    { id: 'lab-27', name: 'Pruebas tiroideas (TSH, T4 libre, T3)', category: 'Laboratorio', price: 3990 },
    { id: 'lab-28', name: 'Electrocardiograma de reposo (12 derivadas)', category: 'Laboratorio', price: 3990 },
    { id: 'lab-29', name: 'Holter de presión', category: 'Laboratorio', price: 4990 },
    { id: 'lab-30', name: 'Test de hemorragias ocultas en deposiciones', category: 'Laboratorio', price: 2990 },
    { id: 'lab-31', name: 'Grupo Sanguíneo (ABO y Rh)', category: 'Laboratorio', price: 1990 },
    { id: 'lab-32', name: 'Gonadotrofina Coriónica Subunidad Beta (HCG-beta) cuantitativa', category: 'Laboratorio', price: 2990 },
    { id: 'lab-33', name: 'Microalbuminuria', category: 'Laboratorio', price: 2990 },
    { id: 'lab-34', name: 'Orina Completa', category: 'Laboratorio', price: 1990 },
    { id: 'lab-35', name: 'Urocultivo', category: 'Laboratorio', price: 2990 },
    { id: 'lab-36', name: 'Cinética de Fierro', category: 'Laboratorio', price: 2990 },
    { id: 'lab-37', name: 'Vitamina B12 (VIT B12)', category: 'Laboratorio', price: 2990 },
    { id: 'lab-38', name: 'Vitamina D (VIT D)', category: 'Laboratorio', price: 3990 },
    { id: 'lab-39', name: 'Ácido Fólico', category: 'Laboratorio', price: 2990 },
    { id: 'lab-40', name: 'Calcio Total', category: 'Laboratorio', price: 1990 },
    { id: 'lab-41', name: 'Fosfato', category: 'Laboratorio', price: 1990 },
    { id: 'lab-42', name: 'Zinc Plasmático', category: 'Laboratorio', price: 1990 },
    { id: 'lab-43', name: 'Test de esfuerzo', category: 'Laboratorio', price: 4990 },
    { id: 'lab-44', name: 'Test de Anfetaminas', category: 'Laboratorio', price: 3990 },
    { id: 'lab-45', name: 'Test de THC', category: 'Laboratorio', price: 3990 },
    { id: 'lab-46', name: 'Test de Cocaína', category: 'Laboratorio', price: 3990 },
    { id: 'lab-47', name: 'Test de Benzodiacepinas', category: 'Laboratorio', price: 3990 },
    { id: 'lab-48', name: 'Espirometría basal', category: 'Laboratorio', price: 3990 },
    { id: 'lab-49', name: 'Hepatitis B, Antígeno de Superficie (HBsAg)', category: 'Laboratorio', price: 2990 },
    { id: 'lab-50', name: 'Nitrógeno Uréico', category: 'Laboratorio', price: 1990 },
    { id: 'lab-51', name: 'Ácido Úrico', category: 'Laboratorio', price: 1990 },
    { id: 'lab-52', name: 'VDRL', category: 'Laboratorio', price: 2990 },
    { id: 'lab-53', name: 'Holter de Ritmo', category: 'Laboratorio', price: 4990 },
    { id: 'lab-54', name: 'Papanicolau (PAP)', category: 'Laboratorio', price: 3990 },
    { id: 'lab-55', name: 'Test de ELISA para VIH', category: 'Laboratorio', price: 2990 },
    { id: 'lab-56', name: 'Test de Elisa para VHC', category: 'Laboratorio', price: 2990 },

    // Imágenes y otros
    { id: 'img-1', name: 'Ecografía Abdominal', category: 'Imágenes y otros', price: 3990 },
    { id: 'img-2', name: 'Ecografía Ginecológica Transvaginal', category: 'Imágenes y otros', price: 4990 },
    { id: 'img-3', name: 'Ecografía mamaria bilateral', category: 'Imágenes y otros', price: 4990 },
    { id: 'img-4', name: 'Mamografía bilateral', category: 'Imágenes y otros', price: 4990 },
    { id: 'img-5', name: 'Densitometría ósea', category: 'Imágenes y otros', price: 4990 },
    { id: 'img-6', name: 'Ecografía de Tiroides', category: 'Imágenes y otros', price: 3990 },
    { id: 'img-7', name: 'Ecografía Renal Preventiva', category: 'Imágenes y otros', price: 3990 },
    { id: 'img-8', name: 'Ecografía Doppler de Carótidas', category: 'Imágenes y otros', price: 4990 },
    { id: 'img-9', name: 'Ecografía Cardíaca Doppler transtorácica', category: 'Imágenes y otros', price: 5990 },
    { id: 'img-10', name: 'Ecografía de Hígado', category: 'Imágenes y otros', price: 3990 }
  ].map((exam) => ({ ...exam, price: DEFAULT_ORDER_PRICE }));

  const categories = useMemo(() => ['Todas', 'Laboratorio', 'Imágenes y otros'], []);

  const filteredExams = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return examOptions.filter((exam) => {
      const matchesSearch = exam.name.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'Todas' || exam.category === selectedCategory;
      const matchesSelected = !showOnlySelected || selectedExams.some((item) => item.id === exam.id);
      return matchesSearch && matchesCategory && matchesSelected;
    });
  }, [examOptions, searchTerm, selectedCategory, showOnlySelected, selectedExams]);

  const PAGE_SIZE = compactView ? 20 : 12;
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const paginatedExams = filteredExams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, showOnlySelected, compactView]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleToggleExam = (exam) => {
    if (selectedExams.find((e) => e.id === exam.id)) {
      setSelectedExams(selectedExams.filter((e) => e.id !== exam.id));
    } else {
      setSelectedExams([...selectedExams, exam]);
    }
  };

  const handleAddSelectedToCart = () => {
    if (selectedExams.length === 0) {
      setMessage({ type: 'error', text: 'Por favor selecciona al menos un examen' });
      return;
    }

    let addedCount = 0;
    selectedExams.forEach((exam) => {
      if (!isInCart(exam.id)) {
        addToCart({ ...exam, pricingType: 'custom_exam' });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setMessage({
        type: 'success',
        text: `${addedCount} examen${addedCount > 1 ? 'es' : ''} agregado${addedCount > 1 ? 's' : ''} al carrito`
      });
      setSelectedExams([]);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: 'Los exámenes seleccionados ya están en el carrito' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const goToCart = () => {
    navigate('/cart');
  };

  const cartItemCount = getCartItemCount();
  const selectedIds = new Set(selectedExams.map((exam) => exam.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white p-8 md:p-10 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.2em] text-xs text-blue-200 mb-3">Orden Mujer</p>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">Selecciona tus exámenes en minutos</h1>
              <p className="text-slate-200 max-w-2xl">Diseño optimizado para ver más opciones en menos espacio: filtra, selecciona y agrega al carrito sin navegar una lista interminable.</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-wide text-blue-200">Selección actual</p>
              <p className="text-3xl font-bold mt-1">{selectedExams.length}</p>
              <p className="text-xs text-slate-300">{selectedExams.length === 1 ? 'examen marcado' : 'exámenes marcados'}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 md:p-5">
              <div className="relative mb-4">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar examen por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {categories.map((category) => {
                  const Icon = category === 'Laboratorio' ? FaVial : category === 'Imágenes y otros' ? FaImage : FaLayerGroup;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition flex items-center gap-2 ${
                        selectedCategory === category
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <Icon className="text-xs" />
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnlySelected((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-md border text-sm font-medium ${
                    showOnlySelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                  }`}
                >
                  {showOnlySelected ? 'Viendo solo seleccionados' : 'Mostrar solo seleccionados'}
                </button>
                <button
                  type="button"
                  onClick={() => setCompactView((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-md border text-sm font-medium ${
                    compactView
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
                  }`}
                >
                  {compactView ? 'Vista compacta' : 'Vista amplia'}
                </button>
              </div>
            </div>

            {message.text && (
              <div className={`px-6 py-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                  Mostrando {paginatedExams.length} de {filteredExams.length} exámenes
                </p>
                <p className="text-sm font-medium text-slate-700">
                  Página {page} de {totalPages}
                </p>
              </div>

              {filteredExams.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No encontramos exámenes con esos filtros.
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${compactView ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5' : 'md:grid-cols-2 lg:grid-cols-3 gap-3.5'}`}>
                  {paginatedExams.map((exam) => {
                    const isSelected = selectedIds.has(exam.id);
                    const accentClass = exam.category === 'Laboratorio'
                      ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-700';

                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => handleToggleExam(exam)}
                        className={`text-left rounded-xl border p-3 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className={`font-medium ${compactView ? 'text-sm leading-5' : 'text-base'} text-slate-900`}>{exam.name}</p>
                          <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-transparent'
                          }`}>
                            <FaCheck className="text-[10px]" />
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-full border ${accentClass}`}>
                            {exam.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredExams.length > PAGE_SIZE && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Resumen de orden</h2>
              <p className="text-sm text-slate-600 mb-4">
                {selectedExams.length} {selectedExams.length === 1 ? 'examen seleccionado' : 'exámenes seleccionados'}
              </p>

              {selectedExams.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  Marca exámenes para verlos aquí y agregarlos al carrito.
                </div>
              ) : (
                <>
                  <div className="max-h-72 overflow-y-auto space-y-2 mb-4 pr-1">
                    {selectedExams.map((exam) => (
                      <div key={exam.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-slate-50">
                        {exam.name}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddSelectedToCart}
                    disabled={selectedExams.length === 0}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaPlus />
                    <span>Agregar al Carrito ({selectedExams.length})</span>
                  </button>
                </>
              )}

              {cartItemCount > 0 && (
                <button
                  onClick={goToCart}
                  className="w-full mt-3 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  <span>Ver Carrito ({cartItemCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <SaludSimpleFooter />
    </div>
  );
}

export default OrdenMujer;
