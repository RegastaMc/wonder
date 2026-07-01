'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye } from 'lucide-react'
import { EyeOff } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { SVGProps } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

export interface SignupProps {
  formtype: string
}

const Google = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width='1em'
    height='1em'
    viewBox='0 0 256 262'
    xmlns='http://www.w3.org/2000/svg'
    preserveAspectRatio='xMidYMid'
    {...props}
  >
    <path
      d='M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027'
      fill='#4285F4'
    />
    <path
      d='M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1'
      fill='#34A853'
    />
    <path
      d='M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782'
      fill='#FBBC05'
    />
    <path
      d='M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251'
      fill='#EB4335'
    />
  </svg>
)

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState(false)

  const [errormsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target as HTMLFormElement)

    formAction(formData)
  }

  const formAction = async (formData: FormData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setLoading(false)
        setMsg(data.message)
        toast.success(data.message)
        setError(false)
        setErrorMsg('')
        setTimeout(() => {
          router.push('/signin')
        }, 3500)
      } else if (!res.ok) {
        toast.error(data.message)
        setLoading(false)
        setError(true)
        setErrorMsg(data.message)
      }
    } catch (error) {
      toast.error('An error occurred during registration.')
      setError(true)

      console.error('Error during form submission:', error)
    } finally {
      setTimeout(() => {
        setError(false)
        setMsg('')
        setErrorMsg('')
        setLoading(false)
      }, 2000)
    }
  }
  return (
    <div className={`min-h-screen flex ${'justify-center items-center'} p-4`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='bg-white w-full max-w-md'
      >
        <div className='rounded-2xl bg-blue-200/40 shadow-xl p-8 space-y-5'>
          <div className='text-center space-y-2'>
            <p className=' text-muted-foreground'>
              Please enter your credentials to{' '}
              <span className='uppercase text-blue-600'>register</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='e.g    johndoes@gmail.com'
                name='email'
                required
                className='placeholder:text-zinc-400 placeholder:text-xs bg-white'
              />
            </div>
            <div className='space-y-2 relative'>
              <Label>Password</Label>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                required
                className='placeholder:text-zinc-400 placeholder:text-xs bg-white'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-5 top-7 hover:gray-700'
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className='space-y-2 relative'>
              <Label>Repeat Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                className='placeholder:text-zinc-400 placeholder:text-xs bg-white'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-5 top-7 hover:gray-700'
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className='flex justify-between'>
              <div className='flex items-center mt-3'>
                <Checkbox id='remember' />
                <Label htmlFor='remember' className='text-muted-foreground'>
                  Remember me
                </Label>
              </div>
            </div>
            <Button
              disabled={loading}
              type='submit'
              className='w-full mt-3 cursor-pointer'
            >
              {loading ? 'Registering user...' : 'Sign Up'}
            </Button>
          </form>

          <>
            {/* <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center uppercase text-sm text-muted-foreground '>
                <span className='bg-white'> or continue with</span>
              </div>
            </div> */}

            {/* <form action={googleAction} className='grid grid-cols-1 space-x-2'>
              <Button
                variant='outline'
                className='flex items-center justify-center'
              >
                <Google />
                Continue with Google
              </Button>
            </form> */}
          </>

          <div>
            <p className='text-xs text-muted-foreground text-center'>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>

          <div>
            Already have an account?
            <Link
              href={'/signin'}
              className='uppercase text-sm p-3 text-blue-400'
            >
              Log in Here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
