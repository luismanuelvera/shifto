import React, { useState, useEffect } from 'react';
import { validateTimeFormat } from '../../utils/validation';
import { calculateHoursWorked, isWeekend } from '../../utils/dateUtils';

const TimeScheduler = ({ 
  startTime, 
  endTime, 
  onTimeChange, 
  selectedDate, 
  userConfig,
  showCalculations = true,
  isOvernightShift = false,
  onOvernightChange 
}) => {
  const [timeData, setTimeData] = useState({
    startTime: startTime || '',
    endTime: endTime || ''
  });
  const [errors, setErrors] = useState({});
  const [calculations, setCalculations] = useState(null);
  const [showOvernightDialog, setShowOvernightDialog] = useState(false);
  const [isOvernight, setIsOvernight] = useState(isOvernightShift);

  useEffect(() => {
    setTimeData({
      startTime: startTime || '',
      endTime: endTime || ''
    });
    setIsOvernight(isOvernightShift);
  }, [startTime, endTime, isOvernightShift]);

  // Detectar si el horario podría ser overnight
  const detectOvernightShift = (start, end) => {
    if (!start || !end) return false;
    
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes < startMinutes;
  };

  const validateTime = (field, value) => {
    const newErrors = { ...errors };

    if (!value) {
      newErrors[field] = 'Este campo es requerido';
    } else if (!validateTimeFormat(value)) {
      newErrors[field] = 'Formato inválido (HH:MM)';
    } else {
      delete newErrors[field];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDisplayData = (start, end, date, overnight = false) => {
    if (!start || !end || !date) return null;

    try {
      let hours;
      
      if (overnight) {
        // Calcular horas para turno overnight
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        // Agregar 24 horas (1440 minutos) al tiempo de fin
        hours = (endMinutes + 1440 - startMinutes) / 60;
      } else {
        hours = calculateHoursWorked(start, end, date);
      }
      
      const isWeekendDay = isWeekend(date);
      const rate = isWeekendDay ? userConfig?.weekendRate : userConfig?.weekdayRate;
      const earnings = rate ? hours * rate : null;

      return {
        hours: hours.toFixed(2),
        isWeekend: isWeekendDay,
        rate,
        earnings: earnings ? earnings.toFixed(2) : null,
        isOvernight: overnight
      };
    } catch (error) {
      return { error: error.message };
    }
  };

  const handleTimeChange = (field, value) => {
    const newTimeData = {
      ...timeData,
      [field]: value
    };

    setTimeData(newTimeData);

    // Validar el campo individual
    validateTime(field, value);

    // Si ambos campos están llenos, verificar y calcular
    if (newTimeData.startTime && newTimeData.endTime && selectedDate) {
      const isOvernightDetected = detectOvernightShift(newTimeData.startTime, newTimeData.endTime);
      
      // Si se detecta overnight y no estamos ya en modo overnight, preguntar al usuario
      if (isOvernightDetected && !isOvernight && !showOvernightDialog) {
        setShowOvernightDialog(true);
        return; // No calcular hasta que el usuario decida
      }
      
      // Si no es overnight o ya estamos en modo overnight, calcular normalmente
      const calc = calculateDisplayData(
        newTimeData.startTime, 
        newTimeData.endTime, 
        selectedDate,
        isOvernight || isOvernightDetected
      );
      setCalculations(calc);
    } else {
      setCalculations(null);
    }

    // Notificar al componente padre
    onTimeChange({
      ...newTimeData,
      isOvernight: isOvernight
    });
  };

  const handleOvernightChoice = (choice) => {
    setShowOvernightDialog(false);
    setIsOvernight(choice);
    
    if (onOvernightChange) {
      onOvernightChange(choice);
    }
    
    // Recalcular con la elección del usuario
    if (timeData.startTime && timeData.endTime && selectedDate) {
      const calc = calculateDisplayData(
        timeData.startTime, 
        timeData.endTime, 
        selectedDate,
        choice
      );
      setCalculations(calc);
    }
    
    // Notificar al componente padre
    onTimeChange({
      ...timeData,
      isOvernight: choice
    });
  };

  const getTimeInputClass = (field) => {
    let classes = 'time-scheduler__input';
    if (errors[field]) classes += ' time-scheduler__input--error';
    return classes;
  };

  return (
    <div className="time-scheduler">
      <h3>Horarios de trabajo</h3>
      
      <div className="time-scheduler__inputs">
        <div className="time-scheduler__field">
          <label htmlFor="start-time">Hora de entrada</label>
          <input
            type="time"
            id="start-time"
            value={timeData.startTime}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            className={getTimeInputClass('startTime')}
          />
          {errors.startTime && (
            <span className="time-scheduler__error">
              {errors.startTime}
            </span>
          )}
        </div>

        <div className="time-scheduler__field">
          <label htmlFor="end-time">Hora de salida</label>
          <input
            type="time"
            id="end-time"
            value={timeData.endTime}
            onChange={(e) => handleTimeChange('endTime', e.target.value)}
            className={getTimeInputClass('endTime')}
          />
          {errors.endTime && (
            <span className="time-scheduler__error">
              {errors.endTime}
            </span>
          )}
        </div>
      </div>

      {showCalculations && calculations && (
        <div className="time-scheduler__calculations">
          {calculations.error ? (
            <div className="time-scheduler__error">
              ⚠️ {calculations.error}
            </div>
          ) : (
            <div className="time-scheduler__summary">
              <div className="time-scheduler__summary-item">
                <span className="label">Horas de trabajo:</span>
                <span className="value">{calculations.hours} horas</span>
              </div>
              
              {calculations.rate && (
                <>
                  <div className="time-scheduler__summary-item">
                    <span className="label">
                      Tarifa ({calculations.isWeekend ? 'fin de semana' : 'día de semana'}):
                    </span>
                    <span className="value">${calculations.rate}/hora</span>
                  </div>
                  
                  <div className="time-scheduler__summary-item time-scheduler__summary-item--total">
                    <span className="label">Ganancia estimada:</span>
                    <span className="value">${calculations.earnings}</span>
                  </div>
                </>
              )}
              
              {!calculations.rate && (
                <div className="time-scheduler__note">
                  💡 Configura tus tarifas para ver la ganancia estimada
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedDate && (
        <div className="time-scheduler__date-info">
          <small>
            📅 {isWeekend(selectedDate) ? 'Fin de semana' : 'Día de semana'} - 
            {selectedDate.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </small>
        </div>
      )}
      
      {isOvernight && (
        <div className="time-scheduler__overnight-indicator">
          <span className="overnight-badge">🌙 Turno nocturno (2 días)</span>
        </div>
      )}
      
      {/* Diálogo de confirmación para turnos overnight */}
      {showOvernightDialog && (
        <div className="time-scheduler__overnight-dialog">
          <div className="overnight-dialog__content">
            <h4>🌙 Turno nocturno detectado</h4>
            <p>
              La hora de salida ({timeData.endTime}) es anterior a la hora de entrada ({timeData.startTime}).
              ¿Te gustaría crear un turno nocturno que se extienda al día siguiente?
            </p>
            <div className="overnight-dialog__actions">
              <button
                type="button"
                className="overnight-dialog__button overnight-dialog__button--primary"
                onClick={() => handleOvernightChoice(true)}
              >
                ✅ Sí, turno nocturno
              </button>
              <button
                type="button"
                className="overnight-dialog__button overnight-dialog__button--secondary"
                onClick={() => handleOvernightChoice(false)}
              >
                ❌ No, corregir horarios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeScheduler;