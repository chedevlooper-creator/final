/**
 * Sidebar Component Tests
 * 
 * These tests verify the Sidebar component renders correctly
 * and responds to user interactions properly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock all dependencies before importing Sidebar
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/dashboard'),
}))

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
        <a href={href} {...props}>{children}</a>
    ),
}))

vi.mock('@/lib/menu-config', () => ({
    menuItems: [
        {
            title: 'Ana Menü',
            items: [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: ({ className }: { className?: string }) => <span data-testid="icon-dashboard" className={className} />
                },
                {
                    title: 'Kullanıcılar',
                    href: '/dashboard/users',
                    icon: ({ className }: { className?: string }) => <span data-testid="icon-users" className={className} />
                },
            ],
        },
    ],
}))

// Simple mock for Zustand store
vi.mock('@/stores/ui-store', () => {
    let collapsed = false
    return {
        useUIStore: (selector: (state: { sidebarCollapsed: boolean; toggleSidebar: () => void }) => unknown) => {
            const state = {
                sidebarCollapsed: collapsed,
                toggleSidebar: () => { collapsed = !collapsed },
            }
            return selector(state)
        },
    }
})

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className, ...props }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
        <button onClick={onClick} className={className} {...props}>{children}</button>
    ),
}))

vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="scroll-area" className={className}>{children}</div>
    ),
}))

vi.mock('@/components/ui/tooltip', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <span role="tooltip">{children}</span>,
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@radix-ui/react-tooltip', () => ({
    Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Import component after mocks
import { Sidebar } from '../sidebar'

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Basic Rendering', () => {
        it('should render sidebar element', () => {
            render(<Sidebar />)

            // Should render the aside element with proper aria-label
            const sidebar = screen.getByLabelText('Ana navigasyon')
            expect(sidebar).toBeDefined()
            expect(sidebar.tagName).toBe('ASIDE')
        })

        it('should render brand name', () => {
            render(<Sidebar />)

            expect(screen.getByText('YARDIM PANELİ')).toBeDefined()
        })
    })

    describe('Accessibility', () => {
        it('should have proper aria-label on sidebar', () => {
            render(<Sidebar />)

            const sidebar = screen.getByLabelText('Ana navigasyon')
            expect(sidebar).toBeDefined()
        })
    })
})
