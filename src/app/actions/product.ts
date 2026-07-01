// app/actions/product.ts
'use server'

import cloudinary from '@/lib/cloudinary'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Accept both FormData and JSON object
export async function createProduct(input: FormData | any) {
  try {
    let name: string
    let desc: string | null
    let category: string
    let price: number
    let offerPrice: number | null
    let isAvailable: boolean
    let images: string[] = []

    // Check if input is FormData or plain object
    if (input instanceof FormData) {
      // Handle FormData
      name = input.get('name') as string
      desc = (input.get('desc') as string) || null
      category = input.get('category') as string
      price = parseFloat(input.get('price') as string)
      offerPrice = input.get('offerPrice')
        ? parseFloat(input.get('offerPrice') as string)
        : null
      isAvailable = input.get('isAvailable') === 'true'

      // Handle images from FormData
      const imageFiles = input.getAll('images') as File[]
      for (const file of imageFiles) {
        if (file instanceof File && file.size > 0) {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: 'products' }, (error, result) => {
                if (error) reject(error)
                else resolve(result)
              })
              .end(buffer)
          })

          images.push((result as any).secure_url)
        }
      }

      // Check for existing images (already uploaded)
      const existingImages = input.get('existingImages')
      if (existingImages) {
        const parsedImages = JSON.parse(existingImages as string)
        images.push(...parsedImages)
      }
    } else {
      // Handle JSON object
      name = input.name
      desc = input.desc || null
      category = input.category
      price = input.price
      offerPrice = input.offerPrice || null
      isAvailable = input.isAvailable
      images = input.images || []
    }

    // Validate required fields
    if (!name || !category || !price) {
      return { success: false, error: 'Missing required fields' }
    }

    // Save to database
    const product = await db.product.create({
      data: {
        name,
        desc,
        category,
        price,
        offerPrice,
        isAvailable,
        images,
      },
    })

    revalidatePath('/products')
    return { success: true, product }
  } catch (error) {
    console.error('Product creation error:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    // First, get the product to access images
    const product = await db.product.findUnique({
      where: { id },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Delete the product from database
    await db.product.delete({
      where: { id },
    })

    // Optional: Delete images from Cloudinary
    // You can implement this as a background job
    if (product.images && Array.isArray(product.images)) {
      // Schedule Cloudinary deletion if needed
      // deleteImagesFromCloudinary(product.images);
    }

    revalidatePath('/products')
    revalidatePath('/admin/products')

    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}
