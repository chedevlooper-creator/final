'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartData {
    label: string
    value: number
    color?: string
}

interface SimpleBarChartProps {
    title: string
    data: ChartData[]
    height?: number
}

export function SimpleBarChart({ title, data, height = 200 }: SimpleBarChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value))

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3" style={{ minHeight: height }}>
                    {data.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.label}</span>
                                <span className="font-medium">{item.value.toLocaleString('tr-TR')}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                        backgroundColor: item.color || `hsl(${160 + idx * 30}, 70%, 50%)`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

interface SimplePieChartProps {
    title: string
    data: ChartData[]
    size?: number
}

export function SimplePieChart({ title, data, size = 160 }: SimplePieChartProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    let cumulativePercent = 0

    const segments = data.map((item, idx) => {
        const percent = (item.value / total) * 100
        const startPercent = cumulativePercent
        cumulativePercent += percent

        return {
            ...item,
            percent,
            startPercent,
            color: item.color || colors[idx % colors.length],
        }
    })

    // Create conic gradient
    const gradientStops = segments
        .map((s) => `${s.color} ${s.startPercent}% ${s.startPercent + s.percent}%`)
        .join(', ')

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
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
                    <div className="space-y-2 flex-1">
                        {segments.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-600">{item.label}</span>
                                </div>
                                <span className="font-medium">{item.percent.toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface TrendChartProps {
    title: string
    data: ChartData[]
    height?: number
    color?: string
}

export function TrendChart({ title, data, height = 120, color = '#10b981' }: TrendChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value))
    const minValue = Math.min(...data.map((d) => d.value))
    const range = maxValue - minValue || 1

    const points = data.map((d, idx) => {
        const x = (idx / (data.length - 1)) * 100
        const y = 100 - ((d.value - minValue) / range) * 80
        return { x, y, ...d }
    })

    const pathD = points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ')

    const areaD = `${pathD} L 100 100 L 0 100 Z`

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height }}>
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        {/* Area */}
                        <path
                            d={areaD}
                            fill={color}
                            fillOpacity={0.1}
                        />
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
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    {data.map((d, idx) => (
                        <span key={idx}>{d.label}</span>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
