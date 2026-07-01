// app/product-category/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CategoryPageClient } from '@/components/CategoryPageClient';


interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
  subCategories?: SubCategory[];
}

interface Product {
  id: string;
  name: string;
  isAvailable: boolean;
  desc: string | null;
  images: string[];
  category: string;
  price: number;
  offerPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    sort?: string;
    page?: string;
    view?: 'grid' | 'list';
  };
}


const sampleCategories: Category[] = [
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
// SAMPLE PRODUCTS DATA (matching your Prisma model)
// ============================================================
const sampleProducts: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max',
    isAvailable: true,
    desc: 'The latest iPhone with titanium body and A17 Pro chip',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 1199.99,
    offerPrice: 1099.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra',
    isAvailable: true,
    desc: 'Premium Android phone with AI features and S Pen',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 1299.99,
    offerPrice: 1199.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p3',
    name: 'MacBook Pro 16"',
    isAvailable: true,
    desc: 'Professional laptop with M3 Pro chip and 36GB RAM',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 2499.99,
    offerPrice: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p4',
    name: 'Sony WH-1000XM5',
    isAvailable: false,
    desc: 'Industry-leading noise cancelling headphones',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 399.99,
    offerPrice: 349.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p5',
    name: 'iPad Pro 12.9"',
    isAvailable: true,
    desc: 'Powerful tablet with M2 chip and Liquid Retina XDR display',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 1099.99,
    offerPrice: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p6',
    name: 'Apple Watch Ultra 2',
    isAvailable: true,
    desc: 'The most rugged Apple Watch with precision GPS',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 799.99,
    offerPrice: 749.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p7',
    name: 'Bose QuietComfort Earbuds',
    isAvailable: true,
    desc: 'Premium wireless earbuds with noise cancellation',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 299.99,
    offerPrice: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p8',
    name: 'Dell XPS 15',
    isAvailable: false,
    desc: 'High-performance Windows laptop for creators',
    images: ['https://images.unsplash.com/photo-1593642632824-8f380a7ba9b3?w=400&h=400&fit=crop'],
    category: 'Electronics',
    price: 1899.99,
    offerPrice: 1699.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================
// DATA FETCHING FUNCTIONS
// ============================================================
async function getCategoryBySlug(slug: string): Promise<Category | null> {
  // In a real app, this would fetch from your database
  // For now, we'll use the sample data
  const category = sampleCategories.find(c => c.slug === slug);
  return category || null;
}

async function getProductsByCategory(
  categoryName: string,
  options?: {
    sort?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ items: Product[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  // Filter products by category
  const filtered = sampleProducts.filter(p => p.category === categoryName);

  // Sort products
  switch (options?.sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    default:
      // Default sort by newest
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const items = filtered.slice(skip, skip + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

// ============================================================
// METADATA GENERATION
// ============================================================
export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} | Your Store`,
    description: category.description || `Browse our ${category.name} collection`,
    openGraph: {
      title: `${category.name} | Your Store`,
      description: category.description || `Browse our ${category.name} collection`,
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Fetch category data
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  // Get sort and pagination params
  const sort = searchParams?.sort || 'relevance';
  const page = parseInt(searchParams?.page || '1');
  const view = searchParams?.view || 'grid';

  // Fetch products for this category
  const productsData = await getProductsByCategory(category.name, {
    sort,
    page,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-[#FEFCF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto">
          <Link 
            href="/" 
            className="text-[#3d2c28]/60 hover:text-[#DBA39A] transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          <span className="text-[#3d2c28]/30">/</span>
          <Link 
            href="/product-category" 
            className="text-[#3d2c28]/60 hover:text-[#DBA39A] transition-colors whitespace-nowrap"
          >
            Categories
          </Link>
          <span className="text-[#3d2c28]/30">/</span>
          <span className="text-[#DBA39A] font-medium whitespace-nowrap">
            {category.name}
          </span>
        </nav>

        {/* Category Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
          <div className="relative aspect-[3/1] w-full min-h-[200px]">
            <img
              src={category.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&size=1200&background=DBA39A&color=ffffff&bold=true`}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
              <div className="text-white px-6 md:px-12 max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg md:text-xl mb-4 text-white/90">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-white/70">
                  {productsData.total} products available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {category.subCategories && category.subCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-[#3d2c28]/60 mb-3">
              Subcategories
            </h2>
            <div className="flex flex-wrap gap-2">
              {category.subCategories.map((sub: SubCategory) => (
                <Link
                  key={sub.id}
                  href={`/product-category/${category.slug}/${sub.slug}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-[#F5EBEO] text-[#3d2c28]/70 hover:bg-[#F0DBDB] hover:text-[#3d2c28] transition-all"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Client-side Interactive Components */}
        <CategoryPageClient
          products={productsData.items}
          category={category}
          totalProducts={productsData.total}
          currentPage={page}
          totalPages={productsData.totalPages}
          currentSort={sort}
          currentView={view}
        />
      </div>
    </div>
  );
}