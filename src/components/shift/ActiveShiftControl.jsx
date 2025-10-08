import React, { useState, useEffect } from 'react';
import { useShifts } from '../../context/ShiftContext';
import NotesAndTasks from './NotesAndTasks';
import { formatDate, isShiftExpired, calculateShiftStartDateTime, calculateShiftEndDateTime } from '../../utils/dateUtils';

const ActiveShiftControl = () => {
  const { shifts, activeShift, startShift, endShift, error, clearError } = useShifts();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [endNotes, setEndNotes] = useState('');

  // Actualizar tiempo transcurrido cada segundo
  useEffect(() => {
    let interval;
    
    if (activeShift && activeShift.actualStartTime) {
      interval = setInterval(() => {
        const start = new Date(activeShift.actualStartTime);
        const now = new Date();
        const elapsed = now - start;
        
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeShift]);

  const getTodayShifts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);
      return shiftDate.getTime() === today.getTime();
    });
  };

  const getUpcomingShifts = () => {
    const now = new Date();
    
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate > now && shift.status === 'scheduled';
    }).slice(0, 3); // Mostrar solo los próximos 3
  };

  // Verificar si un turno puede ser iniciado (dentro del rango de tiempo permitido)
  const canStartShift = (shift) => {
    const now = new Date();
    
    // Usar las fechas explícitas del turno si están disponibles
    let shiftStartTime, shiftEndTime;
    
    if (shift.startDate && shift.endDate) {
      shiftStartTime = new Date(shift.startDate);
      shiftEndTime = new Date(shift.endDate);
    } else {
      // Fallback para turnos antiguos - calcular las fechas correctamente
      shiftStartTime = calculateShiftStartDateTime(shift.date, shift.startTime);
      shiftEndTime = calculateShiftEndDateTime(shift.date, shift.startTime, shift.endTime);
    }
    
    // Permitir iniciar el turno hasta 30 minutos antes del inicio y hasta 1 hora después del fin
    const allowStartFrom = new Date(shiftStartTime.getTime() - (30 * 60 * 1000)); // 30 min antes
    const allowStartUntil = new Date(shiftEndTime.getTime() + (60 * 60 * 1000)); // 1 hora después del fin
    
    return now >= allowStartFrom && now <= allowStartUntil;
  };

  // Obtener el estado de un turno
  const getShiftStatus = (shift) => {
    // Si el turno ya fue completado o está activo, mantener su estado
    if (shift.status === 'completed' || shift.status === 'active') {
      return shift.status;
    }
    
    // Usar la función centralizada para determinar si está vencido
    if (isShiftExpired(shift)) {
      return 'expired';
    }
    
    return 'scheduled';
  };

  const getShiftStatusText = (shift) => {
    const status = getShiftStatus(shift);
    switch (status) {
      case 'active': return '🟢 En progreso';
      case 'completed': return '✅ Completado';
      case 'expired': return '⏰ Vencido';
      case 'scheduled': return '📅 Programado';
      default: return '❓ Desconocido';
    }
  };

  const getShiftStatusClass = (shift) => {
    const status = getShiftStatus(shift);
    switch (status) {
      case 'active': return 'active';
      case 'completed': return 'completed';
      case 'expired': return 'expired';
      case 'scheduled': return 'scheduled';
      default: return 'scheduled';
    }
  };

  const handleStartShift = (shiftId) => {
    const success = startShift(shiftId);
    if (success) {
      clearError();
    }
  };

  const handleEndShift = () => {
    if (activeShift) {
      const success = endShift(activeShift.id, endNotes);
      if (success) {
        setEndNotes('');
        clearError();
      }
    }
  };

  const formatShiftTime = (shift) => {
    return `${shift.startTime} - ${shift.endTime}`;
  };

  const formatShiftDate = (date) => {
    return formatDate(new Date(date), { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const todayShifts = getTodayShifts();
  const upcomingShifts = getUpcomingShifts();

  // No mostrar el componente si no hay turnos para hoy
  if (todayShifts.length === 0 && !activeShift) {
    return null;
  }

  return (
    <div className="active-shift-control">
      <div className="active-shift-control__header">
        <h2>Control de turnos</h2>
      </div>

      {error && (
        <div className="active-shift-control__error">
          ⚠️ {error}
        </div>
      )}

      {/* Turno activo */}
      {activeShift ? (
        <div className="active-shift-control__active">
          <div className="active-shift-control__active-header">
            <h3>🟢 Turno en progreso</h3>
            <div className="active-shift-control__elapsed-time">
              {elapsedTime}
            </div>
          </div>
          
          <div className="active-shift-control__active-details">
            <div className="active-shift-control__shift-info">
              <span className="label">Fecha:</span>
              <span className="value">{formatShiftDate(activeShift.date)}</span>
            </div>
            <div className="active-shift-control__shift-info">
              <span className="label">Horario programado:</span>
              <span className="value">{formatShiftTime(activeShift)}</span>
            </div>
            <div className="active-shift-control__shift-info">
              <span className="label">Iniciado a las:</span>
              <span className="value">
                {new Date(activeShift.actualStartTime).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="active-shift-control__shift-info">
              <span className="label">Ganancia estimada:</span>
              <span className="value">${activeShift.earnings}</span>
            </div>
          </div>

          {activeShift.tasks && activeShift.tasks.length > 0 && (
            <div className="active-shift-control__tasks">
              <button
                type="button"
                className="active-shift-control__tasks-button"
                onClick={() => setShowTaskModal(true)}
              >
                📝 Ver tareas del día ({activeShift.tasks.length})
              </button>
            </div>
          )}

          <div className="active-shift-control__end-section">
            <textarea
              className="active-shift-control__end-notes"
              placeholder="Agregar notas del turno (opcional)..."
              value={endNotes}
              onChange={(e) => setEndNotes(e.target.value)}
              rows={3}
            />
            <button
              type="button"
              className="active-shift-control__end-button"
              onClick={handleEndShift}
            >
              ⏹️ Finalizar turno
            </button>
          </div>
        </div>
      ) : (
        /* Turnos disponibles para iniciar */
        <div className="active-shift-control__available">
          <h3>Turnos de hoy</h3>
          
          {todayShifts.length === 0 ? (
            <div className="active-shift-control__empty">
              📅 No tienes turnos programados para hoy
            </div>
          ) : (
            <div className="active-shift-control__shifts-list">
              {todayShifts.map(shift => {
                const shiftStatus = getShiftStatus(shift);
                const canStart = canStartShift(shift);
                
                return (
                  <div key={shift.id} className={`active-shift-control__shift-card active-shift-control__shift-card--${getShiftStatusClass(shift)}`}>
                    <div className="active-shift-control__shift-details">
                      <div className="active-shift-control__shift-status">
                        {getShiftStatusText(shift)}
                      </div>
                      <div className="active-shift-control__shift-time">
                        {formatShiftTime(shift)}
                      </div>
                      <div className="active-shift-control__shift-earnings">
                        ${shift.earnings}
                      </div>
                      {shift.tasks && shift.tasks.length > 0 && (
                        <div className="active-shift-control__shift-tasks">
                          📝 {shift.tasks.length} tareas
                        </div>
                      )}
                    </div>
                    
                    <div className="active-shift-control__shift-actions">
                      {shiftStatus === 'scheduled' && canStart && (
                        <button
                          type="button"
                          className="active-shift-control__start-button"
                          onClick={() => handleStartShift(shift.id)}
                        >
                          ▶️ Iniciar
                        </button>
                      )}
                      {shiftStatus === 'scheduled' && !canStart && (
                        <div className="active-shift-control__cannot-start">
                          <span className="active-shift-control__cannot-start-text">
                            ⏰ Fuera de horario
                          </span>
                          <small>
                            Puedes iniciar desde 30min antes hasta 1h después del fin
                          </small>
                        </div>
                      )}
                      {shiftStatus === 'completed' && (
                        <span className="active-shift-control__completed">
                          ✅ Completado
                        </span>
                      )}
                      {shiftStatus === 'expired' && (
                        <span className="active-shift-control__expired">
                          ⏰ Vencido
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Próximos turnos */}
      {upcomingShifts.length > 0 && (
        <div className="active-shift-control__upcoming">
          <h3>Próximos turnos</h3>
          <div className="active-shift-control__upcoming-list">
            {upcomingShifts.map(shift => (
              <div key={shift.id} className="active-shift-control__upcoming-item">
                <span className="date">{formatShiftDate(shift.date)}</span>
                <span className="time">{formatShiftTime(shift)}</span>
                <span className="earnings">${shift.earnings}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de tareas */}
      {showTaskModal && activeShift && (
        <div className="active-shift-control__modal">
          <div className="active-shift-control__modal-content">
            <div className="active-shift-control__modal-header">
              <h3>Tareas del turno</h3>
              <button
                type="button"
                className="active-shift-control__modal-close"
                onClick={() => setShowTaskModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="active-shift-control__modal-body">
              <NotesAndTasks
                notes={activeShift.notes || ''}
                tasks={activeShift.tasks || []}
                onNotesChange={() => {}} // Solo lectura en el modal
                onTasksChange={() => {}} // Solo lectura en el modal
                showTaskCompletion={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveShiftControl;