import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { normalizeCartItemPrice } from '../utils/examPricing';
import { calculateCartBilling } from '../utils/billingRules';

// Estados del carrito
const CartContext = createContext();

// Acciones del carrito
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer del carrito
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, normalizeCartItemPrice({ ...action.payload, quantity: 1 })]
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
}

// Estado inicial del carrito
const initialState = {
  items: []
};

// Provider del carrito
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persistir carrito en localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('saludsimple_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: Array.isArray(parsedCart) ? parsedCart.map(normalizeCartItemPrice) : []
        });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('saludsimple_cart', JSON.stringify(state.items));
  }, [state.items]);

  // Funciones del carrito
  const addToCart = (exam) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: exam });
  };

  const removeFromCart = (examId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: examId });
  };

  const updateQuantity = (examId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: examId, quantity } });
  };

  const clearCart = () => {
    localStorage.removeItem('saludsimple_cart');
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getCartTotal = () => {
    return calculateCartBilling(state.items).subtotal;
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (examId) => {
    return state.items.some(item => item.id === examId);
  };

  const getCartTaxes = () => {
    return calculateCartBilling(state.items).taxes;
  };

  const getCartTotalWithTaxes = () => {
    return calculateCartBilling(state.items).total;
  };

  const getBillingSummary = () => {
    return calculateCartBilling(state.items);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartTaxes,
    getCartTotalWithTaxes,
    getBillingSummary
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar el carrito
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
}

export default CartContext;