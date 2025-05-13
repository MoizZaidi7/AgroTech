import React from 'react';
import { FaLeaf, FaShoppingCart, FaGavel, FaHeart, FaRegHeart, FaStar, FaRegStar, FaEdit, FaTrash } from 'react-icons/fa';

const ProductCard = ({ product, userRole, onEdit, onDelete, onViewBids, onPlaceBid, onAddToCart, onBuyNow }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="relative">
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <FaLeaf className="text-4xl text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button className="p-2 bg-white rounded-full shadow">
            <FaHeart className="text-red-500" />
          </button>
          {userRole === 'Farmer' && (
            <>
              <button 
                onClick={() => onEdit(product)}
                className="p-2 bg-white rounded-full shadow"
              >
                <FaEdit className="text-blue-500" />
              </button>
              <button 
                onClick={() => onDelete(product._id)}
                className="p-2 bg-white rounded-full shadow"
              >
                <FaTrash className="text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800">{product.name}</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Grade {product.grade}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-green-600 font-bold text-lg">PKR {product.price}</p>
            {product.stock > 0 ? (
              <p className="text-gray-500 text-sm">{product.stock} in stock</p>
            ) : (
              <p className="text-red-500 text-sm">Out of stock</p>
            )}
          </div>
          <div className="flex items-center">
            <FaStar className="text-yellow-400" />
            <span className="ml-1 text-gray-700">4.5</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {product.isBidding && (
            <>
              {userRole === 'Farmer' ? (
                <button
                  onClick={() => onViewBids(product._id)}
                  className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  View Bids
                </button>
              ) : (
                <button
                  onClick={() => onPlaceBid(product)}
                  className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Place Bid
                </button>
              )}
            </>
          )}
          
          {userRole === 'buyer' && product.stock > 0 && (
            <>
              <button
                onClick={() => onAddToCart(product)}
                className="flex-1 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Add to Cart
              </button>
              <button
                onClick={() => onBuyNow(product)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;