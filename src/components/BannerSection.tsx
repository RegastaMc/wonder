'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BannerSectionProps {
  primaryBanner?: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  };
  secondaryBanner?: {
    title: string;
    description: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  };
}

const BannerSection: React.FC<BannerSectionProps> = ({
  primaryBanner = {
    title: "Celebrating men's mental health month",
    subtitle: 'Up to 50% off',
    description: 'on all toys',
    image: '/Banner_men.jpg',
    buttonText: 'Shop Now',
    buttonLink: '#',
  },
  secondaryBanner = {
    title: 'New Collection',
    description: 'Top Selling Women Vibrators',
    image: '/Banner_women.jpg',
    buttonText: 'Shop Now',
    buttonLink: '#',
  },
}) => {
  return (
    <div className='relative w-full pt-4 md:pt-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Primary Banner - Takes 2/3 */}
        <div className='md:col-span-2 rounded-md overflow-hidden shadow-lg relative group'>
          <div className='relative w-full h-50 sm:h-62.5 md:h-70 lg:h-80'>
            <Image
              src={primaryBanner.image}
              alt={primaryBanner.title}
              fill
              priority
              className='object-cover group-hover:scale-105 transition-transform duration-700'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw'
            />
            <div className='absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent' />
            
            <div className='absolute inset-0 flex items-center'>
              <div className='text-white px-6 md:px-10 max-w-xl'>
                <p className='text-sm md:text-base font-medium text-[#F0DBDB] tracking-wider uppercase mb-2'>
                  {primaryBanner.subtitle}
                </p>
                <h1 className='text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight'>
                  {primaryBanner.title}
                </h1>
                <p className='text-base md:text-lg mb-4 text-white/90'>
                  {primaryBanner.description}
                </p>
                <Link
                  href={primaryBanner.buttonLink}
                  className='inline-block bg-[#DBA39A] hover:bg-[#c49087] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105'
                >
                  {primaryBanner.buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Banner - Takes 1/3 */}
        <div className='md:col-span-1 rounded-md overflow-hidden shadow-lg relative group'>
          <div className='relative w-full h-50 sm:h-62.5 md:h-70 lg:h-80'>
            <Image
              src={secondaryBanner.image}
              alt={secondaryBanner.title}
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-700'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw'
            />
            <div className='absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent' />
            
            <div className='absolute inset-0 flex items-end md:items-center p-6'>
              <div className='text-white w-full'>
                <p className='text-xs md:text-sm font-medium text-[#F0DBDB] tracking-wider uppercase mb-1'>
                  Limited Edition
                </p>
                <h2 className='text-lg md:text-xl lg:text-2xl font-bold mb-1 leading-tight'>
                  {secondaryBanner.title}
                </h2>
                <p className='text-sm md:text-base mb-3 text-white/90'>
                  {secondaryBanner.description}
                </p>
                <Link
                  href={secondaryBanner.buttonLink}
                  className='inline-block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 md:px-6 py-2 rounded-xl font-semibold transition-all border border-white/30 hover:border-white/50'
                >
                  {secondaryBanner.buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className='absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[#F5EBEO]/30 rounded-full blur-3xl' />
    </div>
  );
};

export default BannerSection;