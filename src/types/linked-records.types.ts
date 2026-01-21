// =====================================================
// BAĞLANTILI KAYITLAR TAB'LARI İÇİN TYPESCRIPT TİPLERİ
// 14 Tab için tüm interface'ler
// =====================================================

// =====================================================
// TAB 1: BANKA HESAPLARI
// =====================================================
// Not: Bu interface @/types/needy.types'dan import edilmeli
// Burada genişletilmiş bir versiyon tutuyoruz
export interface NeedyPersonBankAccount {
  id: string;
  needy_person_id: string;
  account_holder_name: string | null;
  currency: Currency;
  transaction_type: TransactionType | null;
  iban: string | null;
  bank_name: string | null;
  branch_name: string | null;
  branch_code: string | null;
  account_number: string | null;
  swift_code: string | null;
  address: string | null;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

// Legacy alias - kullanmayın, NeedyPersonBankAccount kullanın
/** @deprecated Use NeedyPersonBankAccount instead */
export type BankAccount = NeedyPersonBankAccount;

export type Currency = "TRY" | "USD" | "EUR" | "GBP" | "CHF";
export type TransactionType = "havale" | "eft" | "swift";

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "TRY", label: "Türk Lirası (₺)" },
  { value: "USD", label: "Amerikan Doları ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "İngiliz Sterlini (£)" },
  { value: "CHF", label: "İsviçre Frangı (CHF)" },
];

export const TRANSACTION_TYPE_OPTIONS: {
  value: TransactionType;
  label: string;
}[] = [
  { value: "havale", label: "Havale" },
  { value: "eft", label: "EFT" },
  { value: "swift", label: "Swift" },
];

// =====================================================
// TAB 2: DOKÜMANLAR
// =====================================================
export interface Document {
  id: string;
  needy_person_id: string;
  document_type: DocumentType;
  document_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  document_number: string | null;
  issuing_authority: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

export type DocumentType =
  | "kimlik"
  | "pasaport"
  | "ikamet"
  | "gelir_belgesi"
  | "saglik_raporu"
  | "egitim_belgesi"
  | "vukuatli_nufus"
  | "tapu_sened"
  | "kira_sozlesmesi"
  | "diger";

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "kimlik", label: "Kimlik Belgesi" },
  { value: "pasaport", label: "Pasaport" },
  { value: "ikamet", label: "İkamet Belgesi" },
  { value: "gelir_belgesi", label: "Gelir Belgesi" },
  { value: "saglik_raporu", label: "Sağlık Raporu" },
  { value: "egitim_belgesi", label: "Eğitim Belgesi" },
  { value: "vukuatli_nufus", label: "Vukuatlı Nüfus Kayıt Örneği" },
  { value: "tapu_sened", label: "Tapu/Senet" },
  { value: "kira_sozlesmesi", label: "Kira Sözleşmesi" },
  { value: "diger", label: "Diğer" },
];

// =====================================================
// TAB 3: FOTOĞRAFLAR
// =====================================================
export interface Photo {
  id: string;
  needy_person_id: string;
  photo_type: PhotoType;
  file_path: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  is_primary: boolean;
  is_consent_given: boolean;
  consent_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  description: string | null;
}

export type PhotoType = "profile" | "family" | "document" | "home" | "general";

export const PHOTO_TYPE_OPTIONS: { value: PhotoType; label: string }[] = [
  { value: "profile", label: "Profil Fotoğrafı" },
  { value: "family", label: "Aile Fotoğrafı" },
  { value: "document", label: "Belge Fotoğrafı" },
  { value: "home", label: "Ev/Konut Fotoğrafı" },
  { value: "general", label: "Genel" },
];

// =====================================================
// TAB 4: BAKTIĞI YETİMLER
// =====================================================
export interface OrphanRelation {
  id: string;
  needy_person_id: string;
  orphan_id: string;
  relation_type: OrphanRelationType;
  relation_description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_primary_guardian: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
  // İlişkili veri
  orphan?: {
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    gender: string | null;
  };
}

