'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-toastify'
import categories from '@/lib/Categories'
import { updateProduct } from '@/app/actions/prod'

interface EditProductPageProps {
  product: {
    id: string
    name: string
    desc: string | null
    category: string
    price: number
    offerPrice: number | null
    isAvailable: boolean
    images: string[]
  }
}

export default function EditProductPage({ product }: EditProductPageProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(product.images || [])
  const [submitting, setSubmitting] = useState(false)
  const [deletedImages, setDeletedImages] = useState<string[]>([])

  type FormValues = {
    name: string
    desc: string
    category: string
    price: string
    offerPrice: string
    isAvailable: boolean
    images: string[]
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      name: product.name,
      desc: product.desc || '',
      category: product.category,
      price: product.price.toString(),
      offerPrice: product.offerPrice?.toString() || '',
      isAvailable: product.isAvailable,
      images: product.images || [],
    },
  })

  const isAvailable = watch('isAvailable')

  // Reset form when product changes
  useEffect(() => {
    reset({
      name: product.name,
      desc: product.desc || '',
      category: product.category,
      price: product.price.toString(),
      offerPrice: product.offerPrice?.toString() || '',
      isAvailable: product.isAvailable,
      images: product.images || [],
    })
    setImageUrls(product.images || [])
  }, [product, reset])

  const handleImageUpload = async (e: any) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file as Blob | string)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        })

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImageUrls = [...imageUrls, ...uploadedUrls]
      setImageUrls(newImageUrls as any)
      setValue('images', newImageUrls)
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = imageUrls[indexToRemove]

    if (!imageToRemove) return

    // Track deleted images for server-side cleanup
    setDeletedImages((prev) => [...prev, imageToRemove])

    const getPublicIdFromUrl = (url: string) => {
      const parts = url.split('/upload/')
      if (parts.length < 2) return null

      const pathParts = parts[1].split('/')
      // Remove version prefix (v1234567890) if present
      const versionIndex = pathParts.findIndex((part) => part.startsWith('v'))
      const startIndex = versionIndex !== -1 ? versionIndex + 1 : 0

      // Get the remaining path without file extension
      const publicIdWithExtension = pathParts.slice(startIndex).join('/')
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '') // Remove extension

      return publicId
    }

    const publicId = getPublicIdFromUrl(imageToRemove)

    if (publicId) {
      try {
        const response = await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicId }),
        })

        const result = await response.json()
        if (result.data?.success || result.success) {
          const newImageUrls = imageUrls.filter(
            (_, index) => index !== indexToRemove,
          )
          setImageUrls(newImageUrls)
          setValue('images', newImageUrls)
          toast.success('Image deleted successfully')
        } else {
          console.error('Failed to delete from Cloudinary')
          // Still remove from UI even if Cloudinary delete fails
          const newImageUrls = imageUrls.filter(
            (_, index) => index !== indexToRemove,
          )
          setImageUrls(newImageUrls)
          setValue('images', newImageUrls)
          toast.warning('Image removed from form but may still exist on server')
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        // Still remove from UI even if API fails
        const newImageUrls = imageUrls.filter(
          (_, index) => index !== indexToRemove,
        )
        setImageUrls(newImageUrls)
        setValue('images', newImageUrls)
        toast.warning('Image removed from form but may still exist on server')
      }
    } else {
      // If not a Cloudinary URL or can't extract public ID, just remove locally
      const newImageUrls = imageUrls.filter(
        (_, index) => index !== indexToRemove,
      )
      setImageUrls(newImageUrls)
      setValue('images', newImageUrls)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)

    try {
      const productData = {
        id: product.id,
        name: data.name,
        desc: data.desc || null,
        category: data.category,
        price: parseFloat(data.price),
        offerPrice: data.offerPrice ? parseFloat(data.offerPrice) : null,
        isAvailable: data.isAvailable,
        images: imageUrls,
        deletedImages: deletedImages, // Send deleted images for cleanup
      }

      const res = await updateProduct(productData)
      if (!res.success) {
        throw new Error(res.error || 'Product update failed')
      }
      toast.success('Product updated successfully!')
      router.refresh()
      router.push('/admin/dashboard/[id]/products')
    } catch (error) {
      console.error('Product update failed:', error)
      toast.error('Failed to update product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const cats = categories

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <div className='px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700'>
            <h1 className='text-2xl font-bold text-white'>Edit Product</h1>
            <p className='text-blue-100 mt-1'>Update product information</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-6'>
            {/* Product Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Product Name *
              </label>
              <input
                type='text'
                {...register('name', { required: 'Product name is required' })}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter product name'
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <textarea
                {...register('desc')}
                rows={4}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter product description'
              />
            </div>

            {/* Category */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select a category</option>
                {cats.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Price and Offer Price */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Price (Ksh.) *
                </label>
                <input
                  type='number'
                  step='0.01'
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' },
                  })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='0.00'
                />
                {errors.price && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Offer Price (Ksh.)
                </label>
                <input
                  type='number'
                  step='0.01'
                  {...register('offerPrice', {
                    min: { value: 0, message: 'Offer price must be positive' },
                  })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='0.00'
                />
                {errors.offerPrice && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.offerPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
              <div>
                <h3 className='text-sm font-medium text-gray-700'>
                  Product Availability
                </h3>
                <p className='text-xs text-gray-500'>
                  Toggle to control if product is visible to customers
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  {...register('isAvailable')}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className='ml-3 text-sm font-medium text-gray-900'>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Product Images
              </label>

              {/* Image Preview Grid */}
              {imageUrls.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                  {imageUrls.map((url, index) => (
                    <div key={index} className='relative group'>
                      <div className='aspect-square relative rounded-lg overflow-hidden border border-gray-200'>
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className='object-cover'
                        />
                      </div>
                      <button
                        type='button'
                        onClick={() => removeImage(index)}
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg'>
                <div className='space-y-1 text-center'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
                    stroke='currentColor'
                    fill='none'
                    viewBox='0 0 48 48'
                  >
                    <path
                      d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <div className='flex text-sm text-gray-600'>
                    <label
                      htmlFor='file-upload'
                      className='relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500'
                    >
                      <span>Upload new images</span>
                      <input
                        id='file-upload'
                        type='file'
                        multiple
                        accept='image/*'
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className='sr-only'
                      />
                    </label>
                    <p className='pl-1'>or drag and drop</p>
                  </div>
                  <p className='text-xs text-gray-500'>
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>

              {uploading && (
                <div className='mt-4 flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                  <span className='ml-2 text-sm text-gray-600'>
                    Uploading images...
                  </span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className='flex gap-4 pt-4'>
              <button
                type='button'
                onClick={() => router.back()}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={submitting || uploading}
                className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {submitting ? (
                  <span className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    Updating...
                  </span>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
