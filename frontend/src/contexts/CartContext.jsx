import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      }
      
      return {
        ...state,
        items: [...state.items, action.payload]
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      }

    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartItems })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (product, quantity = 1, selectedSize) => {
    // Get stock for the selected size
    const stockForSize = typeof product.stock === 'object' 
      ? product.stock[selectedSize] || 0 
      : product.stock || 0

    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      selectedSize,
      stock: stockForSize
    }

    const existingQty = state.items
      .filter((item) => item.id === product._id && item.selectedSize === selectedSize)
      .reduce((sum, item) => sum + item.quantity, 0)
    if (stockForSize < existingQty + quantity) {
      toast.error('Not enough stock available', {
        duration: 2000
      })
      return
    }

    dispatch({ type: 'ADD_TO_CART', payload: cartItem })
    console.log('Toast showing:', `${product.name} added to cart`)
    
    // Show toast with explicit 2 second duration and auto dismiss
    toast.success(`${product.name} added to cart`, {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
      // Add auto dismiss after 2 seconds
      onClose: () => {
        console.log('Toast dismissed after 2 seconds')
      }
    })
  }

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId })
    toast.success('Item removed from cart')
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const item = state.items.find(item => item.id === productId)
    if (item && quantity > item.stock) {
      toast.error('Not enough stock available')
      return
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Cart cleared')
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
