import React from 'react';
import ShiftCalendar from '../components/calendar/ShiftCalendar';
import '../styles/calendar.css';

const Calendar = () => {
  return (
    <div className="calendar-page">
      <div className="calendar-page__header">
        <h1>Calendario de Turnos</h1>
        <p>Visualiza y gestiona todos tus turnos en el calendario</p>
      </div>
      
      <div className="calendar-page__content">
        <ShiftCalendar />
      </div>
    </div>
  );
};

export default Calendar;