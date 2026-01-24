import { redirect } from 'next/navigation'

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)

export default function Home() {
  redirect('/dashboard')
}
