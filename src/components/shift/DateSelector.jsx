import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { formatDate } from '../../utils/dateUtils';

const DateSelector = ({ selectedDate, onDateChange, allowRange = false }) => {
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' | 'range'

  const handleDateChange = (date) => {
    if (allowRange && selectionMode === 'range') {
      // Para rangos, date puede ser un array [startDate, endDate] o una fecha individual
      onDateChange(date);
    } else {
      // Para fecha única
      onDateChange(date);
    }
  };

  const handleModeChange = (mode) => {
    setSelectionMode(mode);
    // Limpiar selección cuando cambiamos de modo
    onDateChange(null);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    
    if (Array.isArray(selectedDate)) {
      const [start, end] = selectedDate;
      if (start && end) {
        return `${formatDate(start, { month: 'short', day: 'numeric' })} - ${formatDate(end, { month: 'short', day: 'numeric' })}`;
      } else if (start) {
        return `Desde: ${formatDate(start, { month: 'short', day: 'numeric' })}`;
      }
    } else {
      return formatDate(selectedDate);
    }
    
    return '';
  };

  return (
    <div className="date-selector">
      <div className="date-selector__header">
        <h3>Seleccionar fecha{allowRange && selectionMode === 'range' ? 's' : ''}</h3>
        
        {allowRange && (
          <div className="date-selector__mode-toggle">
            <button
              type="button"
              className={`date-selector__mode-button ${selectionMode === 'single' ? 'active' : ''}`}
              onClick={() => handleModeChange('single')}
            >
              Día único
            </button>
            <button
              type="button"
              className={`date-selector__mode-button ${selectionMode === 'range' ? 'active' : ''}`}
              onClick={() => handleModeChange('range')}
            >
              Rango de días
            </button>
          </div>
        )}
      </div>

      <div className="date-selector__calendar">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          selectRange={allowRange && selectionMode === 'range'}
          minDate={new Date()} // No permitir fechas pasadas
          locale="es-ES"
          className="shifto-calendar"
        />
      </div>

      {selectedDate && (
        <div className="date-selector__selected">
          <strong>Fecha seleccionada:</strong>
          <span className="date-selector__selected-text">
            {formatSelectedDate()}
          </span>
        </div>
      )}

      {allowRange && selectionMode === 'range' && (
        <div className="date-selector__help">
          <small>
            💡 Selecciona el primer día, luego el último día para crear un rango de turnos
          </small>
        </div>
      )}
    </div>
  );
};

export default DateSelector;