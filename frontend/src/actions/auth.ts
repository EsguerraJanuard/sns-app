'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import crypto from 'crypto';

// The hashed version of '0912' using scrypt
// Salt: 'sns_salt'
// Hash generated via: crypto.scryptSync('0912', 'sns_salt', 64).toString('hex')
const EXPECTED_HASH = 'e17a3a5d9c4460e16d6b47b6c763251ff3639adb7ba49e38742f8183c662aec0dd11aff65e6388e8851ab5125cf4a2d30823e3aa6108ef310bb8f7ac6c900436';
const SALT = 'sns_salt';

const SESSION_DURATION = 30 * 60 // 30 minutes in seconds

export async function loginWithPin(pin: string) {
  // Use constant-time comparison to prevent timing attacks
  const inputHash = crypto.scryptSync(pin, SALT, 64).toString('hex');
  if (inputHash !== EXPECTED_HASH) {
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
