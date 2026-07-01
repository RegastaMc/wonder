import { getProductById } from '@/app/actions/getProducts'
import EditProductPage from '@/components/components/Admin/EditproductPage'
import { notFound } from 'next/navigation'

interface EditPageProps {
  params: Promise<{ productid: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { productid } = await params
  const { success, product } = await getProductById(productid)

  if (!success || !product) {
    notFound()
  }

  const fixedProduct = {
    ...product,
    images: Array.isArray(product.images) ? (product.images as string[]) : [],
  }

  return <EditProductPage product={fixedProduct} />
}
