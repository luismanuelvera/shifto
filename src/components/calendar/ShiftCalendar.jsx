import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useShifts } from '../../context/ShiftContext';
import { formatDate, getShiftDateRangeFromShift, isShiftExpired, formatHours } from '../../utils/dateUtils';
import ShiftPreview from '../shift/ShiftPreview';
import DayDetailsModal from './DayDetailsModal';

const ShiftCalendar = ({ onShiftClick }) => {
  const { shifts } = useShifts();
  const [selectedDate, setSelectedDate] = useState(null);
  const [previewShift, setPreviewShift] = useState(null);
  const [showDayDetails, setShowDayDetails] = useState(false);

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
    if (hasCompleted) classes.push('has-completed');
    if (hasExpired) classes.push('has-expired');
    if (hasScheduled) classes.push('has-scheduled');

    return classes.join(' ');
  };

  // Obtener contenido para mostrar en las celdas del calendario
  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dayShifts = getShiftsForDate(date);
    if (dayShifts.length === 0) return null;

    // Mostrar indicadores para cada estado de turno
    const statusCounts = {
      active: dayShifts.filter(shift => getShiftRealStatus(shift) === 'active').length,
      completed: dayShifts.filter(shift => getShiftRealStatus(shift) === 'completed').length,
      expired: dayShifts.filter(shift => getShiftRealStatus(shift) === 'expired').length,
      scheduled: dayShifts.filter(shift => getShiftRealStatus(shift) === 'scheduled').length
    };

    const totalEarnings = dayShifts.reduce((sum, shift) => {
      return sum + (shift.actualEarnings || shift.earnings || 0);
    }, 0);

    return (
      <div className="calendar-tile-content">
        <div className="shift-indicators">
        </div>
      </div>
    );
  };

  // Manejar click en el calendario
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dayShifts = getShiftsForDate(date);
    if (dayShifts.length > 0) {
      setShowDayDetails(true);
    }
  };

  const getSelectedDateShifts = () => {
    if (!selectedDate) return [];
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

      {/* Calendario principal sin panel lateral */}
      <div className="shift-calendar__calendar-only">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          tileClassName={getTileClassName}
          tileContent={getTileContent}
          locale="es-ES"
          className="shifto-calendar shifto-calendar--full-width"
        />
      </div>
      
      {/* Modal de detalles del día */}
      {showDayDetails && selectedDate && (
        <DayDetailsModal
          selectedDate={selectedDate}
          shifts={selectedDateShifts}
          onClose={() => setShowDayDetails(false)}
          onShiftClick={handleShiftClick}
          getShiftRealStatus={getShiftRealStatus}
          formatShiftTime={formatShiftTime}
          getShiftStatusIcon={getShiftStatusIcon}
          getShiftStatusText={getShiftStatusText}
        />
      )}

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