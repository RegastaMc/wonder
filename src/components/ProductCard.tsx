'use client'

import useCartStore from '@/stores/cartStore'
import { ProductType } from '@/types'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-toastify'

const ProductCard = ({ product }: { product: any }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCartStore()

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ['/placeholder-image.jpg']

  const hasOffer = product.offerPrice && product.offerPrice < product.price
  const displayPrice = hasOffer ? product.offerPrice! : product.price
  const discountPercentage = hasOffer
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    if (!product.isAvailable) {
      toast.error(`${product.name} is out of stock`)
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      images: images[0],
      selectedSize: product.sizes ? product.sizes[0] : undefined,
      selectedColor: product.colors ? product.colors[0] : undefined,
      shortDescription: product.shortDescription,
      description: product.description,
      colors: product.colors,
      sizes: product.sizes,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div
      className='group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE SECTION */}
      <Link href={`/products/${product.id}`}>
        <div className='relative aspect-square overflow-hidden bg-gray-100'>
          <Image
            src={images[currentImageIndex]}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />

          {/* Image Thumbnails (visible on hover) */}
          {images.length > 1 && isHovered && (
            <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/50 rounded-lg p-1 backdrop-blur-sm'>
              {images.slice(0, 4).map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentImageIndex(idx)
                  }}
                  className={`w-8 h-8 rounded overflow-hidden border-2 transition-all ${
                    currentImageIndex === idx
                      ? 'border-white'
                      : 'border-transparent'
                  }`}
                >
                  <div className='relative w-full h-full'>
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className='object-cover'
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Badges */}
          <div className='absolute top-2 left-2 flex flex-col gap-1'>
            {hasOffer && product.isAvailable && (
              <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg'>
                -{discountPercentage}%
              </span>
            )}
            {!product.isAvailable && (
              <span className='bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg'>
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick View Button (visible on hover)
          {isHovered && product.isAvailable && (
            <div className='absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <span className='bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
                Quick View
              </span>
            </div>
          )} */}
        </div>
      </Link>

      {/* PRODUCT DETAILS */}
      <div className='p-4 space-y-2'>
        {/* Category */}
        <div className='text-xs text-blue-600 font-semibold uppercase tracking-wider'>
          {product.category}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className='font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]'>
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.desc && (
          <p className='text-sm text-gray-500 line-clamp-2'>{product.desc}</p>
        )}

        {/* Price */}
        <div className='flex items-baseline gap-2 pt-1'>
          <span className='text-2xl font-bold text-gray-900'>
            Ksh.{displayPrice.toLocaleString()}
          </span>
          {hasOffer && (
            <span className='text-sm text-gray-400 line-through'>
              Ksh.{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable}
          className={`w-full mt-3 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            product.isAvailable
              ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className='w-4 h-4' />
          {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
