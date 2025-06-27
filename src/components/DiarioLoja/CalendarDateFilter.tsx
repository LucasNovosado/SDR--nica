import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarDateFilter.css';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface CalendarDateFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const CalendarDateFilter: React.FC<CalendarDateFilterProps> = ({
  onDateRangeChange,
  initialStartDate,
  initialEndDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate ? new Date(initialStartDate) : null,
    endDate: initialEndDate ? new Date(initialEndDate) : null
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Adicionar dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      // Primeira seleção ou resetar seleção
      setDateRange({ startDate: date, endDate: null });
    } else if (date < dateRange.startDate) {
      // Data anterior à data de início - trocar
      setDateRange({ startDate: date, endDate: dateRange.startDate });
    } else {
      // Segunda seleção - definir fim
      const newRange = { startDate: dateRange.startDate, endDate: date };
      setDateRange(newRange);
      
      // Chamar callback
      onDateRangeChange(
        newRange.startDate!.toISOString().split('T')[0],
        newRange.endDate!.toISOString().split('T')[0]
      );
      
      setIsOpen(false);
    }
  };

  const isDateInRange = (date: Date) => {
    if (!dateRange.startDate) return false;
    
    const endDate = hoverDate && !dateRange.endDate ? hoverDate : dateRange.endDate;
    if (!endDate) return false;

    const start = dateRange.startDate;
    const end = endDate;

    return date >= start && date <= end;
  };

  const isDateSelected = (date: Date) => {
    return (dateRange.startDate && date.getTime() === dateRange.startDate.getTime()) ||
           (dateRange.endDate && date.getTime() === dateRange.endDate.getTime());
  };

  const formatDateRange = () => {
    if (!dateRange.startDate) return 'Selecionar período';
    
    if (!dateRange.endDate) {
      return dateRange.startDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }

    return `${dateRange.startDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })} - ${dateRange.endDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`calendar-filter-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <div 
        className="calendar-filter-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="filter-icon">
          <Filter size={18} />
        </div>
        <span className="date-range-text">{formatDateRange()}</span>
        <div className="calendar-icon">
          <Calendar size={16} />
        </div>
      </div>

      {isOpen && (
        <>
          <div className="calendar-overlay" onClick={() => setIsOpen(false)} />
          <div className="calendar-dropdown">
            <div className="calendar-header">
              <button 
                className="nav-button"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft size={20} />
              </button>
              
              <h3 className="month-year">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button 
                className="nav-button"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-grid">
              <div className="day-headers">
                {dayNames.map(day => (
                  <div key={day} className="day-header">
                    {day}
                  </div>
                ))}
              </div>

              <div className="days-grid">
                {days.map((date, index) => (
                  <div
                    key={index}
                    className={`day-cell ${
                      !date ? 'empty' : 
                      isDateSelected(date) ? 'selected' :
                      isDateInRange(date) ? 'in-range' : ''
                    }`}
                    onClick={() => date && handleDateClick(date)}
                    onMouseEnter={() => date && setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    {date && date.getDate()}
                  </div>
                ))}
              </div>
            </div>

            {dateRange.startDate && !dateRange.endDate && (
              <div className="calendar-footer">
                <p className="instruction-text">
                  Selecione a data final
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarDateFilter