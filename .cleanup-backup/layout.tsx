import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stok / Depo Yönetimi',
  description: 'Envanter takibi ve depo yönetimi',
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
