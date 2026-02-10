import React, { useState } from 'react'
import { useLocation } from '../hooks/useLocation'

const ProductCard = ({ product, onAddToCart }) => {
  const { location } = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  
  const price = product.price_pk
  
  const currency = 'Rs.'
  
  const parseColor = (colorString) => {
    if (!colorString) return '#888888'
    if (colorString.startsWith('#')) return colorString
    // you could add more named color support
    return '#888888'
  }
  
  return (
    <div
      className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image / Overlay */}
      <div className="relative overflow-hidden">
        <img
          src={product.productPic || 'https://via.placeholder.com/400'}
          alt={product.name}
          className={`w-full h-56 object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        {/* Dark overlay on hover */}
        <div className={`absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-500`} />
        {/* Out of stock badge */}
        {!product.inStock && (
          <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded border border-gray-600 bg-[#1E1E1E] text-gray-300">
            Out of Stock
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4 flex flex-col justify-between h-44">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 truncate">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-[#FFC72C]">
            {currency}{price?.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              product.inStock
                ? 'text-black'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            style={product.inStock ? { backgroundColor: '#FFC72C' } : undefined}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
        
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-5 h-5 rounded-full border border-gray-700"
                style={{ backgroundColor: parseColor(color) }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-400">+{product.colors.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
