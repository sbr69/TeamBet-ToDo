'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    minDate?: string;
    hasError?: boolean;
}

interface TimePickerProps {
    value: string; // HH:MM
    onChange: (time: string) => void;
    hasError?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function DatePicker({ value, onChange, minDate, hasError }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial date or default to today
    const initialDate = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(initialDate); // For navigation
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setView('days'); // Reset view on close
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrev = () => {
        if (view === 'days') {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
        } else if (view === 'years') {
            setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
        } else {
            setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
        }
    };

    const handleNext = () => {
        if (view === 'days') {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
        } else if (view === 'years') {
            setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
        } else {
            setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
        }
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format as YYYY-MM-DD using local time
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dateDay = String(selectedDate.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${dateDay}`;

        onChange(formatted);
        setIsOpen(false);
    };

    const handleMonthClick = (monthIndex: number) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setView('days');
    };

    const handleYearClick = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setView('months');
    };

    const isDateDisabled = (day: number) => {
        if (!minDate) return false;
        const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const min = new Date(minDate);
        // Reset times for purely date comparison
        current.setHours(0, 0, 0, 0);
        min.setHours(0, 0, 0, 0);
        return current < min;
    };

    const isSelected = (day: number) => {
        if (!value) return false;
        const selected = new Date(value);
        return selected.getDate() === day &&
            selected.getMonth() === viewDate.getMonth() &&
            selected.getFullYear() === viewDate.getFullYear();
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear();
    };

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    // Generate years for year view
    const currentYear = viewDate.getFullYear();
    const startYear = currentYear - (currentYear % 12);
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 bg-zinc-800 border rounded-xl transition-all",
                    "text-white focus:outline-none focus:ring-2",
                    hasError ? "border-red-500 focus:ring-red-500/50" : isOpen ? "border-green-500 ring-2 ring-green-500/50 focus:ring-green-500/50" : "border-zinc-700 hover:border-zinc-600 focus:ring-green-500/50"
                )}
            >
                <CalendarIcon className="w-4 h-4 text-zinc-400" />
                <span className={value ? "text-white" : "text-zinc-500"}>
                    {value ? new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "Select Date"}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 bottom-full mb-2 w-[320px] p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={handlePrev} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex gap-1 font-semibold text-white">
                                <button
                                    onClick={() => setView(view === 'months' ? 'days' : 'months')}
                                    className="px-2 py-1 hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    {view === 'years' ? `${startYear} - ${startYear + 11}` : MONTHS[viewDate.getMonth()]}
                                </button>
                                {view !== 'years' && (
                                    <button
                                        onClick={() => setView('years')}
                                        className="px-2 py-1 hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        {viewDate.getFullYear()}
                                    </button>
                                )}
                            </div>
                            <button onClick={handleNext} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Views */}
                        <div className="relative h-[240px]">
                            {/* Days View */}
                            {view === 'days' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="absolute inset-0"
                                >
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {DAYS.map(day => (
                                            <div key={day} className="text-center text-xs font-medium text-zinc-500 py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {blanks.map(i => <div key={`blank-${i}`} />)}
                                        {days.map(day => {
                                            const disabled = isDateDisabled(day);
                                            const selected = isSelected(day);
                                            const today = isToday(day);

                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => !disabled && handleDateClick(day)}
                                                    disabled={disabled}
                                                    className={clsx(
                                                        "w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all",
                                                        selected
                                                            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                                            : disabled
                                                                ? "text-zinc-700 cursor-not-allowed"
                                                                : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                                                        today && !selected && "border border-zinc-700 bg-zinc-800/50"
                                                    )}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Months View */}
                            {view === 'months' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="grid grid-cols-3 gap-2 h-full content-start"
                                >
                                    {MONTHS.map((month, index) => {
                                        const isCurrentMonth = new Date().getMonth() === index && new Date().getFullYear() === viewDate.getFullYear();
                                        const isSelectedMonth = viewDate.getMonth() === index;

                                        return (
                                            <button
                                                key={month}
                                                onClick={() => handleMonthClick(index)}
                                                className={clsx(
                                                    "p-3 rounded-lg text-sm font-medium transition-all",
                                                    isSelectedMonth
                                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                                                    isCurrentMonth && !isSelectedMonth && "border border-zinc-700 bg-zinc-800/50"
                                                )}
                                            >
                                                {month.slice(0, 3)}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}

                            {/* Years View */}
                            {view === 'years' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="grid grid-cols-3 gap-2 h-full content-start"
                                >
                                    {years.map(year => {
                                        const isCurrentYear = new Date().getFullYear() === year;
                                        const isSelectedYear = viewDate.getFullYear() === year;

                                        return (
                                            <button
                                                key={year}
                                                onClick={() => handleYearClick(year)}
                                                className={clsx(
                                                    "p-3 rounded-lg text-sm font-medium transition-all",
                                                    isSelectedYear
                                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                                                    isCurrentYear && !isSelectedYear && "border border-zinc-700 bg-zinc-800/50"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function TimePicker({ value, onChange, hasError }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial parsing
    const [hours, minutes] = value ? value.split(':') : ['00', '00'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const handleTimeSelect = (h: string, m: string) => {
        onChange(`${h}:${m}`);
        // Don't close immediately, let user pick both? 
        // Or simplified: Just update.
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-32 flex items-center justify-between gap-2 px-4 py-3 bg-zinc-800 border rounded-xl transition-all",
                    "text-white focus:outline-none focus:ring-2",
                    hasError ? "border-red-500 focus:ring-red-500/50" : isOpen ? "border-green-500 ring-2 ring-green-500/50 focus:ring-green-500/50" : "border-zinc-700 hover:border-zinc-600 focus:ring-green-500/50"
                )}
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{value || "00:00"}</span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 bottom-full mb-2 w-64 p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 flex gap-4"
                    >
                        <div className="flex-1">
                            <div className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider text-center">Hours</div>
                            <div className="h-48 overflow-y-auto no-scrollbar space-y-1">
                                {HOURS.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => handleTimeSelect(h, minutes)}
                                        className={clsx(
                                            "w-full px-2 py-1.5 rounded-lg text-sm transition-colors",
                                            h === hours
                                                ? "bg-green-500 text-white"
                                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        )}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-[1px] bg-zinc-800" />
                        <div className="flex-1">
                            <div className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider text-center">Minutes</div>
                            <div className="h-48 overflow-y-auto no-scrollbar space-y-1">
                                {MINUTES.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleTimeSelect(hours, m)}
                                        className={clsx(
                                            "w-full px-2 py-1.5 rounded-lg text-sm transition-colors",
                                            m === minutes
                                                ? "bg-green-500 text-white"
                                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

