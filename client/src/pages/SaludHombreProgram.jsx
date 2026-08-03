import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaFlask,
  FaLayerGroup,
  FaListUl,
  FaStethoscope
} from 'react-icons/fa';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { useCart } from '../context/CartContext';
import { getProgramContent, getProgramPacks } from '../data/programPacks';

function SaludHombreProgram() {
  const [expandedPackId, setExpandedPackId] = useState(null);
  const [packSearch, setPackSearch] = useState('');
  const [selectedPackCategory, setSelectedPackCategory] = useState('Todas');
  const [message, setMessage] = useState({ type: '', text: '' });
  const content = useMemo(() => getProgramContent('hombre'), []);
  const { addToCart, isInCart } = useCart();

  const packs = useMemo(() => {
    return getProgramPacks('hombre');
  }, []);

  const totalExams = useMemo(() => {
    return packs.reduce((acc, pack) => acc + pack.examenes.length, 0);
  }, [packs]);

  const packCategories = useMemo(() => {
    const categories = Array.from(new Set(packs.map((pack) => pack.categoryName)));
    return ['Todas', ...categories];
  }, [packs]);

  const filteredPacks = useMemo(() => {
    const search = packSearch.trim().toLowerCase();

    return packs.filter((pack) => {
      const matchesCategory = selectedPackCategory === 'Todas' || pack.categoryName === selectedPackCategory;
      const examNames = pack.examenes.map((exam) => exam.nombre).join(' ').toLowerCase();
      const matchesSearch =
        !search ||
        pack.nombre.toLowerCase().includes(search) ||
        pack.objetivo.toLowerCase().includes(search) ||
        examNames.includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [packs, packSearch, selectedPackCategory]);

  const handleTogglePackDetails = (packId) => {
    setExpandedPackId((prev) => (prev === packId ? null : packId));
  };

  const summarizeExamDescription = (text) => {
    const value = String(text || '').trim();
    if (!value) {
      return '';
    }

    if (value.length <= 88) {
      return value;
    }

    return `${value.slice(0, 85).trimEnd()}...`;
  };

  const handleAddPackToCart = (pack) => {
    const cartItemId = `program-pack-hombre-${pack.id}`;

    if (isInCart(cartItemId)) {
      setMessage({ type: 'info', text: `${pack.nombre} ya está en tu carrito.` });
      return;
    }

    const examNames = (pack.examenes || [])
      .map((exam) => (typeof exam === 'string' ? exam : exam?.nombre))
      .filter(Boolean);

    addToCart({
      id: cartItemId,
      name: pack.nombre,
      category: 'Pack Salud Hombre',
      pricingType: 'pack',
      price: 5990,
      exams: examNames,
      packSlug: pack.id
    });

    setMessage({ type: 'success', text: `${pack.nombre} fue agregado al carrito.` });
  };

  useEffect(() => {
    if (filteredPacks.length === 0) {
      setExpandedPackId(null);
      return;
    }

    // Allow all packs to stay collapsed after user clicks "Ocultar".
    if (expandedPackId === null) {
      return;
    }

    const existsInFilter = filteredPacks.some((pack) => pack.id === expandedPackId);
    if (!existsInFilter) {
      setExpandedPackId(filteredPacks[0].id);
    }
  }, [filteredPacks, expandedPackId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-4 py-10 md:py-14">
        <section className="max-w-6xl mx-auto rounded-3xl p-8 md:p-10 text-white shadow-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] bg-white/10 border border-white/20 px-3 py-1 rounded-full mb-5">
            {content.badge}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{content.title}</h1>
          <p className="text-white/90 text-base md:text-xl max-w-3xl">
            {content.subtitle}
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <span className="inline-flex items-center text-sm font-medium rounded-full border border-white/25 bg-white/10 px-4 py-2">
              <FaLayerGroup className="mr-2" />
              {packs.length} packs disponibles
            </span>
            <span className="inline-flex items-center text-sm font-medium rounded-full border border-white/25 bg-white/10 px-4 py-2">
              <FaFlask className="mr-2" />
              {totalExams} exámenes en total
            </span>
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
            <FaStethoscope className="text-blue-700" />
            {content.aboutTitle}
          </h2>
          <p className="text-slate-700 leading-relaxed">
            {content.aboutText}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/personaliza-tu-orden"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black transition"
            >
              <FaListUl className="text-sm" />
              {content.customizeCta}
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-8 space-y-4">
            {message.text && (
              <div className={`rounded-2xl border p-4 text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <span className="inline-flex items-center gap-2">
                  <FaCheckCircle />
                  {message.text}
                </span>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
              <div className="grid md:grid-cols-[1fr_auto] gap-3">
                <input
                  type="text"
                  value={packSearch}
                  onChange={(e) => setPackSearch(e.target.value)}
                  placeholder="Buscar por pack, objetivo o examen"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <select
                  value={selectedPackCategory}
                  onChange={(e) => setSelectedPackCategory(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {packCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-slate-600 mt-3">
                {filteredPacks.length} {filteredPacks.length === 1 ? 'pack encontrado' : 'packs encontrados'}
              </p>
            </div>

            {filteredPacks.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                <p className="text-slate-700 font-semibold">No encontramos packs con esos filtros</p>
                <p className="text-sm text-slate-500 mt-1">Prueba con otra categoría o un término de búsqueda distinto.</p>
              </div>
            )}

            {filteredPacks.map((pack) => {
              const isExpanded = expandedPackId === pack.id;

              return (
                <article key={pack.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 md:p-6 border-b border-slate-100">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-blue-700 font-semibold mb-2">{pack.categoryName}</p>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900">{pack.nombre}</h3>
                        <p className="text-sm text-slate-600 mt-1">{pack.objetivo}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                          <p className="text-slate-500">Duración</p>
                          <p className="font-semibold text-slate-900">{pack.duracionEstimada}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                          <p className="text-slate-500">Exámenes</p>
                          <p className="font-semibold text-slate-900">{pack.examenes.length}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mt-4">
                      <span className="font-semibold text-slate-800">Preparación:</span> {pack.preparacion}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddPackToCart(pack)}
                        disabled={isInCart(`program-pack-hombre-${pack.id}`)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          isInCart(`program-pack-hombre-${pack.id}`)
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-black'
                        }`}
                      >
                        {isInCart(`program-pack-hombre-${pack.id}`) ? 'En el carrito' : 'Agregar pack al carrito'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePackDetails(pack.id)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                      >
                        {isExpanded ? 'Ocultar exámenes del pack' : `Ver exámenes del pack (${pack.examenes.length})`}
                        {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 md:p-5 bg-slate-50/60 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pack.examenes.map((exam) => (
                          <article key={exam.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-semibold text-sm text-slate-900 leading-tight">{exam.nombre}</p>
                              <span className="inline-flex items-center justify-center text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 border border-slate-300 text-slate-600 bg-slate-50 whitespace-nowrap">
                                {exam.tipo}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {summarizeExamDescription(exam.paraQueSirve)}
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
        </section>
      </main>

      <SaludSimpleFooter />
    </div>
  );
}

export default SaludHombreProgram;
