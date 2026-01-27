'use client'


import { useEffect, useMemo, useState } from 'react'
import { useCalendarEvents } from '@/hooks/queries/use-calendar'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EventForm } from '@/components/forms/event-form'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { tr } from 'date-fns/locale'

type CalendarEvent = {
  id: string
  title: string
  date: string
  type: string
  time?: string
}

export default function CalendarPage() {
  const initialDate = useMemo(() => new Date('2000-01-01T00:00:00Z'), [])
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [today, setToday] = useState(initialDate)
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now)
    setToday(now)
  }, [])
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const { data: eventsData = [] } = useCalendarEvents({
    date_from: monthStart.toISOString(),
    date_to: monthEnd.toISOString(),
  })
  
  const events: CalendarEvent[] = (eventsData as any[]) || []

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), day))
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-info/10 text-info',
      task: 'bg-success/10 text-success',
      event: 'bg-purple-100 text-purple-700',
      reminder: 'bg-orange-100 text-orange-700',
    }
    return colors[type] || 'bg-muted text-muted-foreground'
  }

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  return (
    <div className="space-y-6">
      <PageHeader
        title="Takvim"
        description="Etkinlikleri ve görevleri takvim üzerinde görüntüleyin"
        icon={CalendarIcon}
        actions={
          <Button
            onClick={() => setIsEventFormOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            data-testid="create-event-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Etkinlik
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Takvim */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentDate, 'MMMM yyyy', { locale: tr })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Bugün
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Hafta günleri */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Takvim günleri */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day)
                const isToday = isSameDay(day, today)
                const isCurrentMonth = isSameMonth(day, currentDate)

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[80px] border rounded-lg p-2 ${
                      isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                    } ${isToday ? 'ring-2 ring-emerald-500' : ''}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-success' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <Badge
                          key={event.id}
                          className={`text-xs w-full justify-start ${getEventTypeColor(event.type)}`}
                        >
                          {event.time && `${event.time} `}
                          {event.title}
                        </Badge>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} daha
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Yaklaşan Etkinlikler */}
        <Card>
          <CardHeader>
            <CardTitle>Yaklaşan Etkinlikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.length > 0 ? (
                events
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.date), 'dd MMM yyyy', { locale: tr })}
                            {event.time && ` • ${event.time}`}
                          </p>
                        </div>
                        <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-8">
                  Yaklaşan etkinlik bulunmuyor
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Creation Dialog */}
      <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
            <DialogDescription>
              Takvim için yeni etkinlik veya toplantı oluşturun
            </DialogDescription>
          </DialogHeader>
          <EventForm onSuccess={() => setIsEventFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