export type OrphanRelationType =
  | "guardian"
  | "caretaker"
  | "relative"
  | "foster_parent";

export const ORPHAN_RELATION_TYPE_OPTIONS: {
  value: OrphanRelationType;
  label: string;
}[] = [
  { value: "guardian", label: "Veli/Vasi" },
  { value: "caretaker", label: "Bakıcı" },
  { value: "relative", label: "Akraba" },
  { value: "foster_parent", label: "Koruyucu Aile" },
];

// =====================================================
// TAB 5: BAKTIĞI KİŞİLER (BAĞIMLI KİŞİLER)
// =====================================================
export interface Dependent {
  id: string;
  needy_person_id: string;
  dependent_person_id: string | null;
  first_name: string | null;
  last_name: string | null;
  identity_number: string | null;
  birth_date: string | null;
  gender: string | null;
  relation_type: DependentRelationType;
  relation_description: string | null;
  is_active: boolean;
  needs_support: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

export type DependentRelationType =
  | "child"
  | "spouse"
  | "parent"
  | "sibling"
  | "grandparent"
  | "grandchild"
  | "other";

export const DEPENDENT_RELATION_TYPE_OPTIONS: {
  value: DependentRelationType;
  label: string;
}[] = [
  { value: "child", label: "Çocuk" },
  { value: "spouse", label: "Eş" },
  { value: "parent", label: "Anne/Baba" },
  { value: "sibling", label: "Kardeş" },
  { value: "grandparent", label: "Büyükanne/Büyükbaba" },
  { value: "grandchild", label: "Torun" },
  { value: "other", label: "Diğer" },
];

// =====================================================
// TAB 6: SPONSORLAR
// =====================================================
export interface Sponsor {
  id: string;
  needy_person_id: string;
  sponsor_id: string | null;
  sponsor_name: string | null;
  sponsor_type: SponsorType | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  sponsorship_type: SponsorshipType | null;
  monthly_amount: number | null;
  currency: Currency;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  status: SponsorStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

export type SponsorType =
  | "individual"
  | "organization"
  | "foundation"
  | "company";
export type SponsorshipType =
  | "orphan"
  | "education"
  | "health"
  | "general"
  | "food"
  | "housing";
export type SponsorStatus = "active" | "paused" | "ended" | "pending";

export const SPONSOR_TYPE_OPTIONS: { value: SponsorType; label: string }[] = [
  { value: "individual", label: "Bireysel" },
  { value: "organization", label: "Kuruluş" },
  { value: "foundation", label: "Vakıf" },
  { value: "company", label: "Şirket" },
];

export const SPONSORSHIP_TYPE_OPTIONS: {
  value: SponsorshipType;
  label: string;
}[] = [
  { value: "orphan", label: "Yetim Sponsorluğu" },
  { value: "education", label: "Eğitim Desteği" },
  { value: "health", label: "Sağlık Desteği" },
  { value: "food", label: "Gıda Desteği" },
  { value: "housing", label: "Barınma Desteği" },
  { value: "general", label: "Genel Destek" },
];

export const SPONSOR_STATUS_OPTIONS: { value: SponsorStatus; label: string }[] =
  [
    { value: "active", label: "Aktif" },
    { value: "paused", label: "Durduruldu" },
    { value: "ended", label: "Sonlandırıldı" },
    { value: "pending", label: "Beklemede" },
  ];

// =====================================================
// TAB 7: REFERANSLAR
// =====================================================
export interface Reference {
  id: string;
  needy_person_id: string;
  reference_name: string;
  reference_type: ReferenceType | null;
  relation: string | null;
  phone: string | null;
  alt_phone: string | null;
  email: string | null;
  address: string | null;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

export type ReferenceType =
  | "personal"
  | "work"
  | "family"
  | "neighbor"
  | "religious"
  | "other";

export const REFERENCE_TYPE_OPTIONS: { value: ReferenceType; label: string }[] =
  [
    { value: "personal", label: "Kişisel" },
    { value: "work", label: "İş" },
    { value: "family", label: "Aile" },
    { value: "neighbor", label: "Komşu" },
    { value: "religious", label: "Dini Kurum" },
    { value: "other", label: "Diğer" },
  ];

// =====================================================
// TAB 8: GÖRÜŞME KAYITLARI
// =====================================================
export interface Interview {
  id: string;
  needy_person_id: string;
  interview_date: string;
  interview_type: InterviewType;
  interviewer_id: string | null;
  interviewer_name: string | null;
  subject: string | null;
  summary: string | null;
  detailed_notes: string | null;
  location: string | null;
  outcome: InterviewOutcome | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  status: InterviewStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type InterviewType =
  | "face_to_face"
  | "phone"
  | "video"
  | "home_visit"
  | "office";
export type InterviewOutcome =
  | "positive"
  | "negative"
  | "pending"
  | "follow_up_needed";
export type InterviewStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export const INTERVIEW_TYPE_OPTIONS: { value: InterviewType; label: string }[] =
  [
    { value: "face_to_face", label: "Yüz Yüze" },
    { value: "phone", label: "Telefon" },
    { value: "video", label: "Video Görüşme" },
    { value: "home_visit", label: "Ev Ziyareti" },
    { value: "office", label: "Ofis Görüşmesi" },
  ];

export const INTERVIEW_OUTCOME_OPTIONS: {
  value: InterviewOutcome;
  label: string;
}[] = [
  { value: "positive", label: "Olumlu" },
  { value: "negative", label: "Olumsuz" },
  { value: "pending", label: "Beklemede" },
  { value: "follow_up_needed", label: "Takip Gerekli" },
];

export const INTERVIEW_STATUS_OPTIONS: {
  value: InterviewStatus;
  label: string;
}[] = [
  { value: "scheduled", label: "Planlandı" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal Edildi" },
  { value: "no_show", label: "Gelmedi" },
];

// =====================================================
// TAB 9: GÖRÜŞME SEANS TAKİBİ
// =====================================================
export interface InterviewSession {
  id: string;
  needy_person_id: string;
  interview_id: string | null;
  session_number: number;
  scheduled_date: string;
  actual_date: string | null;
  duration_minutes: number | null;
  counselor_id: string | null;
  counselor_name: string | null;
  session_type: SessionType | null;
  session_notes: string | null;
  progress_notes: string | null;
  status: SessionStatus;
  next_session_date: string | null;
  next_session_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type SessionType =
  | "initial"
  | "follow_up"
  | "assessment"
  | "counseling"
  | "evaluation";
export type SessionStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export const SESSION_TYPE_OPTIONS: { value: SessionType; label: string }[] = [
  { value: "initial", label: "İlk Görüşme" },
  { value: "follow_up", label: "Takip Görüşmesi" },
  { value: "assessment", label: "Değerlendirme" },
  { value: "counseling", label: "Danışmanlık" },
  { value: "evaluation", label: "Sonuç Değerlendirmesi" },
];

export const SESSION_STATUS_OPTIONS: { value: SessionStatus; label: string }[] =
  [
    { value: "scheduled", label: "Planlandı" },
    { value: "completed", label: "Tamamlandı" },
    { value: "cancelled", label: "İptal Edildi" },
    { value: "no_show", label: "Gelmedi" },
    { value: "rescheduled", label: "Ertelendi" },
  ];

// =====================================================
// TAB 11: YAPILAN YARDIMLAR
// =====================================================
export interface AidReceived {
  id: string;
  needy_person_id: string;
  application_id: string | null;
  aid_type: AidType;
  aid_category: string | null;
  description: string | null;
  amount: number | null;
  currency: Currency;
  quantity: number | null;
  unit: string | null;
  aid_date: string;
  delivery_date: string | null;
  delivery_method: DeliveryMethod | null;
  delivery_status: DeliveryStatus;
  delivered_by: string | null;
  delivered_at: string | null;
  receipt_number: string | null;
  receipt_path: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

export type AidType =
  | "cash"
  | "food"
  | "in_kind"
  | "service"
  | "education"
  | "health"
  | "housing"
  | "clothing";
export type DeliveryMethod =
  | "direct"
  | "bank_transfer"
  | "cargo"
  | "hand_delivery"
  | "pickup";
export type DeliveryStatus = "pending" | "delivered" | "returned" | "cancelled";

export const AID_TYPE_OPTIONS: { value: AidType; label: string }[] = [
  { value: "cash", label: "Nakdi Yardım" },
  { value: "food", label: "Gıda Yardımı" },
  { value: "in_kind", label: "Ayni Yardım" },
  { value: "service", label: "Hizmet Sevk" },
  { value: "education", label: "Eğitim Desteği" },
  { value: "health", label: "Sağlık Desteği" },
  { value: "housing", label: "Barınma Desteği" },
  { value: "clothing", label: "Giyim Yardımı" },
];

export const DELIVERY_METHOD_OPTIONS: {
  value: DeliveryMethod;
  label: string;
}[] = [
  { value: "direct", label: "Doğrudan Teslim" },
  { value: "bank_transfer", label: "Banka Havalesi" },
  { value: "cargo", label: "Kargo" },
  { value: "hand_delivery", label: "Elden Teslim" },
  { value: "pickup", label: "Teslim Alındı" },
];

export const DELIVERY_STATUS_OPTIONS: {
  value: DeliveryStatus;
  label: string;
}[] = [
  { value: "pending", label: "Beklemede" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "returned", label: "İade Edildi" },
  { value: "cancelled", label: "İptal Edildi" },
];

// =====================================================
// TAB 12: RIZA BEYANLARI
// =====================================================
export interface Consent {
  id: string;
  needy_person_id: string;
  consent_type: ConsentType;
  consent_name: string | null;
  is_given: boolean;
  given_date: string | null;
  expiry_date: string | null;
  document_path: string | null;
  document_signed: boolean;
  signature_type: SignatureType | null;
  scope: string | null;
  revoked: boolean;
  revoked_date: string | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  witness_name: string | null;
  witness_id_number: string | null;
  notes: string | null;
}

export type ConsentType =
  | "kvkk"
  | "photo"
  | "aid"
  | "data_sharing"
  | "marketing"
  | "medical";
export type SignatureType = "wet_signature" | "digital" | "verbal";

export const CONSENT_TYPE_OPTIONS: { value: ConsentType; label: string }[] = [
  { value: "kvkk", label: "KVKK Aydınlatma" },
  { value: "photo", label: "Fotoğraf Kullanımı" },
  { value: "aid", label: "Yardım Onayı" },
  { value: "data_sharing", label: "Veri Paylaşımı" },
  { value: "marketing", label: "Pazarlama İletişimi" },
  { value: "medical", label: "Tıbbi Bilgi Paylaşımı" },
];

export const SIGNATURE_TYPE_OPTIONS: { value: SignatureType; label: string }[] =
  [
    { value: "wet_signature", label: "Islak İmza" },
    { value: "digital", label: "Dijital İmza" },
    { value: "verbal", label: "Sözlü Onay" },
  ];

// =====================================================
// TAB 13: SOSYAL KARTLAR
// =====================================================
export interface SocialCard {
  id: string;
  needy_person_id: string;
  card_type: SocialCardType;
  card_name: string | null;
  card_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  coverage_details: string | null;
  benefits: string[] | null;
  is_active: boolean;
  status: SocialCardStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

export type SocialCardType =
  | "green_card"
  | "poverty_card"
  | "refugee_card"
  | "disability_card"
  | "elderly_card"
  | "other";
export type SocialCardStatus = "active" | "expired" | "cancelled" | "pending";

export const SOCIAL_CARD_TYPE_OPTIONS: {
  value: SocialCardType;
  label: string;
}[] = [
  { value: "green_card", label: "Yeşil Kart" },
  { value: "poverty_card", label: "Muhtaçlık Kartı" },
  { value: "refugee_card", label: "Mülteci Kartı" },
  { value: "disability_card", label: "Engelli Kartı" },
  { value: "elderly_card", label: "Yaşlı Kartı" },
  { value: "other", label: "Diğer" },
];

export const SOCIAL_CARD_STATUS_OPTIONS: {
  value: SocialCardStatus;
  label: string;
}[] = [
  { value: "active", label: "Aktif" },
  { value: "expired", label: "Süresi Doldu" },
  { value: "cancelled", label: "İptal Edildi" },
  { value: "pending", label: "Beklemede" },
];

// =====================================================
// TAB 14: KART ÖZETİ
// =====================================================
export interface CardSummary {
  needy_person_id: string;
  first_name: string;
  last_name: string;
  identity_number: string | null;
  category: string | null;
  status: string | null;
  active_bank_accounts: number;
  total_documents: number;
  total_photos: number;
  active_orphan_relations: number;
  active_dependents: number;
  active_sponsors: number;
  total_references: number;
  total_interviews: number;
  total_sessions: number;
  total_applications: number;
  pending_applications: number;
  total_aids_received: number;
  total_aid_amount_try: number;
  given_consents: number;
  active_social_cards: number;
}

// =====================================================
// TAB CONFIGURATION
// =====================================================
export type LinkedRecordTabType =
  | "bank_accounts"
  | "documents"
  | "photos"
  | "orphan_relations"
  | "dependents"
  | "sponsors"
  | "references"
  | "interviews"
  | "applications"
  | "aids_received"
  | "consents"
  | "social_cards";

export interface LinkedRecordTab {
  id: LinkedRecordTabType;
  name: string;
  icon: string;
  badgeKey?: string;
  hashPath: string;
}

export const LINKED_RECORD_TABS: LinkedRecordTab[] = [
  {
    id: "bank_accounts",
    name: "Banka Hesapları",
    icon: "CreditCard",
    hashPath: "iban",
  },
  {
    id: "documents",
    name: "Dokümanlar",
    icon: "FileText",
    hashPath: "document",
  },
  { id: "photos", name: "Fotoğraflar", icon: "Image", hashPath: "photo" },
  {
    id: "orphan_relations",
    name: "Baktığı Yetimler",
    icon: "Baby",
    hashPath: "orphan",
  },
  {
    id: "dependents",
    name: "Baktığı Kişiler",
    icon: "Users",
    hashPath: "dependent",
  },
  { id: "sponsors", name: "Sponsorlar", icon: "Heart", hashPath: "sponsor" },
  {
    id: "references",
    name: "Referanslar",
    icon: "UserCheck",
    hashPath: "reference",
  },
  {
    id: "interviews",
    name: "Görüşme Kayıtları",
    icon: "MessageSquare",
    hashPath: "interview",
  },
  {
    id: "applications",
    name: "Yardım Talepleri",
    icon: "ClipboardList",
    badgeKey: "pending_applications",
    hashPath: "application",
  },
  {
    id: "aids_received",
    name: "Yapılan Yardımlar",
    icon: "Gift",
    hashPath: "relief",
  },
  {
    id: "consents",
    name: "Rıza Beyanları",
    icon: "FileCheck",
    hashPath: "consent",
  },
  {
    id: "social_cards",
    name: "Sosyal Kartlar",
    icon: "Wallet",
    hashPath: "card",
  },
];

// =====================================================
// FILTER OPTIONS
// =====================================================
export type StatusFilter = "all" | "active" | "inactive";

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "active", label: "Aktif Tanımlar" },
  { value: "inactive", label: "Pasif Tanımlar" },
];
