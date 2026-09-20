"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  bannerImage: string | null;
  access: "PUBLIC" | "UNIVERSITY" | "MEMBERS_ONLY" | "INVITE_ONLY";
}

interface EventCalendarProps {
  events: CalendarEvent[];
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCalendarDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: Array<Date | null> = [];

  for (let index = 0; index < firstDay; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function isSameDate(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: string | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getTimeRange(
  startTime: string | null,
  endTime: string | null,
) {
  const start = formatTime(startTime);

  if (!start) {
    return null;
  }

  const end = formatTime(endTime);

  return end ? `${start} – ${end}` : start;
}

export default function EventCalendar({
  events,
}: EventCalendarProps) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const event of events) {
      const eventDate = new Date(event.eventDate);
      const key = dateKey(eventDate);

      const existing = map.get(key) ?? [];

      map.set(key, [...existing, event]);
    }

    return map;
  }, [events]);

  const selectedEvents =
    eventsByDate.get(dateKey(selectedDate)) ?? [];

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  function previousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1,
      ),
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1,
      ),
    );
  }

  function goToToday() {
    const now = new Date();

    setCurrentMonth(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );

    setSelectedDate(now);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          {/* Calendar */}
          <div className="p-5 sm:p-6 lg:border-r lg:border-[var(--border)]">
            <div className="flex items-center gap-2">
              <CalendarDays
                size={20}
                className="text-[var(--primary)]"
              />

              <div>
                <h2 className="text-lg font-bold text-[var(--secondary)]">
                  Event Calendar
                </h2>

                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Find upcoming activities by date.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={previousMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--secondary)] transition-colors hover:bg-[var(--surface)]"
              >
                <ChevronLeft size={16} />
              </button>

              <h3 className="text-base font-bold text-[var(--secondary)]">
                {monthLabel}
              </h3>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--secondary)] transition-colors hover:bg-[var(--surface)]"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mt-5">
              <div className="grid grid-cols-7">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]"
                  >
                    <span className="sm:hidden">
                      {day.charAt(0)}
                    </span>

                    <span className="hidden sm:inline">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="h-10 sm:h-11"
                      />
                    );
                  }

                  const dayEvents =
                    eventsByDate.get(dateKey(date)) ?? [];

                  const isToday = isSameDate(date, today);
                  const isSelected = isSameDate(
                    date,
                    selectedDate,
                  );

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className="flex h-10 flex-col items-center justify-center sm:h-11"
                    >
                      <span
                        className={[
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                          isToday
                            ? "bg-[var(--primary)] !text-white"
                            : isSelected
                              ? "bg-[var(--primary-light)] text-[var(--primary)]"
                              : "text-[var(--secondary)] hover:bg-[var(--surface)]",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="mt-0.5 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((event) => (
                            <span
                              key={event.id}
                              className="h-1 w-1 rounded-full bg-[var(--primary)]"
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Event on this date
              </div>

              <button
                type="button"
                onClick={goToToday}
                className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
              >
                Today
              </button>
            </div>
          </div>

          {/* Selected date */}
          <div className="border-t border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 lg:border-t-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Selected Date
                </p>

                <h3 className="mt-1 text-base font-bold text-[var(--secondary)] sm:text-lg">
                  {formatSelectedDate(selectedDate)}
                </h3>
              </div>

              {selectedEvents.length > 0 && (
                <span className="shrink-0 rounded-full bg-[var(--primary-light)] px-2.5 py-1 text-[10px] font-semibold text-[var(--primary)]">
                  {selectedEvents.length}{" "}
                  {selectedEvents.length === 1
                    ? "event"
                    : "events"}
                </span>
              )}
            </div>

            {selectedEvents.length === 0 ? (
              <div className="mt-5 flex min-h-36 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 text-center">
                <div>
                  <CalendarDays
                    size={25}
                    className="mx-auto text-[var(--muted-light)]"
                  />

                  <p className="mt-3 text-sm font-medium text-[var(--secondary)]">
                    No events scheduled
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Select another date to view events.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {selectedEvents.map((event) => {
                  const timeRange = getTimeRange(
                    event.startTime,
                    event.endTime,
                  );

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group flex gap-3 rounded-lg border border-[var(--border)] bg-white p-3 transition-shadow hover:shadow-sm sm:p-4"
                    >
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--surface)] sm:h-20 sm:w-24">
                        {event.bannerImage ? (
                          <img
                            src={event.bannerImage}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <CalendarDays
                              size={22}
                              className="text-[var(--muted-light)]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-sm font-bold text-[var(--secondary)] transition-colors group-hover:text-[var(--primary)]">
                          {event.title}
                        </h4>

                        {timeRange && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
                            <Clock3 size={12} />

                            <span>{timeRange}</span>
                          </div>
                        )}

                        {event.venue && (
                          <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-[var(--muted)]">
                            <MapPin
                              size={12}
                              className="mt-0.5 shrink-0"
                            />

                            <span className="line-clamp-1">
                              {event.venue}
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight
                        size={17}
                        className="mt-1 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}