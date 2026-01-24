import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// CSS değişkenlerini kullanan chart renkleri
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
]

interface ChartData {
    label: string
    value: number
    color?: string
}

// Helper to get value from data item using key
function getValue<T>(item: T, key: string): string | number {
    return (item as Record<string, string | number>)[key]
}

interface SimpleBarChartProps<T = ChartData> {
    title?: string
    data: T[]
    height?: number
    labelKey?: string
    valueKey?: string
    color?: string
    horizontal?: boolean
}

export const SimpleBarChart = memo(function SimpleBarChart<T = ChartData>({ 
    title, 
    data, 
    height = 200,
    labelKey = 'label',
    valueKey = 'value',
    color,
    horizontal: _horizontal = false,
}: SimpleBarChartProps<T>) {
    const values = data.map((d) => Number(getValue(d, valueKey)))
    const maxValue = Math.max(...values)

    const content = (
        <div className="space-y-3" style={{ minHeight: height }}>
            {data.map((item, idx) => {
                const label = String(getValue(item, labelKey))
                const value = Number(getValue(item, valueKey))
                const itemColor = (item as ChartData).color || color || CHART_COLORS[idx % CHART_COLORS.length]
                
                return (
                    <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium">{value.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(value / maxValue) * 100}%`,
                                    backgroundColor: itemColor,
                                }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )

    if (!title) return content

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    )
})

interface SimplePieChartProps<T = ChartData> {
    title?: string
    data: T[]
    size?: number
    height?: number
    labelKey?: string
    valueKey?: string
    showLegend?: boolean
}

export const SimplePieChart = memo(function SimplePieChart<T = ChartData>({ 
    title, 
    data, 
    size = 160,
    height,
    labelKey = 'label',
    valueKey = 'value',
    showLegend = true,
}: SimplePieChartProps<T>) {
    const defaultColors = CHART_COLORS
    const total = data.reduce((sum, d) => sum + Number(getValue(d, valueKey)), 0)

    const segments = data.map((item, idx) => {
        const value = Number(getValue(item, valueKey))
        const label = String(getValue(item, labelKey))
        const percent = (value / total) * 100
        // Calculate cumulative from all previous items
        const startPercent = data.slice(0, idx).reduce((sum, d) => 
            sum + (Number(getValue(d, valueKey)) / total) * 100, 0)

        return {
            label,
            value,
            percent,
            startPercent,
            color: (item as ChartData).color || defaultColors[idx % defaultColors.length],
        }
    })

    // Create conic gradient
    const gradientStops = segments
        .map((s) => `${s.color} ${s.startPercent}% ${s.startPercent + s.percent}%`)
        .join(', ')

    const content = (
        <div className="flex items-center gap-6" style={height ? { height } : undefined}>
            {/* Pie */}
            <div
                className="rounded-full flex-shrink-0"
                style={{
                    width: size,
                    height: size,
                    background: `conic-gradient(${gradientStops})`,
                }}
            />

            {/* Legend */}
            {showLegend && (
                <div className="space-y-2 flex-1 max-h-full overflow-auto">
                    {segments.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-muted-foreground truncate">{item.label}</span>
                            </div>
                            <span className="font-medium flex-shrink-0">{item.percent.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    if (!title) return content

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    )
})

interface TrendChartProps<T = ChartData> {
    title?: string
    data: T[]
    height?: number
    color?: string
    labelKey?: string
    valueKey?: string
    showArea?: boolean
    formatValue?: (value: number) => string
}

export const TrendChart = memo(function TrendChart<T = ChartData>({ 
    title, 
    data, 
    height = 120, 
    color = 'hsl(var(--success))',
    labelKey = 'label',
    valueKey = 'value',
    showArea = true,
    formatValue,
}: TrendChartProps<T>) {
    const values = data.map((d) => Number(getValue(d, valueKey)))
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const range = maxValue - minValue || 1

    const points = data.map((d, idx) => {
        const value = Number(getValue(d, valueKey))
        const label = String(getValue(d, labelKey))
        const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50
        const y = 100 - ((value - minValue) / range) * 80
        return { x, y, label, value }
    })

    const pathD = points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ')

    const areaD = `${pathD} L 100 100 L 0 100 Z`

    const content = (
        <>
            <div style={{ height: height - 40 }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    {/* Area */}
                    {showArea && (
                        <path
                            d={areaD}
                            fill={color}
                            fillOpacity={0.1}
                        />
                    )}
                    {/* Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        vectorEffect="non-scaling-stroke"
                    />
                    {/* Points */}
                    {points.map((p, idx) => (
                        <circle
                            key={idx}
                            cx={p.x}
                            cy={p.y}
                            r={3}
                            fill={color}
                            vectorEffect="non-scaling-stroke"
                        />
                    ))}
                </svg>
            </div>
            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {points.map((p, idx) => (
                    <div key={idx} className="text-center">
                        <div>{p.label}</div>
                        {formatValue && (
                            <div className="font-medium text-foreground">{formatValue(p.value)}</div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )

    if (!title) return <div style={{ height }}>{content}</div>

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    )
})
