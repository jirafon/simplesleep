import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

function CartIcon() {
  const navigate = useNavigate();
  const { getCartItemCount, getCartTotalWithTaxes } = useCart();
  
  const itemCount = getCartItemCount();
  const total = getCartTotalWithTaxes();

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="relative">
      <button
        onClick={handleCartClick}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
        aria-label="Abrir carrito"
      >
        <FaShoppingCart className="text-lg mr-2" />
        <div className="text-sm">
          <div className="font-semibold">{itemCount}</div>
          <div className="text-xs opacity-90">
            {itemCount > 0 ? `$${total.toLocaleString('es-CL')}` : 'Carrito'}
          </div>
        </div>
      </button>
      
      {/* Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </div>
  );
}

export default CartIcon;