import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useShifts } from '../../context/ShiftContext';
import DateSelector from './DateSelector';
import TimeScheduler from './TimeScheduler';
import NotesAndTasks from './NotesAndTasks';
import RateConfiguration from '../user/RateConfiguration';
import { isWeekend } from '../../utils/dateUtils';

const CreateShift = ({ onClose, onShiftCreated }) => {
  const { config } = useUser();
  const { shifts, addShift, error: shiftError, clearError } = useShifts();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeData, setTimeData] = useState({
    startTime: '',
    endTime: ''
  });
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showRateConfig, setShowRateConfig] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar si necesitamos configurar tarifas
  useEffect(() => {
    if (!config.hasConfiguredRates) {
      setShowRateConfig(true);
    }
  }, [config.hasConfiguredRates]);

  // Obtener turnos de la fecha seleccionada
  const getShiftsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.toDateString() === selectedDate.toDateString();
    });
  };

  // Obtener próximos turnos (siguiente semana)
  const getUpcomingShifts = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= now && shiftDate <= nextWeek && shift.status === 'scheduled';
    }).slice(0, 5); // Mostrar solo los próximos 5
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    clearError();
  };

  const handleTimeChange = (newTimeData) => {
    setTimeData(newTimeData);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !timeData.startTime || !timeData.endTime) {
      return;
    }

    setIsSubmitting(true);

    // Determinar la tarifa apropiada
    const hourlyRate = isWeekend(selectedDate) 
      ? config.weekendRate 
      : config.weekdayRate;

    const shiftData = {
      date: selectedDate,
      startTime: timeData.startTime,
      endTime: timeData.endTime,
      hourlyRate,
      notes,
      tasks: tasks.map(task => ({
        ...task,
        completed: false,
        failed: false
      }))
    };

    const success = addShift(shiftData, config);
    
    if (success) {
      // Limpiar formulario
      setSelectedDate(null);
      setTimeData({ startTime: '', endTime: '' });
      setNotes('');
      setTasks([]);
      
      if (onShiftCreated) {
        onShiftCreated();
      }
      
      if (onClose) {
        onClose();
      }
    }

    setIsSubmitting(false);
  };

  const canSubmit = () => {
    return (
      selectedDate &&
      timeData.startTime &&
      timeData.endTime &&
      config.hasConfiguredRates &&
      !isSubmitting
    );
  };

  if (showRateConfig) {
    return (
      <RateConfiguration
        isFirstTime={!config.hasConfiguredRates}
        onClose={() => setShowRateConfig(false)}
      />
    );
  }

  return (
    <div className="create-shift">
      <div className="create-shift__overlay">
        <div className="create-shift__modal">
          <div className="create-shift__header">
            <h2>Crear nuevo turno</h2>
            {onClose && (
              <button
                type="button"
                className="create-shift__close"
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="create-shift__form">
            {shiftError && (
              <div className="create-shift__error">
                ⚠️ {shiftError}
              </div>
            )}

            {/* Selector de fecha */}
            <div className="create-shift__section">
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                allowRange={false}
              />
              
              {/* Mostrar turnos existentes para la fecha seleccionada */}
              {selectedDate && getShiftsForSelectedDate().length > 0 && (
                <div className="create-shift__existing-shifts">
                  <h4>⚠️ Ya tienes turnos para este día:</h4>
                  <div className="create-shift__existing-shifts-list">
                    {getShiftsForSelectedDate().map(shift => (
                      <div key={shift.id} className="create-shift__existing-shift">
                        <span className="time">{shift.startTime} - {shift.endTime}</span>
                        <span className="earnings">${shift.earnings}</span>
                        <span className={`status status--${shift.status}`}>
                          {shift.status === 'scheduled' && '📅 Programado'}
                          {shift.status === 'active' && '🟢 Activo'}
                          {shift.status === 'completed' && '✅ Completado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vista previa de próximos turnos */}
            {!selectedDate && getUpcomingShifts().length > 0 && (
              <div className="create-shift__section">
                <div className="create-shift__upcoming-preview">
                  <h4>📅 Tus próximos turnos programados:</h4>
                  <div className="create-shift__upcoming-list">
                    {getUpcomingShifts().map(shift => {
                      const shiftDate = new Date(shift.date);
                      return (
                        <div key={shift.id} className="create-shift__upcoming-shift">
                          <span className="date">
                            {shiftDate.toLocaleDateString('es-ES', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                          <span className="time">{shift.startTime} - {shift.endTime}</span>
                          <span className="earnings">${shift.earnings}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Programador de horarios */}
            {selectedDate && (
              <div className="create-shift__section">
                <TimeScheduler
                  startTime={timeData.startTime}
                  endTime={timeData.endTime}
                  onTimeChange={handleTimeChange}
                  selectedDate={selectedDate}
                  userConfig={config}
                  showCalculations={true}
                />
              </div>
            )}

            {/* Notas y tareas */}
            {selectedDate && timeData.startTime && timeData.endTime && (
              <div className="create-shift__section">
                <NotesAndTasks
                  notes={notes}
                  tasks={tasks}
                  onNotesChange={setNotes}
                  onTasksChange={setTasks}
                  showTaskCompletion={false}
                />
              </div>
            )}

            {/* Acciones */}
            <div className="create-shift__actions">
              <div className="create-shift__rate-info">
                <button
                  type="button"
                  className="create-shift__rate-button"
                  onClick={() => setShowRateConfig(true)}
                >
                  ⚙️ Configurar tarifas
                </button>
                {config.hasConfiguredRates && (
                  <small>
                    Tarifa actual: ${config.weekdayRate}/hora (sem.) | ${config.weekendRate}/hora (f.s.)
                  </small>
                )}
              </div>

              <div className="create-shift__submit-area">
                {onClose && (
                  <button
                    type="button"
                    className="create-shift__button create-shift__button--secondary"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="create-shift__button create-shift__button--primary"
                  disabled={!canSubmit()}
                >
                  {isSubmitting ? 'Guardando...' : 'Crear turno'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateShift;