'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import crypto from 'crypto';

// The hashed version of '0912' using scrypt
// Salt: 'sns_salt'
// Hash generated via: crypto.scryptSync('0912', 'sns_salt', 64).toString('hex')
const EXPECTED_HASH = '1edcc270634ff90f121d582d1c9fb87440b8a1c5dca9e8550dd41f6424e6fffc2c3df31b26ef8d52317d7b567b4539ef3879d7494a8f15cd925b4ec2b55b206c';
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
