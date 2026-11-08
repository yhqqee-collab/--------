'use server'

import { timingSafeEqual } from 'node:crypto'

const ACCESS_PASSWORD = process.env.SITE_PASSWORD ?? '0032'

export type AccessState = { error: boolean; granted: boolean }

export async function verifyPassword(_prev: AccessState, formData: FormData): Promise<AccessState> {
  const input = String(formData.get('password') ?? '')
  const expected = Buffer.from(ACCESS_PASSWORD)
  const received = Buffer.from(input)
  const ok = expected.length === received.length && timingSafeEqual(expected, received)

  return ok ? { error: false, granted: true } : { error: true, granted: false }
}
