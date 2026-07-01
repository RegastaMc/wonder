'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ============================================================
// TYPES
// ============================================================
interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  subCategories?: SubCategory[];
  productCount?: number;
}

interface CategoryCarouselProps {
  categories: Category[];
  autoSlideInterval?: number;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
    largeDesktop: number;
  };
  onCategoryClick?: (category: Category) => void;
  onSubCategoryClick?: (category: Category, subCategory: SubCategory) => void;
}

// ============================================================
// ICON COMPONENTS
// ============================================================
const Icons = {
  ChevronLeft: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

// ============================================================
// CATEGORY CAROUSEL COMPONENT
// ============================================================
const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  autoSlideInterval = 2000,
  itemsPerView = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    largeDesktop: 6,
  },
  onCategoryClick,
  onSubCategoryClick,
}) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState(itemsPerView.desktop);
  const [showSubCategory, setShowSubCategory] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create infinite loop by duplicating items
  const getInfiniteCategories = useCallback(() => {
    if (categories.length === 0) return [];
    // Duplicate categories to create infinite loop effect
    return [...categories, ...categories, ...categories];
  }, [categories]);

  const infiniteCategories = getInfiniteCategories();
  const totalItems = infiniteCategories.length;
  const realTotal = categories.length;

  // Get visible items based on screen size
  const getVisibleItems = useCallback(() => {
    if (typeof window === 'undefined') return itemsPerView.desktop;
    const width = window.innerWidth;
    if (width < 640) return itemsPerView.mobile;
    if (width < 768) return itemsPerView.tablet;
    if (width < 1024) return itemsPerView.desktop;
    return itemsPerView.largeDesktop;
  }, [itemsPerView]);

  // Update visible items on resize
  useEffect(() => {
    const handleResize = () => {
      const newVisibleItems = getVisibleItems();
      setVisibleItems(newVisibleItems);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleItems]);

  // Handle infinite scroll - reset position when reaching the end
  const handleInfiniteScroll = useCallback((newIndex: number) => {
    const maxIndex = totalItems - visibleItems;
    const middleIndex = Math.floor(totalItems / 3);
    
    // If we've reached the end of the duplicated array, jump back to the middle
    if (newIndex >= maxIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(middleIndex);
        setIsTransitioning(false);
      }, 50);
      return middleIndex;
    }
    
    // If we've reached the beginning, jump to the middle
    if (newIndex < 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(middleIndex);
        setIsTransitioning(false);
      }, 50);
      return middleIndex;
    }
    
    return newIndex;
  }, [totalItems, visibleItems]);

  // Auto-slide functionality with infinite loop
  useEffect(() => {
    if (isPaused || categories.length <= visibleItems || isTransitioning) {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
      return;
    }

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        return handleInfiniteScroll(nextIndex);
      });
    }, autoSlideInterval);

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [isPaused, categories.length, visibleItems, autoSlideInterval, isTransitioning, handleInfiniteScroll]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(handleInfiniteScroll(nextIndex));
      } else {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(handleInfiniteScroll(prevIndex));
      }
    }
    setTouchStartX(null);
    setIsPaused(false);
  };

  // Navigation handlers
  const goToPrevious = () => {
    const prevIndex = currentIndex - 1;
    setCurrentIndex(handleInfiniteScroll(prevIndex));
  };

  const goToNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(handleInfiniteScroll(nextIndex));
  };

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    onCategoryClick?.(category);
    router.push(`/product-category/${category.slug}`);
  };

  // Handle subcategory click
  const handleSubCategoryClick = (category: Category, subCategory: SubCategory) => {
    onSubCategoryClick?.(category, subCategory);
    router.push(`/product-category/${category.slug}/${subCategory.slug}`);
  };

  // Calculate if navigation buttons should be shown
  const showNavigation = categories.length > visibleItems;

  // Get current visible categories
