import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { BarChart3 } from 'lucide-react'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BarChart3: () => <div data-testid="bar-chart-icon">Chart</div>,
}))

describe('StatCard Component - Basic Tests', () => {
  it('should be importable', () => {
    const StatCardModule = require('@/components/common/stat-card')
    expect(StatCardModule).toBeDefined()
  })

  it('should export StatCard', () => {
    const { StatCard } = require('@/components/common/stat-card')
    expect(StatCard).toBeDefined()
  })

  it('should be a memoized component', () => {
    const { StatCard } = require('@/components/common/stat-card')
    expect(typeof StatCard).toBe('object')
    expect(StatCard.$$typeof).toBeDefined()
  })
})

describe('StatCard - Simple Rendering', () => {
  it('should render without crashing when imported dynamically', async () => {
    const { StatCard } = await import('@/components/common/stat-card')
    
    const { container } = render(
      <StatCard
        title="Test Card"
        value="100"
        icon={BarChart3}
      />
    )
    
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('StatCard Props Validation', () => {
  it('should accept title prop', async () => {
    const { StatCard } = await import('@/components/common/stat-card')
    expect(StatCard.propTypes || StatCard.toString()).toContain('title')
  })

  it('should accept value prop', async () => {
    const { StatCard } = await import('@/components/common/stat-card')
    expect(StatCard.propTypes || StatCard.toString()).toContain('value')
  })
})
