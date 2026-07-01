'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Generate unique contact ID
function generateContactId(): string {
  const prefix = 'CNT'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}${random}`
}

// Create a new contact message
export async function createContact(data: {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}) {
  try {
    const contactId = generateContactId()

    const contact = await db.contact.create({
      data: {
        contactId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: 'UNREAD',
      },
    })

    revalidatePath('/admin/contacts')
    return {
      success: true,
      contact,
      contactId,
    }
  } catch (error) {
    console.error('Error creating contact:', error)
    return {
      success: false,
      error: 'Failed to send message. Please try again.',
    }
  }
}

// Get all contacts (for admin)
export async function getAllContacts(status?: string) {
  try {
    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    const contacts = await db.contact.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      contacts,
    }
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return {
      success: false,
      error: 'Failed to fetch contacts',
      contacts: [],
    }
  }
}

// Get single contact by ID
export async function getContactById(id: string) {
  try {
    const contact = await db.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return {
        success: false,
        error: 'Contact not found',
        contact: null,
      }
    }

    // Mark as read if it was unread
    if (contact.status === 'UNREAD') {
      await db.contact.update({
        where: { id },
        data: { status: 'READ' },
      })
      contact.status = 'READ'
    }

    return {
      success: true,
      contact,
    }
  } catch (error) {
    console.error('Error fetching contact:', error)
    return {
      success: false,
      error: 'Failed to fetch contact',
      contact: null,
    }
  }
}

// Update contact status
export async function updateContactStatus(id: string, status: string) {
  try {
    const contact = await db.contact.update({
      where: { id },
      data: { status: status as any },
    })

    revalidatePath('/admin/contacts')
    return {
      success: true,
      contact,
    }
  } catch (error) {
    console.error('Error updating contact status:', error)
    return {
      success: false,
      error: 'Failed to update status',
    }
  }
}

// Reply to contact

// Delete contact
export async function deleteContact(id: string) {
  try {
    await db.contact.delete({
      where: { id },
    })

    revalidatePath('/admin/contacts')
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting contact:', error)
    return {
      success: false,
      error: 'Failed to delete contact',
    }
  }
}

// Get contact statistics
export async function getContactStats() {
  try {
    const [total, unread, inProgress, resolved] = await Promise.all([
      db.contact.count(),
      db.contact.count({ where: { status: 'UNREAD' } }),
      db.contact.count({ where: { status: 'IN_PROGRESS' } }),
      db.contact.count({ where: { status: 'RESOLVED' } }),
    ])

    return {
      success: true,
      stats: {
        total,
        unread,
        inProgress,
        resolved,
      },
    }
  } catch (error) {
    console.error('Error fetching contact stats:', error)
    return {
      success: false,
      error: 'Failed to fetch stats',
      stats: null,
    }
  }
}
