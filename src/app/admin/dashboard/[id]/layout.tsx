'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  ContactRound,
  LayoutDashboard,
  ListOrdered,
  Package,
  User,
} from 'lucide-react'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const sidebarLinks = [
    {
      name: 'Overview',
      path: '/admin/dashboard/id/overview',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      path: '/admin/dashboard/id/products',
      icon: Package,
    },
    {
      name: 'Orders',
      path: '/admin/dashboard/id/orders',
      icon: ListOrdered,
    },
    {
      name: 'Communication',
      path: '/admin/dashboard/id/contacts',
      icon: ContactRound,
    },
    {
      name: 'Customers',
      path: '/admin/dashboard/id/customers',
      icon: User,
    },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-100'>
      {/* Top Navbar */}
      <div className='sticky top-0 z-50 flex items-center justify-between border-b border-white/30 bg-white/70 backdrop-blur-xl px-4 md:px-8 py-4 shadow-sm'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='relative h-12 w-12 overflow-hidden rounded-2xl border border-gray-200 shadow-sm'>
            <Image
              src='/biggBanner.jpg'
              alt='logo'
              fill
              className='object-cover'
            />
          </div>

          <div className='hidden sm:block'>
            <h1 className='text-lg font-bold text-gray-800'>Admin Dashboard</h1>
            <p className='text-xs text-gray-500'>
              Manage products, orders and customers
            </p>
          </div>
        </Link>

        <div className='flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-sm border border-gray-100'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white'>
            A
          </div>

          <div className='hidden sm:block'>
            <p className='text-sm font-semibold text-gray-800'>Hi, Admin</p>
            <p className='text-xs text-gray-500'>Welcome back</p>
          </div>
        </div>
      </div>

      <div className='flex'>
        {/* Sidebar */}
        <aside className='h-[calc(100vh-81px)] w-20 md:w-72 border-r border-white/30 bg-white/60 backdrop-blur-xl shadow-sm'>
          <div className='px-3 py-6'>
            <div className='mb-6 hidden md:block rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-lg'>
              <h2 className='text-lg font-bold'>Dashboard Panel</h2>
              <p className='mt-1 text-sm text-blue-100'>
                Quickly manage your store activities and monitor performance.
              </p>
            </div>

            <div className='space-y-2'>
              {sidebarLinks.map((item) => {
                const isActive = pathname === item.path

                return (
                  <Link
                    href={item.path}
                    key={item.name}
                    className={`group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}
                    >
                      <item.icon className='h-5 w-5' />
                    </div>

                    <div className='hidden md:block'>
                      <p className='font-medium'>{item.name}</p>
                      <p
                        className={`text-xs ${
                          isActive ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        Manage {item.name.toLowerCase()}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto'>
          <div className='rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 p-4 md:p-6 shadow-sm min-h-[calc(100vh-120px)]'>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
