import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useShifts } from '../../context/ShiftContext';
import { formatDate, getShiftDateRangeFromShift, isShiftExpired, formatHours } from '../../utils/dateUtils';
import ShiftPreview from '../shift/ShiftPreview';

const ShiftCalendar = ({ onShiftClick }) => {
  const { shifts } = useShifts();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [previewShift, setPreviewShift] = useState(null);

  // Obtener el estado real del turno incluyendo vencido
  const getShiftRealStatus = (shift) => {
    if (shift.status === 'active' || shift.status === 'completed') {
      return shift.status;
    }
    
    if (isShiftExpired(shift)) {
      return 'expired';
    }
    
    return 'scheduled';
  };

  // Obtener turnos para una fecha específica
  const getShiftsForDate = (date) => {
    return shifts.filter(shift => {
      const shiftDates = getShiftDateRangeFromShift(shift);
      return shiftDates.some(shiftDate => 
        shiftDate.toDateString() === date.toDateString()
      );
    });
  };

  // Obtener clase CSS para una fecha del calendario
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return null;

    const dayShifts = getShiftsForDate(date);
    if (dayShifts.length === 0) return null;

    const classes = ['has-shifts'];
    
    // Agregar clases basadas en el estado de los turnos
    const hasActive = dayShifts.some(shift => getShiftRealStatus(shift) === 'active');
    const hasCompleted = dayShifts.some(shift => getShiftRealStatus(shift) === 'completed');
    const hasExpired = dayShifts.some(shift => getShiftRealStatus(shift) === 'expired');
    const hasScheduled = dayShifts.some(shift => getShiftRealStatus(shift) === 'scheduled');

    if (hasActive) classes.push('has-active');
    else if (hasCompleted) classes.push('has-completed');
    else if (hasExpired) classes.push('has-expired');
    else if (hasScheduled) classes.push('has-scheduled');

    return classes.join(' ');
  };

  // Contenido adicional para cada día
  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dayShifts = getShiftsForDate(date);
    if (dayShifts.length === 0) return null;

    const totalEarnings = dayShifts.reduce((sum, shift) => {
      return sum + (shift.actualEarnings || shift.earnings || 0);
    }, 0);

    const hasOvernightShifts = dayShifts.some(shift => shift.isOvernight);

    return (
      <div className="calendar-tile-content">
        <div className="shift-count">
          {dayShifts.length} turno{dayShifts.length !== 1 ? 's' : ''}
          {hasOvernightShifts && <span className="overnight-indicator">🌙</span>}
        </div>
        {totalEarnings > 0 && (
          <div className="shift-earnings">
            ${totalEarnings.toFixed(0)}
          </div>
        )}
      </div>
    );
  };

  // Manejar click en una fecha
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dayShifts = getShiftsForDate(date);
    if (dayShifts.length > 0 && onShiftClick) {
      onShiftClick(date, dayShifts);
    }
  };

  const getSelectedDateShifts = () => {
    return getShiftsForDate(selectedDate);
  };

  const formatShiftTime = (shift) => {
    return `${shift.startTime} - ${shift.endTime}`;
  };

  const getShiftStatusIcon = (shift) => {
    const status = getShiftRealStatus(shift);
    switch (status) {
      case 'active': return '🟢';
      case 'completed': return '✅';
      case 'expired': return '⏰';
      case 'scheduled': return '📅';
      default: return '📅';
    }
  };

  const getShiftStatusText = (shift) => {
    const status = getShiftRealStatus(shift);
    switch (status) {
      case 'active': return 'En progreso';
      case 'completed': return 'Completado';
      case 'expired': return 'Vencido';
      case 'scheduled': return 'Programado';
      default: return 'Desconocido';
    }
  };

  const handleShiftClick = (shift) => {
    setPreviewShift(shift);
  };

  const selectedDateShifts = getSelectedDateShifts();

  return (
    <div className="shift-calendar">
      <div className="shift-calendar__header">
        <h2>Calendario de turnos</h2>
        <div className="shift-calendar__legend">
          <span className="legend-item legend-item--scheduled">📅 Programado</span>
          <span className="legend-item legend-item--active">🟢 Activo</span>
          <span className="legend-item legend-item--completed">✅ Completado</span>
          <span className="legend-item legend-item--expired">⏰ Vencido</span>
        </div>
      </div>

      <div className="shift-calendar__container">
        <div className="shift-calendar__calendar">
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileClassName={getTileClassName}
            tileContent={getTileContent}
            locale="es-ES"
            className="shifto-calendar shifto-calendar--detailed"
          />
        </div>

        <div className="shift-calendar__details">
          <h3>
            {formatDate(selectedDate, { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </h3>

          {selectedDateShifts.length === 0 ? (
            <div className="shift-calendar__no-shifts">
              📅 No hay turnos programados para este día
            </div>
          ) : (
            <div className="shift-calendar__shifts-list">
              {selectedDateShifts.map(shift => (
                <div 
                  key={shift.id} 
                  className={`shift-calendar__shift-card shift-calendar__shift-card--${getShiftRealStatus(shift)}`}
                  onClick={() => handleShiftClick(shift)}
                >
                  <div className="shift-calendar__shift-header">
                    <span className="shift-status">
                      {getShiftStatusIcon(shift)} {getShiftStatusText(shift)}
                    </span>
                    <span className="shift-time">
                      {formatShiftTime(shift)}
                    </span>
                  </div>

                  <div className="shift-calendar__shift-details">
                    <div className="shift-detail">
                      <span className="label">Horas:</span>
                      <span className="value">
                        {shift.actualHours 
                          ? formatHours(shift.actualHours)
                          : formatHours(shift.hoursWorked)
                        }
                      </span>
                    </div>
                    <div className="shift-detail">
                      <span className="label">Ganancias:</span>
                      <span className="value">
                        ${shift.actualEarnings 
                          ? shift.actualEarnings.toFixed(2) 
                          : shift.earnings.toFixed(2)
                        }
                      </span>
                    </div>
                    {shift.tasks && shift.tasks.length > 0 && (
                      <div className="shift-detail">
                        <span className="label">Tareas:</span>
                        <span className="value">
                          {shift.tasks.filter(t => t.completed).length}/{shift.tasks.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {shift.notes && (
                    <div className="shift-calendar__shift-notes">
                      📝 {shift.notes.substring(0, 50)}
                      {shift.notes.length > 50 && '...'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedDateShifts.length > 0 && (
            <div className="shift-calendar__day-summary">
              <div className="summary-item">
                <span className="label">Total turnos:</span>
                <span className="value">{selectedDateShifts.length}</span>
              </div>
              <div className="summary-item">
                <span className="label">Horas totales:</span>
                <span className="value">
                  {formatHours(selectedDateShifts.reduce((sum, shift) => {
                    return sum + (shift.actualHours || shift.hoursWorked || 0);
                  }, 0))}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Ganancias totales:</span>
                <span className="value">
                  ${selectedDateShifts.reduce((sum, shift) => {
                    return sum + (shift.actualEarnings || shift.earnings || 0);
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de preview del turno */}
      {previewShift && (
        <ShiftPreview
          shift={previewShift}
          onClose={() => setPreviewShift(null)}
        />
      )}
    </div>
  );
};

export default ShiftCalendar;