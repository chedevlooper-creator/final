'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  CreditCard,
  FileText,
  Image,
  Baby,
  Users,
  Heart,
  UserCheck,
  MessageSquare,
  ClipboardList,
  Gift,
  FileCheck,
  Wallet,
  X,
} from 'lucide-react'
import { LINKED_RECORD_TABS, LinkedRecordTabType, CardSummary } from '@/types/linked-records.types'

// Tab Modal İçerikleri
import { BankAccountsTab } from './tabs/BankAccountsTab'
import { DocumentsTab } from './tabs/DocumentsTab'
import { PhotosTab } from './tabs/PhotosTab'
import { OrphanRelationsTab } from './tabs/OrphanRelationsTab'
import { DependentsTab } from './tabs/DependentsTab'
import { SponsorsTab } from './tabs/SponsorsTab'
import { ReferencesTab } from './tabs/ReferencesTab'
import { InterviewsTab } from './tabs/InterviewsTab'
import { ApplicationsTab } from './tabs/ApplicationsTab'
import { AidsReceivedTab } from './tabs/AidsReceivedTab'
import { ConsentsTab } from './tabs/ConsentsTab'
import { SocialCardsTab } from './tabs/SocialCardsTab'

// Icon mapper
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  FileText,
  Image,
  Baby,
  Users,
  Heart,
  UserCheck,
  MessageSquare,
  ClipboardList,
  Gift,
  FileCheck,
  Wallet,
}

interface LinkedRecordsTabsProps {
  needyPersonId: string
  cardSummary?: CardSummary
}

export function LinkedRecordsTabs({ needyPersonId, cardSummary }: LinkedRecordsTabsProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<LinkedRecordTabType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Hash değişikliklerini dinle
  useEffect(() => {
    const handleHashChange = () => {
      setTimeout(() => {
        const hash = window.location.hash
        if (hash.startsWith('#!')) {
          const tabPath = hash.replace('#!', '').split('/').pop()
          const tab = LINKED_RECORD_TABS.find(t => t.hashPath === tabPath)
          if (tab) {
            setActiveTab(tab.id)
            setIsModalOpen(true)
          }
        } else {
          setIsModalOpen(false)
          setActiveTab(null)
        }
      }, 0)
    }

    // İlk yüklemede hash kontrolü
    handleHashChange()

    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Tab'a tıklandığında
  const handleTabClick = useCallback((tabId: LinkedRecordTabType) => {
    const tab = LINKED_RECORD_TABS.find(t => t.id === tabId)
    if (tab) {
      // Hash'i güncelle
      window.location.hash = `#!/crea/relief/needy/${tab.hashPath}/${needyPersonId}`
      setActiveTab(tabId)
      setIsModalOpen(true)
    }
  }, [needyPersonId])

  // Modal kapatıldığında
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setActiveTab(null)
    // Hash'i temizle
    window.history.pushState(null, '', pathname)
  }, [pathname])

  // Badge değerini al
  const getBadgeCount = (badgeKey?: string): number => {
    if (!badgeKey || !cardSummary) return 0
    return (cardSummary as unknown as Record<string, number>)[badgeKey] || 0
  }

  // Aktif tab'ın başlığını al
  const getActiveTabTitle = (): string => {
    const tab = LINKED_RECORD_TABS.find(t => t.id === activeTab)
    return tab?.name || ''
  }

  // Tab içeriğini render et
  const renderTabContent = () => {
    if (!activeTab) return null

    const commonProps = { 
      needyPersonId, 
      onClose: handleCloseModal 
    }

    switch (activeTab) {
      case 'bank_accounts':
        return <BankAccountsTab {...commonProps} />
      case 'documents':
        return <DocumentsTab {...commonProps} />
      case 'photos':
        return <PhotosTab {...commonProps} />
      case 'orphan_relations':
        return <OrphanRelationsTab {...commonProps} />
      case 'dependents':
        return <DependentsTab {...commonProps} />
      case 'sponsors':
        return <SponsorsTab {...commonProps} />
      case 'references':
        return <ReferencesTab {...commonProps} />
      case 'interviews':
        return <InterviewsTab {...commonProps} />
      case 'applications':
        return <ApplicationsTab {...commonProps} />
      case 'aids_received':
        return <AidsReceivedTab {...commonProps} />
      case 'consents':
        return <ConsentsTab {...commonProps} />
      case 'social_cards':
        return <SocialCardsTab {...commonProps} />
      default:
        return null
    }
  }

  return (
    <>
      {/* Tab Butonları */}
      <div className="border rounded-lg bg-card p-3">
        <h3 className="text-xs font-medium text-muted-foreground mb-2">Bağlantılı Kayıtlar</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {LINKED_RECORD_TABS.map((tab) => {
            const IconComponent = iconMap[tab.icon]
            const badgeCount = getBadgeCount(tab.badgeKey)
            const isActive = activeTab === tab.id

            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'outline'}
                className="relative h-16 flex flex-col items-center justify-center gap-1 p-1.5"
                onClick={() => handleTabClick(tab.id)}
              >
                {IconComponent && <IconComponent className="h-4 w-4 flex-shrink-0" />}
                <span className="text-[10px] text-center leading-tight line-clamp-2 break-words px-1">
                  {tab.name}
                </span>
                {badgeCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {badgeCount}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Tab Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>{getActiveTabTitle()}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {renderTabContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
