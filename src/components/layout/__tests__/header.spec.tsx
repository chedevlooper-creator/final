/**
 * Header Component Tests
 * 
 * Note: The Header component uses client-side hydration with a mounted state.
 * These tests focus on the initial skeleton render state.
 * For full integration testing, consider using Playwright or Cypress.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock all dependencies before importing Header
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/dashboard',
}))

// Mock auth hook
const mockSignOut = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user: { id: '1', email: 'test@example.com' },
        profile: { name: 'Test User', role: 'admin' },
        signOut: mockSignOut,
    }),
}))

// Mock UI store
vi.mock('@/stores/ui-store', () => ({
    useUIStore: Object.assign(
        (selector?: (state: { sidebarCollapsed: boolean }) => unknown) => {
            const state = { sidebarCollapsed: false }
            return selector ? selector(state) : state
        },
        {
            getState: () => ({ sidebarCollapsed: false }),
            subscribe: () => () => { },
        }
    ),
}))

// Mock notification dropdown
vi.mock('@/components/layout/notification-dropdown', () => ({
    NotificationDropdown: () => <div data-testid="notification-dropdown">Notifications</div>,
}))

// Mock UI components to avoid rendering issues
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, className, disabled, ...props }: { children: React.ReactNode; className?: string; disabled?: boolean }) => (
        <button className={className} disabled={disabled} {...props}>{children}</button>
    ),
}))

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div className={className} data-testid="avatar">{children}</div>
    ),
    AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <span className={className} data-testid="avatar-fallback">{children}</span>
    ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div role="menu" data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button role="menuitem" onClick={onClick}>{children}</button>
    ),
    DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-label">{children}</div>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Import component after mocks
import { Header } from '../header'

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Initial Render (Skeleton State)', () => {
        it('should render header element with proper structure', () => {
            render(<Header />)

            // Header should always render with proper class structure
            const headers = document.querySelectorAll('header')
            expect(headers.length).toBeGreaterThan(0)
        })

        it('should render search placeholder', () => {
            render(<Header />)

            // Search text should be visible
            expect(screen.getByText('Ara...')).toBeDefined()
        })
    })

    describe('Component Structure', () => {
        it('should have header element in the document', () => {
            const { container } = render(<Header />)

            const headerElement = container.querySelector('header')
            expect(headerElement).not.toBeNull()
        })

        it('should contain search functionality', () => {
            render(<Header />)

            // Search icon or text should exist
            const searchText = screen.queryByText('Ara...')
            expect(searchText).not.toBeNull()
        })
    })
})
