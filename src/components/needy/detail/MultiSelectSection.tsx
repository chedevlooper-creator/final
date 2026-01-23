'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FormSection } from './FormSection'
import { 
  DollarSign, 
  Stethoscope, 
  Tags, 
  AlertTriangle 
} from 'lucide-react'

// Gelir Kaynakları
export const INCOME_SOURCES = [
  { id: 'simple_trade', label: 'Basit Ticaret' },
  { id: 'government_aid', label: 'Devlet Yardımı' },
  { id: 'home_production', label: 'Evde İmalat İşleri' },
  { id: 'salary', label: 'Maaş' },
  { id: 'private_aid', label: 'Özel Yardım / Burs' },
  { id: 'agricultural', label: 'Tarımsal Gelir' },
]

// Hastalıklar Listesi (60+)
export const DISEASES = [
  { id: 'mediterranean_anemia', label: 'Akdeniz Anemisi' },
  { id: 'allergy', label: 'Alerji' },
  { id: 'asthma', label: 'Astım' },
  { id: 'fever', label: 'Ateş (Humma)' },
  { id: 'leg_shortening', label: 'Bacak Kısalığı' },
  { id: 'chronic_tonsillitis', label: 'Bademcik (Kronik)' },
  { id: 'intestinal_disorder', label: 'Bağırsak Rahatsızlığı' },
  { id: 'cerebral_palsy', label: 'Beyin Felci' },
  { id: 'brain_tumor', label: 'Beyin Tümörü' },
  { id: 'kidney_stone', label: 'Böbrek Taşı' },
  { id: 'kidney_failure', label: 'Böbrek Yetmezliği' },
  { id: 'chronic_bronchitis', label: 'Bronşit (Kronik)' },
  { id: 'growth_delay', label: 'Büyüme Gecikmesi' },
  { id: 'skin_problem', label: 'Cilt Problemi' },
  { id: 'celiac', label: 'Çölyak Hastalığı' },
  { id: 'heart_hole', label: 'Delik Kalp' },
  { id: 'depression', label: 'Depresyon' },
  { id: 'dental_disease', label: 'Diş Hastalıkları' },
  { id: 'diabetes', label: 'Diyabet (Şeker Hastalığı)' },
  { id: 'down_syndrome', label: 'Down Sendromu' },
  { id: 'hearing_difficulty', label: 'Duyma Zorluğu' },
  { id: 'epilepsy', label: 'Epilepsi (Sara)' },
  { id: 'adenoid', label: 'Geniz Eti' },
  { id: 'chest_disease', label: 'Göğüs Hastalıkları' },
  { id: 'vision_impairment', label: 'Görme Bozukluğu' },
  { id: 'goiter', label: 'Guatr' },
  { id: 'hepatology', label: 'Hepatoloji' },
  { id: 'adhd', label: 'Hiperaktivite Bozukluğu' },
  { id: 'hormonal_disorder', label: 'Hormonal Düzensizlik' },
  { id: 'permanent_blindness', label: 'Kalıcı Görme Engeli (Körlük)' },
  { id: 'permanent_deafness', label: 'Kalıcı İşitme Engeli (Sağırlık)' },
  { id: 'permanent_speech', label: 'Kalıcı Konuşma Engeli' },
  { id: 'permanent_walking', label: 'Kalıcı Yürüme Engeli' },
  { id: 'permanent_mental', label: 'Kalıcı Zihinsel Engel' },
  { id: 'heart_failure', label: 'Kalp Yetmezliği' },
  { id: 'calcium_deficiency', label: 'Kalsiyum Eksikliği' },
  { id: 'cancer', label: 'Kanser' },
  { id: 'anemia', label: 'Kansızlık' },
  { id: 'liver_disease', label: 'Karaciğer Hastalığı' },
  { id: 'speech_difficulty', label: 'Konuşma Zorluğu' },
  { id: 'ear_infection', label: 'Kulak İltihabı' },
  { id: 'leukemia', label: 'Lösemi' },
  { id: 'meningitis', label: 'Menenjit' },
  { id: 'migraine', label: 'Migren' },
  { id: 'shortness_of_breath', label: 'Nefes Darlığı' },
  { id: 'obesity', label: 'Obezite' },
  { id: 'spinal_disease', label: 'Omurilik Hastalığı' },
  { id: 'autism', label: 'Otizm' },
  { id: 'prosthesis', label: 'Protez' },
  { id: 'psychological', label: 'Psikolojik Sorun' },
  { id: 'rickets', label: 'Raşitizm' },
  { id: 'rheumatism', label: 'Romatizma' },
  { id: 'malaria', label: 'Sıtma' },
  { id: 'sinusitis', label: 'Sinüzit' },
  { id: 'stress', label: 'Stres' },
  { id: 'strabismus', label: 'Şaşılık' },
  { id: 'typhoid', label: 'Tifo' },
  { id: 'tuberculosis', label: 'Tüberküloz' },
  { id: 'ulcer', label: 'Ülser' },
  { id: 'urological', label: 'Ürolojik Rahatsızlık' },
  { id: 'developmental_disorder', label: 'Yaygın Gelişimsel Bozukluklar' },
  { id: 'hypertension', label: 'Yüksek Tansiyon' },
  { id: 'other', label: 'Diğer' },
]

