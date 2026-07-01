import BannerSection from '@/components/BannerSection'
import CategoriesSection from '@/components/CategoriesSection'
import Testimonials from '@/components/components/Ui/Testimonials'
import ContactForm from '@/components/forms/ContactsForm'
import ProductList from '@/components/ProductList'
import Image from 'next/image'
import { Suspense } from 'react'

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>
}) => {
  const category = (await searchParams).category

  return (
    <div className='container  px-4'>
      <div className='relative w-full rounded-2xl overflow-hidden shadow-sm'>
       <BannerSection />
      </div>

      <CategoriesSection/>

      Product List Section with Suspense for better loading
      <Suspense
        fallback={
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        }
      >
        <ProductList params='homepage' initialCategory={category || null} />
      </Suspense>

      {/* Contact Form Section */}
      {/* <div className='mt-16'>
        <ContactForm />
      </div>
      <div>
        <Testimonials />
      </div> */}
    </div>
  )
}

export default Homepage
