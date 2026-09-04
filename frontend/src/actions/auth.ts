'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const CORRECT_PIN = '0912'
const SESSION_DURATION = 30 * 60 // 30 minutes in seconds

export async function loginWithPin(pin: string) {
  if (pin !== CORRECT_PIN) {
    return { error: 'Incorrect PIN' }
  }

  const cookieStore = await cookies()
  
  cookieStore.set('auth_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_session')
  redirect('/login')
}
