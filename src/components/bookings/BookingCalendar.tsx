import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface BookingCalendarProps {
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onSelectHours: (hours: number) => void;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedHours: number | null;
  pricePerHour: number;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onSelectDate,
  onSelectTime,
  onSelectHours,
  selectedDate,
  selectedTime,
  selectedHours,
  pricePerHour,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = [];
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      daysInMonth.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysInMonth.push(new Date(year, month, i));
    }

    return daysInMonth;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min of [0, 30]) {
        const time = new Date(0, 0, 0, hour, min);
        const label = time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        const value = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        options.push({ label, value });
      }
    }
    return options;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Date & Time</h3>
          <div className="flex items-center">
            <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <span className="mx-2 font-medium">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
          {daysInMonth.map((date, index) => (
            <div key={index} className="p-1">
              {date ? (
                <button
                  onClick={() => onSelectDate(formatDate(date))}
                  disabled={isPastDate(date)}
                  className={`w-full aspect-square flex items-center justify-center rounded-full text-sm
                    ${isPastDate(date)
                      ? 'text-gray-300 cursor-not-allowed'
                      : formatDate(date) === selectedDate
                      ? 'bg-orange-500 text-white'
                      : isToday(date)
                      ? 'bg-orange-100 text-orange-800'
                      : 'hover:bg-gray-100'
                    }`}
                >
                  {date.getDate()}
                </button>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <>
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Select Duration</h4>
            <div className="grid grid-cols-4 gap-2">
              {hourOptions.map((hours) => (
                <Button
                  key={hours}
                  variant={selectedHours === hours ? 'primary' : 'outline'}
                  onClick={() => onSelectHours(hours)}
                  className="justify-center"
                >
                  {hours}h
                </Button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500 text-center">
              ${pricePerHour} per hour
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Select Start Time</h4>
            <select
              onChange={(e) => onSelectTime(e.target.value)}
              value={selectedTime || ''}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select a time</option>
              {generateTimeOptions().map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingCalendar;