// Etiketler
export const TAGS = [
  { id: 'criminal_record', label: 'Sabıka Kaydı Var', color: 'text-red-600' },
  { id: 'regular_aid', label: 'Düzenli Yardım Yapılabilir', color: 'text-green-600' },
  { id: 'reject_future', label: 'Gelecekteki Başvuruları Reddedilmeli', color: 'text-red-600' },
  { id: 'negative', label: 'Olumsuz', color: 'text-orange-600' },
  { id: 'fake_document', label: 'Sahte Evrak Getirdi / Yalan Beyanda Bulundu', color: 'text-red-700' },
]

// Özel Durumlar
export const SPECIAL_CONDITIONS = [
  { id: 'earthquake_victim', label: 'Depremzede' },
  { id: 'war_victim', label: 'Savaş Mağduru' },
  { id: 'refugee', label: 'Mülteci' },
  { id: 'disabled', label: 'Engelli' },
]

interface MultiSelectProps {
  selectedItems: string[]
  onChange: (items: string[]) => void
}

// Gelir Kaynakları Bölümü
export function IncomeSourcesSection({ selectedItems, onChange }: MultiSelectProps) {
  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onChange(selectedItems.filter(item => item !== id))
    } else {
      onChange([...selectedItems, id])
    }
  }

  return (
    <FormSection 
      title="Gelir Kaynakları" 
      icon={<DollarSign className="h-4 w-4 text-green-500" />}
      defaultOpen={false}
    >
      <div className="grid grid-cols-3 gap-3">
        {INCOME_SOURCES.map((source) => (
          <div key={source.id} className="flex items-center space-x-2">
            <Checkbox
              id={source.id}
              checked={selectedItems.includes(source.id)}
              onCheckedChange={() => toggleItem(source.id)}
            />
            <Label htmlFor={source.id} className="text-sm cursor-pointer">
              {source.label}
            </Label>
          </div>
        ))}
      </div>
    </FormSection>
  )
}

// Hastalıklar Bölümü
export function DiseasesSection({ selectedItems, onChange }: MultiSelectProps) {
  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onChange(selectedItems.filter(item => item !== id))
    } else {
      onChange([...selectedItems, id])
    }
  }

  return (
    <FormSection 
      title="Hastalık(lar)" 
      icon={<Stethoscope className="h-4 w-4 text-red-500" />}
      defaultOpen={false}
    >
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {DISEASES.map((disease) => (
          <div key={disease.id} className="flex items-center space-x-2">
            <Checkbox
              id={disease.id}
              checked={selectedItems.includes(disease.id)}
              onCheckedChange={() => toggleItem(disease.id)}
            />
            <Label htmlFor={disease.id} className="text-xs cursor-pointer">
              {disease.label}
            </Label>
          </div>
        ))}
      </div>
    </FormSection>
  )
}

// Etiketler Bölümü
export function TagsSection({ selectedItems, onChange }: MultiSelectProps) {
  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onChange(selectedItems.filter(item => item !== id))
    } else {
      onChange([...selectedItems, id])
    }
  }

  return (
    <FormSection 
      title="Etiketler" 
      icon={<Tags className="h-4 w-4 text-blue-500" />}
      defaultOpen={true}
    >
      <div className="grid grid-cols-2 gap-3">
        {TAGS.map((tag) => (
          <div key={tag.id} className="flex items-center space-x-2">
            <Checkbox
              id={tag.id}
              checked={selectedItems.includes(tag.id)}
              onCheckedChange={() => toggleItem(tag.id)}
            />
            <Label htmlFor={tag.id} className={`text-sm cursor-pointer ${tag.color}`}>
              {tag.label}
            </Label>
          </div>
        ))}
      </div>
    </FormSection>
  )
}

// Özel Durumlar Bölümü
export function SpecialConditionsSection({ selectedItems, onChange }: MultiSelectProps) {
  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onChange(selectedItems.filter(item => item !== id))
    } else {
      onChange([...selectedItems, id])
    }
  }

  return (
    <FormSection 
      title="Özel Durumlar" 
      icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
      defaultOpen={true}
    >
      <div className="grid grid-cols-2 gap-3">
        {SPECIAL_CONDITIONS.map((condition) => (
          <div key={condition.id} className="flex items-center space-x-2">
            <Checkbox
              id={condition.id}
              checked={selectedItems.includes(condition.id)}
              onCheckedChange={() => toggleItem(condition.id)}
            />
            <Label htmlFor={condition.id} className="text-sm cursor-pointer">
              {condition.label}
            </Label>
          </div>
        ))}
      </div>
    </FormSection>
  )
}
