/**
 * Activity Logger Utility
 * 
 * Kullanıcı aktivitelerini loglamak için kullanılan utility fonksiyonları.
 * Bu fonksiyonlar, uygulama içindeki çeşitli işlemleri otomatik olarak kaydeder.
 */

import { createClient } from './supabase/client'
import type { ActivityAction } from '@/types/task.types'

interface LogActivityParams {
  action: ActivityAction
  entityType: string
  entityId?: string
  entityName?: string
  description: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

/**
 * Kullanıcı aktivitesini logla
 * Bu fonksiyon client-side'da çalışır
 */
export async function logActivity(params: LogActivityParams): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.rpc('log_activity', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_action: params.action,
      p_entity_type: params.entityType,
      p_entity_id: params.entityId,
      p_entity_name: params.entityName,
      p_description: params.description,
      p_old_values: params.oldValues,
      p_new_values: params.newValues,
    })

    if (error) {
      console.error('Aktivite loglanırken hata:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Aktivite loglanırken hata:', error)
    return false
  }
}

/**
 * Yardım kaydı oluşturulduğunda log kaydet
 */
export async function logNeedyPersonCreated(
  needyPersonId: string,
  needyPersonName: string,
  values: Record<string, unknown>
): Promise<void> {
  await logActivity({
    action: 'create',
    entityType: 'needy_person',
    entityId: needyPersonId,
    entityName: needyPersonName,
    description: `Yeni yardım kaydı oluşturuldu: ${needyPersonName}`,
    newValues: values,
  })
}

/**
 * Yardım kaydı güncellendiğinde log kaydet
 */
export async function logNeedyPersonUpdated(
  needyPersonId: string,
  needyPersonName: string,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): Promise<void> {
  await logActivity({
    action: 'update',
    entityType: 'needy_person',
    entityId: needyPersonId,
    entityName: needyPersonName,
    description: `Yardım kaydı güncellendi: ${needyPersonName}`,
    oldValues,
    newValues,
  })
}

/**
 * Bağış oluşturulduğunda log kaydet
 */
export async function logDonationCreated(
  donationId: string,
  donorName: string,
  amount: number,
  values: Record<string, unknown>
): Promise<void> {
  await logActivity({
    action: 'create',
    entityType: 'donation',
    entityId: donationId,
    entityName: donorName,
    description: `Yeni bağış kaydedildi: ${donorName} - ${amount} TL`,
    newValues: values,
  })
}

/**
 * Gönüllü oluşturulduğunda log kaydet
 */
export async function logVolunteerCreated(
  volunteerId: string,
  volunteerName: string,
  values: Record<string, unknown>
): Promise<void> {
  await logActivity({
    action: 'create',
    entityType: 'volunteer',
    entityId: volunteerId,
    entityName: volunteerName,
    description: `Yeni gönüllü kaydedildi: ${volunteerName}`,
    newValues: values,
  })
}

/**
 * Kullanıcı giriş yaptığında log kaydet
 */
export async function logUserLogin(): Promise<void> {
  await logActivity({
    action: 'login',
    entityType: 'session',
    description: 'Kullanıcı giriş yaptı',
  })
}

/**
 * Kullanıcı çıkış yaptığında log kaydet
 */
export async function logUserLogout(): Promise<void> {
  await logActivity({
    action: 'logout',
    entityType: 'session',
    description: 'Kullanıcı çıkış yaptı',
  })
}

/**
 * Veri dışa aktarıldığında log kaydet
 */
export async function logDataExport(
  entityType: string,
  recordCount: number,
  format: string
): Promise<void> {
  await logActivity({
    action: 'export',
    entityType,
    description: `${recordCount} adet ${entityType} kaydı ${format} formatında dışa aktarıldı`,
    newValues: { recordCount, format },
  })
}

/**
 * Veri içe aktarıldığında log kaydet
 */
export async function logDataImport(
  entityType: string,
  recordCount: number,
  format: string
): Promise<void> {
  await logActivity({
    action: 'import',
    entityType,
    description: `${recordCount} adet ${entityType} kaydı ${format} formatında içe aktarıldı`,
    newValues: { recordCount, format },
  })
}

/**
 * Generic entity log fonksiyonları
 */
export const entityLoggers = {
  create: async (
    entityType: string,
    entityId: string,
    entityName: string,
    values: Record<string, unknown>
  ): Promise<void> => {
    await logActivity({
      action: 'create',
      entityType,
      entityId,
      entityName,
      description: `Yeni ${entityType} oluşturuldu: ${entityName}`,
      newValues: values,
    })
  },

  update: async (
    entityType: string,
    entityId: string,
    entityName: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ): Promise<void> => {
    await logActivity({
      action: 'update',
      entityType,
      entityId,
      entityName,
      description: `${entityType} güncellendi: ${entityName}`,
      oldValues,
      newValues,
    })
  },

  delete: async (
    entityType: string,
    entityId: string,
    entityName: string,
    oldValues: Record<string, unknown>
  ): Promise<void> => {
    await logActivity({
      action: 'delete',
      entityType,
      entityId,
      entityName,
      description: `${entityType} silindi: ${entityName}`,
      oldValues,
    })
  },

  view: async (
    entityType: string,
    entityId: string,
    entityName: string
  ): Promise<void> => {
    // View logları çok sık oluşacağı için sadece hassas veriler için kullanılabilir
    // Opsiyonel olarak implement edilebilir
    await logActivity({
      action: 'view',
      entityType,
      entityId,
      entityName,
      description: `${entityType} görüntülendi: ${entityName}`,
    })
  },
}
