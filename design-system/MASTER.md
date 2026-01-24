# Yardım Yönetim Paneli - Master Design System

## 1. Core Principles
- **Style:** Enterprise Minimalism (Clean, Trustworthy, Data-Dense)
- **Primary Goal:** Efficient management of aid, donations, and needy persons.
- **Accessibility:** WCAG AA/AAA compliant. High contrast for long-term usage.
- **Language:** Turkish (TR)

## 2. Color Palette (Tailwind Variables)

### Brand Colors
- **Primary (Deep Teal):** `#006D77` (Trust, Stability)
  - `bg-primary` / `text-primary`
- **Secondary (Soft Teal):** `#83C5BE` (Support)
  - `bg-secondary` / `text-secondary`
- **Accent/Action (Terracotta):** `#E29578` (Primary CTAs)
  - `bg-accent` / `text-accent`

### Neutral / Surface
- **Background:** `#F8F9FA` (Gray 50 - Reduced eye strain)
- **Surface/Card:** `#FFFFFF` (White)
- **Text Main:** `#1F2937` (Gray 900)
- **Text Muted:** `#6B7280` (Gray 500)
- **Border:** `#E5E7EB` (Gray 200)

### Semantic / Status
- **Success (Approved):** `#10B981` (Emerald 500)
- **Warning (Pending):** `#F59E0B` (Amber 500)
- **Error (Rejected/Critical):** `#EF4444` (Red 500)
- **Info (Processing):** `#3B82F6` (Blue 500)

## 3. Typography
- **Font Family:** `Inter`, system-ui, sans-serif (Excellent Turkish char support)
- **Scale:**
  - `h1`: 24px/32px (Page Titles)
  - `h2`: 20px/28px (Section Headers)
  - `h3`: 18px/24px (Card Titles)
  - `body`: 14px/20px (Standard Text)
  - `small`: 12px/16px (Metadata/Hints)

## 4. Layout & Spacing
- **Sidebar:** Fixed width (250px), collapsible on mobile.
- **Container:** Max-width 1440px centered for large screens.
- **Grid:** 8px base grid. Spacing tokens: `p-4` (16px), `p-6` (24px), `gap-4`.
- **Radius:** `rounded-md` (6px) or `rounded-lg` (8px) - soft but professional.

## 5. Component Patterns

### Navigation (Sidebar)
- Left-aligned vertical navigation.
- Active state: Primary color background + White text.
- Hover state: Gray 100 background.
- Sections:
  1. Dashboard (Genel Bakış)
  2. İhtiyaç Sahipleri (Needy Persons)
  3. Bağışlar (Donations)
  4. Finans (Finance)
  5. Başvurular (Applications)
  6. Toplantılar (Meetings)

### Data Tables
- Header: Gray 50 bg, Uppercase, bold text (12px).
- Rows: White bg, Hover highlight (Gray 50).
- Actions: Right-aligned (Edit, Delete, View).
- Pagination: Bottom right.

### Forms
- Inputs: White bg, Border Gray 300. Focus ring: Brand Primary.
- Labels: Top aligned, Medium weight (Gray 700).
- Validation: Inline error messages (Red 500) below inputs.
- Actions: Save (Primary/Accent) on right, Cancel (Ghost) on left.

### Feedback
- **Toasts:** Top-right for success/error notifications.
- **Skeletons:** Animated gray pulse for data loading states.
- **Modals:** Centered, backdrop blur-sm.

## 6. Iconography
- Library: Lucide React (Standard with shadcn/ui).
- Size: 16px (sm), 20px (default), 24px (lg).
- Style: Stroke width 2px, Rounded caps.

## 7. Anti-Patterns (DO NOT USE)
- ❌ Dark mode as default (Stick to Light mode for admin clarity).
- ❌ Glassmorphism (blurs) on data layers (Legibility risk).
- ❌ Gradients on text.
- ❌ Low contrast gray text on white.