//   const getVisibleCategories = () => {
//     const start = currentIndex;
//     const end = start + visibleItems;
//     return infiniteCategories.slice(start, end);
//   };

  //   const visibleCategories = getVisibleCategories();

  // If no categories, show empty state
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#3d2c28]/60">No categories available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#3d2c28]">Popular Categories</h2>
          {/* <p className="text-sm text-[#3d2c28]/60 mt-1">Explore our curated collections</p> */}
        </div>
        {showNavigation && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full border border-[#F5EBEO] hover:border-[#DBA39A] hover:bg-[#F5EBEO] text-[#3d2c28] transition-all"
              aria-label="Previous categories"
            >
              <Icons.ChevronLeft />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full border border-[#F5EBEO] hover:border-[#DBA39A] hover:bg-[#F5EBEO] text-[#3d2c28] transition-all"
              aria-label="Next categories"
            >
              <Icons.ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex transition-transform duration-500 ease-in-out ${
            isTransitioning ? 'transition-none' : ''
          }`}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {infiniteCategories.map((category, index) => (
            <div
              key={`${category.id}-${index}`}
              className="flex-shrink-0 px-1"
              style={{ width: `${100 / 8}%` }}
            >
              <CategoryCard
                category={category}
                onCategoryClick={handleCategoryClick}
                onSubCategoryClick={handleSubCategoryClick}
                showSubCategory={showSubCategory === category.id}
                onToggleSubCategory={() => setShowSubCategory(
                  showSubCategory === category.id ? null : category.id
                )}
              />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {/* {showNavigation && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F5EBEO] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#DBA39A] rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentIndex % categories.length) / categories.length) * 100}%` 
              }}
            />
          </div>
        )} */}
      </div>

      {/* Dot Indicators */}
      {/* {showNavigation && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: categories.length }).map((_, index) => {
            const isActive = (currentIndex % categories.length) === index;
            return (
              <button
                key={index}
                onClick={() => {
                  const middleIndex = Math.floor(infiniteCategories.length / 3);
                  const targetIndex = middleIndex + index;
                  setCurrentIndex(handleInfiniteScroll(targetIndex));
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-8 bg-[#DBA39A] shadow-md'
                    : 'w-2.5 bg-[#DBA39A]/30 hover:bg-[#DBA39A]/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )} */}
    </div>
  );
};


