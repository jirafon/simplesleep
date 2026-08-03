import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCookie } from '../utils/cookies';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import { isPackCartItem } from '../utils/billingRules';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { 
  FaShoppingCart, 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaSpinner,
  FaCreditCard,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTags
} from 'react-icons/fa';

function Cart() {
  const navigate = useNavigate();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemCount,
    getCartTaxes,
    getCartTotalWithTaxes,
    getBillingSummary
  } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code, discountType, discountValue, discountAmount, finalTotal }
  const [promoMessage, setPromoMessage] = useState({ type: '', text: '' });

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const token = getCookie('token');
    if (!token) {
      setPromoMessage({ type: 'error', text: 'Debes iniciar sesión para usar un código de descuento' });
      return;
    }

    setPromoLoading(true);
    setPromoMessage({ type: '', text: '' });
    setAppliedDiscount(null);

    try {
      const response = await axios.post(
        getApiUrl('/api/admin/discount-codes/validate'),
        { code, orderTotal: getCartTotalWithTaxes() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppliedDiscount(response.data);
      setPromoMessage({ type: 'success', text: `¡Código aplicado! Ahorras $${response.data.discountAmount.toLocaleString('es-CL')}` });
    } catch (err) {
      setPromoMessage({ type: 'error', text: err.response?.data?.message || 'Código inválido' });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoCode('');
    setPromoMessage({ type: '', text: '' });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 0 && newQuantity <= 5) { // Máximo 5 de cada examen
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart();
      setMessage({ type: 'success', text: 'Carrito vaciado correctamente.' });
    }
  };

  const handleContinueShopping = () => {
    navigate('/personaliza-tu-orden');
  };

  const handleProceedToCheckout = async () => {
    const token = getCookie('token');
    
    if (!token) {
      navigate('/register');
      return;
    }

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Tu carrito está vacío' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const examsForOrder = items.flatMap((item) => {
        const examsInItem = Array.isArray(item.exams) && item.exams.length > 0
          ? item.exams
          : [item.name];

        return examsInItem.flatMap((exam) => Array(item.quantity).fill(exam));
      });

      const cartItemsForOrder = items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        pricingType: isPackCartItem(item) ? 'pack' : 'custom_exam',
        exams: Array.isArray(item.exams) ? item.exams : []
      }));

      const response = await axios.post(
        getApiUrl('/api/orders/create'),
        {
          type: 'custom',
          exams: examsForOrder,
          cartItems: cartItemsForOrder,
          notes: '',
          discountCode: appliedDiscount ? appliedDiscount.code : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const order = response.data.order;
      
      setMessage({ type: 'success', text: 'Orden creada exitosamente. Redirigiendo al checkout...' });
      
      setTimeout(() => {
        navigate(`/checkout/${order._id}`);
      }, 1500);

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al crear la orden'
      });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const taxes = getCartTaxes();
  const total = getCartTotalWithTaxes();
  const itemCount = getCartItemCount();
  const billingSummary = getBillingSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FaShoppingCart className="text-blue-600 text-3xl mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Tu Carrito</h1>
            {itemCount > 0 && (
              <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {itemCount} {itemCount === 1 ? 'examen' : 'exámenes'}
              </span>
            )}
          </div>
          
          <button
            onClick={handleContinueShopping}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Seguir Comprando
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheckCircle className="text-green-600 mr-2" />
              ) : (
                <FaExclamationTriangle className="text-red-600 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <FaShoppingCart className="text-gray-300 text-6xl mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-8">¡Agrega algunos exámenes médicos para comenzar!</p>
              <button
                onClick={handleContinueShopping}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"
              >
                Explorar Exámenes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Exámenes Seleccionados</h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      <FaTrash className="mr-1" />
                      Vaciar Carrito
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          <h3 className="font-medium text-gray-900 mb-2">{item.name}</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {item.category}
                            </span>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${isPackCartItem(item) ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                              {isPackCartItem(item) ? 'Pack' : 'Personalizado'}
                            </span>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">Cantidad:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-50 text-gray-600"
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus className="text-sm" />
                              </button>
                              <span className="px-4 py-2 border-l border-r border-gray-300 font-medium min-w-[50px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-50 text-gray-600"
                                disabled={item.quantity >= 5}
                              >
                                <FaPlus className="text-sm" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            Se cobra por bloques
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center"
                          >
                            <FaTrash className="mr-1" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Packs ({billingSummary.packUnits})</span>
                    <span className="text-gray-900">${billingSummary.packsAmount.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Personalizados ({billingSummary.customExamUnits} exámenes)</span>
                    <span className="text-gray-900">${billingSummary.customAmount.toLocaleString('es-CL')}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-700 font-medium">
                      <span>Descuento ({appliedDiscount.code})</span>
                      <span>- ${appliedDiscount.discountAmount.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  {appliedDiscount && (
                    <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-3">
                      <span className="text-gray-900">Total</span>
                      <span className="text-green-700">${appliedDiscount.finalTotal.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    Packs: $5.990 cada {billingSummary.packsPerBlock} packs. Personalizados: $5.990 cada {billingSummary.customExamsPerBlock} exámenes.
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={loading || items.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center mb-4"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      Proceder al Pago
                    </>
                  )}
                </button>

                {/* Promo Code Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaTags className="mr-2" />
                    ¿Tienes un código de descuento?
                  </div>
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center text-green-700 text-sm font-medium">
                        <FaCheckCircle className="mr-2" />
                        <span className="font-mono">{appliedDiscount.code}</span>
                        <span className="ml-2 text-xs text-green-600">
                          {appliedDiscount.discountType === 'percentage'
                            ? `${appliedDiscount.discountValue}% off`
                            : `$${appliedDiscount.discountValue.toLocaleString('es-CL')} off`}
                        </span>
                      </div>
                      <button onClick={handleRemovePromo} className="text-green-600 hover:text-red-600 text-xs ml-2">
                        ✕ Quitar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                          placeholder="Código promocional"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode.trim()}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center"
                        >
                          {promoLoading ? <FaSpinner className="animate-spin" /> : 'Aplicar'}
                        </button>
                      </div>
                      {promoMessage.text && (
                        <p className={`text-xs mt-2 ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {promoMessage.text}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Security Info */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 text-sm">
                    <FaCheckCircle className="mr-2 flex-shrink-0" />
                    <span>Pago 100% seguro con Flow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <SaludSimpleFooter />
    </div>
  );
}

export default Cart;