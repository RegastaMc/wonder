'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createContact } from '@/app/actions/contact'
import { toast } from 'react-toastify'
import {
  Send,
  CheckCircle,
  Mail,
  Phone,
  User,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'

interface ContactFormInputs {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>()

  const onSubmit = async (data: ContactFormInputs) => {
    setIsSubmitting(true)

    const result = await createContact(data)

    if (result.success) {
      setIsSuccess(true)
      toast.success("Message sent successfully! We'll get back to you soon.")
      reset()

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    } else {
      toast.error(result.error || 'Failed to send message. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg mt-4 overflow-hidden'>
      <div className='bg-gradient-to-r from-blue-600/50 to-indigo-600/70 px-6 py-8 flex flex-col items-center gap-2'>
        <h2 className='text-2xl font-bold text-white mb-2'>
          Send us a Message
        </h2>
        <p className='text-blue-100'>
          Have questions? We'd love to hear from you. Fill out the form and
          we'll respond promptly.
        </p>
      </div>

      {isSuccess && (
        <div className='m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3'>
          <CheckCircle className='w-5 h-5 text-green-600' />
          <div>
            <p className='font-medium text-green-800'>
              Message Sent Successfully!
            </p>
            <p className='text-sm text-green-600'>
              We'll get back to you within 24 hours.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-5'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Name */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Full Name *
            </label>
            <div className='relative'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <User className='w-4 h-4' />
              </div>
              <input
                type='text'
                {...register('name', { required: 'Name is required' })}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='John Doe'
              />
            </div>
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email Address *
            </label>
            <div className='relative'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <Mail className='w-4 h-4' />
              </div>
              <input
                type='email'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='john@example.com'
              />
            </div>
            {errors.email && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Phone */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Phone Number *
            </label>
            <div className='relative'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <Phone className='w-4 h-4' />
              </div>
              <input
                type='tel'
                {...register('phone', { required: 'Phone number is required' })}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='+254 712 345 678'
              />
            </div>
            {errors.phone && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Subject *
            </label>
            <div className='relative'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <MessageSquare className='w-4 h-4' />
              </div>
              <input
                type='text'
                {...register('subject', { required: 'Subject is required' })}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='How can we help?'
              />
            </div>
            {errors.subject && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.subject.message}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Message *
          </label>
          <textarea
            {...register('message', { required: 'Message is required' })}
            rows={5}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='Please describe your question or concern in detail...'
          />
          {errors.message && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2'
        >
          {isSubmitting ? (
            <>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              Sending...
            </>
          ) : (
            <>
              <Send className='w-4 h-4' />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default ContactForm
