import React, { useState, useEffect } from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

function TestimonialsSlider() {
  const testimonials = [
    {
      id: 1,
      name: 'María González',
      location: 'Rural, Región de Los Lagos',
      text: 'Increíble lo rápido que recibí mi orden de mamografía. Desde mi casa en el campo pude acceder a servicios que antes solo estaban en la ciudad. ¡Gracias Siempresalud!',
      rating: 5,
      service: 'Orden de Mamografía'
    },
    {
      id: 2,
      name: 'Carlos Ramírez',
      location: 'Santiago',
      text: 'Necesitaba una orden para exámenes de laboratorio y la obtuve en minutos. El proceso es muy fácil y la orden está siempre disponible en mi bitácora para cuando la necesite.',
      rating: 5,
      service: 'Orden de Laboratorio'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      location: 'Valparaíso',
      text: 'Como mujer, es un alivio poder obtener mis órdenes de exámenes preventivos de forma rápida y accesible. El PAP y otros exámenes están disponibles cuando los necesito.',
      rating: 5,
      service: 'Orden Preventiva'
    },
    {
      id: 4,
      name: 'Roberto Silva',
      location: 'Rural, Región de La Araucanía',
      text: 'Vivo lejos de la ciudad y obtener mi orden de exámenes de hipertensión sin viajar horas ha sido una bendición. La orden llegó al instante y la pude usar en mi laboratorio local.',
      rating: 5,
      service: 'Orden de Hipertensión'
    },
    {
      id: 5,
      name: 'Laura Fernández',
      location: 'Concepción',
      text: 'La facilidad de uso es impresionante. En minutos tengo mi orden médica para exámenes y puedo ver todo mi historial. La bitácora personal es muy útil para organizar mis órdenes.',
      rating: 5,
      service: 'Órdenes Médicas'
    },
    {
      id: 6,
      name: 'Pedro Muñoz',
      location: 'La Serena',
      text: 'Necesitaba una orden para exámenes de tiroides y la obtuve el mismo día. El proceso fue súper simple y la orden fue aceptada sin problemas en el laboratorio.',
      rating: 5,
      service: 'Orden de Tiroides'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-lg text-slate-600">
            Experiencias reales de personas que usan nuestro servicio
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-slate-50 rounded-3xl shadow-lg border border-slate-200 p-8 md:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-4 left-4 text-slate-200">
              <FaQuoteLeft size={50} />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Rating */}
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-xl" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-lg md:text-xl text-slate-700 mb-6 text-center italic leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Service Badge */}
              <div className="flex justify-center mb-6">
                <span className="bg-blue-100 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {testimonials[currentIndex].service}
                </span>
              </div>

              {/* Author */}
              <div className="text-center">
                <h4 className="font-semibold text-slate-900 text-lg">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-slate-600 text-sm">
                  {testimonials[currentIndex].location}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg border border-slate-200 hover:bg-blue-50 transition"
            aria-label="Testimonio anterior"
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg border border-slate-200 hover:bg-blue-50 transition"
            aria-label="Siguiente testimonio"
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentIndex
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir al testimonio ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSlider;