interface CategoryCardProps {
  category: Category;
  onCategoryClick: (category: Category) => void;
  onSubCategoryClick: (category: Category, subCategory: SubCategory) => void;
  showSubCategory: boolean;
  onToggleSubCategory: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onCategoryClick,
  onSubCategoryClick,
  showSubCategory,
  onToggleSubCategory,
}) => {
  const hasSubCategories = category.subCategories && category.subCategories.length > 0;

  return (
    <div className="flex flex-col items-center ">
      {/* Category Image - Fully Rounded */}
      <button
        onClick={() => onCategoryClick(category)}
        className="group relative w-full aspect-square max-w-[200px] mx-auto"
        aria-label={`Browse ${category.name}`}
      >
        <div className="w-full h-full rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border-4 border-white">
          <Image
            src={category.image}
            alt={category.name}
            className="w-full h-full cursor-pointer object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&size=200&background=DBA39A&color=ffffff&bold=true`;
            }}
            height={200}
            width={200}
          />
        </div>
        
        {/* Decorative ring on hover */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-[#DBA39A]/30 transition-all duration-300 pointer-events-none" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Product count badge
        {category.productCount !== undefined && category.productCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#DBA39A] text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center shadow-md">
            {category.productCount}
          </span>
        )} */}
      </button>

      {/* Category Name */}
      <div className="text-center mt-3">
        <button
          onClick={() => onCategoryClick(category)}
          className="font-semibold text-[#3d2c28] text-sm cursor-pointer sm:text-base hover:text-[#DBA39A] transition-colors"
        >
          {category.name}
        </button>
        {/* {category.description && (
          <p className="text-xs text-[#3d2c28]/60 mt-0.5 truncate max-w-[120px] mx-auto">
            {category.description}
          </p>
        )} */}
      </div>

      {/* Subcategories */}
      {/* {hasSubCategories && (
        <div className="mt-2 w-full">
          <button
            onClick={onToggleSubCategory}
            className="text-xs text-[#DBA39A] hover:underline flex items-center gap-1 mx-auto"
          >
            {showSubCategory ? 'Hide subcategories' : `Show ${category.subCategories?.length} subcategories`}
            <svg
              className={`w-3 h-3 transition-transform ${showSubCategory ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showSubCategory && category.subCategories && (
            <div className="mt-2 p-2 bg-[#F5EBEO]/50 rounded-xl space-y-1">
              {category.subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onSubCategoryClick(category, sub)}
                  className="w-full text-left px-3 py-1.5 text-sm text-[#3d2c28] hover:bg-[#F0DBDB] rounded-lg transition-colors"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};


const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Women',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
    description: 'Elegant & stylish',
    productCount: 156,
    subCategories: [
      { id: '1a', name: 'Dresses', slug: 'dresses' },
      { id: '1b', name: 'Tops', slug: 'tops' },
      { id: '1c', name: 'Pants', slug: 'pants' },
      { id: '1d', name: 'Accessories', slug: 'accessories' },
    ],
  },
  {
    id: '2',
    name: 'Men',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=400&fit=crop',
    description: 'Modern & classic',
    productCount: 98,
    subCategories: [
      { id: '2a', name: 'Shirts', slug: 'shirts' },
      { id: '2b', name: 'Pants', slug: 'pants' },
      { id: '2c', name: 'Blazers', slug: 'blazers' },
    ],
  },
  {
    id: '3',
    name: 'Kids',
    slug: 'kids',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=400&fit=crop',
    description: 'Fun & colorful',
    productCount: 67,
    subCategories: [
      { id: '3a', name: 'Girls', slug: 'girls' },
      { id: '3b', name: 'Boys', slug: 'boys' },
      { id: '3c', name: 'Babies', slug: 'babies' },
    ],
  },
  {
    id: '4',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    description: 'Complete your look',
    productCount: 134,
    subCategories: [
      { id: '4a', name: 'Bags', slug: 'bags' },
      { id: '4b', name: 'Watches', slug: 'watches' },
      { id: '4c', name: 'Jewelry', slug: 'jewelry' },
      { id: '4d', name: 'Belts', slug: 'belts' },
    ],
  },
  {
    id: '5',
    name: 'Shoes',
    slug: 'shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    description: 'Step in style',
    productCount: 89,
    subCategories: [
      { id: '5a', name: 'Sneakers', slug: 'sneakers' },
      { id: '5b', name: 'Boots', slug: 'boots' },
      { id: '5c', name: 'Sandals', slug: 'sandals' },
    ],
  },
  {
    id: '6',
    name: 'Beauty',
    slug: 'beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    description: 'Glow & shine',
    productCount: 112,
    subCategories: [
      { id: '6a', name: 'Skincare', slug: 'skincare' },
      { id: '6b', name: 'Makeup', slug: 'makeup' },
      { id: '6c', name: 'Fragrance', slug: 'fragrance' },
    ],
  },
  {
    id: '7',
    name: 'Home & Living',
    slug: 'home-living',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop',
    description: 'Cozy & modern',
    productCount: 78,
    subCategories: [
      { id: '7a', name: 'Decor', slug: 'decor' },
      { id: '7b', name: 'Furniture', slug: 'furniture' },
      { id: '7c', name: 'Kitchen', slug: 'kitchen' },
    ],
  },
  {
    id: '8',
    name: 'Sports',
    slug: 'sports',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=400&fit=crop',
    description: 'Active lifestyle',
    productCount: 94,
    subCategories: [
      { id: '8a', name: 'Fitness', slug: 'fitness' },
      { id: '8b', name: 'Outdoor', slug: 'outdoor' },
      { id: '8c', name: 'Yoga', slug: 'yoga' },
    ],
  },
  {
    id: '9',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
    description: 'Tech & gadgets',
    productCount: 56,
    subCategories: [
      { id: '9a', name: 'Phones', slug: 'phones' },
      { id: '9b', name: 'Laptops', slug: 'laptops' },
      { id: '9c', name: 'Audio', slug: 'audio' },
    ],
  },
];

// ============================================================
// USAGE EXAMPLE
// ============================================================
const CategoriesSection: React.FC = () => {
  const handleCategoryClick = (category: Category) => {
    console.log('Category clicked:', category.name);
    // Navigate to category page: /category/[slug]
  };

  const handleSubCategoryClick = (category: Category, subCategory: SubCategory) => {
    console.log('Subcategory clicked:', subCategory.name, 'in', category.name);
    // Navigate to subcategory page: /category/[slug]/[subSlug]
  };

  return (
    <div className="max-w-7xl py-12">
      <CategoryCarousel
        categories={mockCategories}
        autoSlideInterval={2000}
        itemsPerView={{
          mobile: 2,
          tablet: 3,
          desktop: 4,
          largeDesktop: 6,
        }}
        onCategoryClick={handleCategoryClick}
        onSubCategoryClick={handleSubCategoryClick}
      />
    </div>
  );
};

export default CategoriesSection;
export { CategoryCarousel, CategoryCard, mockCategories };