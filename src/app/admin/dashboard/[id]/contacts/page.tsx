'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Mail,
  Phone,
  Search,
  User,
  CalendarDays,
  MessageSquare,
  Eye,
} from 'lucide-react'
import { getAllContacts } from '@/app/actions/contact'
import { Contact } from '../../../../../../prisma/src/lib/prisma/client'
import { toast } from 'react-toastify'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  useEffect(() => {
    const fetchContacts = async () => {
      const data = await getAllContacts()
      setContacts(data.contacts)
    }
    fetchContacts()
  }, [])

  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')

  const statuses = ['All', 'Unread', 'Read', 'Resolved']

  const filteredContacts = contacts.filter((contact) => {
    const matchesStatus =
      activeStatus === 'All' ||
      (activeStatus === 'Unread' && contact.status === 'UNREAD') ||
      (activeStatus === 'Read' && contact.status === 'READ') ||
      (activeStatus === 'Resolved' && contact.status === 'RESOLVED')
    const matchesSearch =
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.message.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handlemarkedAsRead = async (id: string) => {
    const res = await fetch(`/api/contact/${id}/mark-as-read`, {
      method: 'PATCH',
    })
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, status: 'READ' } : contact,
      ),
    )
    toast.success('Contact marked as read')
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>
            Communication Messages
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            View and manage all customer messages sent through your website.
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search contacts...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full sm:w-72 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500'
            />
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-3'>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeStatus === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <div className='rounded-3xl bg-white p-5 shadow-sm border border-gray-100'>
          <p className='text-sm text-gray-500'>Total Messages</p>
          <h2 className='text-3xl font-bold text-gray-800 mt-2'>
            {contacts.length}
          </h2>
        </div>

        <div className='rounded-3xl bg-white p-5 shadow-sm border border-gray-100'>
          <p className='text-sm text-gray-500'>Unread</p>
          <h2 className='text-3xl font-bold text-yellow-600 mt-2'>
            {contacts.filter((c) => c.status === 'UNREAD').length}
          </h2>
        </div>

        <div className='rounded-3xl bg-white p-5 shadow-sm border border-gray-100'>
          <p className='text-sm text-gray-500'>Read</p>
          <h2 className='text-3xl font-bold text-blue-600 mt-2'>
            {contacts.filter((c) => c.status === 'READ').length}
          </h2>
        </div>

        <div className='rounded-3xl bg-white p-5 shadow-sm border border-gray-100'>
          <p className='text-sm text-gray-500'>Resolved</p>
          <h2 className='text-3xl font-bold text-green-600 mt-2'>
            {contacts.filter((c) => c.status === 'RESOLVED').length}
          </h2>
        </div>
      </div>

      <div className='space-y-4'>
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className='rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all'
          >
            <div className='flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6'>
              <div className='flex-1 space-y-4'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-lg font-semibold text-gray-800'>
                        {contact.name}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          contact.status === 'UNREAD'
                            ? 'bg-yellow-100 text-yellow-700'
                            : contact.status === 'READ'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <p className='text-sm text-gray-400'>
                      Message ID: {contact.id}
                    </p>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <CalendarDays className='h-4 w-4' />
                    {contact.createdAt.toDateString()}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='flex items-center gap-3 rounded-2xl bg-gray-50 p-3'>
                    <User className='h-5 w-5 text-blue-600' />
                    <div>
                      <p className='text-xs text-gray-500'>Customer Name</p>
                      <p className='text-sm font-medium text-gray-800'>
                        {contact.name}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 rounded-2xl bg-gray-50 p-3'>
                    <Mail className='h-5 w-5 text-green-600' />
                    <div>
                      <p className='text-xs text-gray-500'>Email Address</p>
                      <p className='text-sm font-medium text-gray-800 break-all'>
                        {contact.email}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 rounded-2xl bg-gray-50 p-3'>
                    <Phone className='h-5 w-5 text-purple-600' />
                    <div>
                      <p className='text-xs text-gray-500'>Phone Number</p>
                      <p className='text-sm font-medium text-gray-800'>
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MessageSquare className='h-4 w-4 text-blue-600' />
                    <h3 className='font-semibold text-gray-800'>
                      {contact.subject}
                    </h3>
                  </div>
                  <p className='text-sm text-gray-600 leading-relaxed'>
                    {contact.message}
                  </p>
                </div>
              </div>

              <div className='flex xl:flex-col gap-3'>
                {/* <button className='flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-all'>
                  <Eye className='h-4 w-4' />
                  View
                </button> */}

                <button
                  onClick={() => handlemarkedAsRead(contact.id)}
                  className='rounded-2xl border cursor-pointer border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all'
                >
                  Mark as Read
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
