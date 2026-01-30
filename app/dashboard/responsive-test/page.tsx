import { ResponsiveExample } from '@/components/examples/responsive-example'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Responsive Test - Yardım Yönetim Paneli',
  description: 'Responsive design test sayfası',
}

export default function ResponsiveTestPage() {
  return <ResponsiveExample />
}
