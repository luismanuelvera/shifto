import React, { useMemo } from 'react';
import { useShifts } from '../../context/ShiftContext';
import { formatDate, isShiftExpired } from '../../utils/dateUtils';
import TaskManager from '../tasks/TaskManager';

const ShiftPreview = ({ shift, onClose, onEdit }) => {
  const { deleteShift, updateShift, shifts } = useShifts();

  // Obtener la versión más actualizada del turno desde el contexto
  const currentShift = useMemo(() => {
    const foundShift = shifts.find(s => s.id === shift?.id);
    return foundShift || shift;
  }, [shifts, shift]);

  if (!currentShift) return null;

  // Función para actualizar las tareas del turno
  const handleTaskUpdate = (updatedTasks) => {
    const updatedShift = {
      ...currentShift,
      tasks: updatedTasks
    };
    updateShift(updatedShift);
  };

  // Obtener el estado real del turno
  const getShiftRealStatus = (shiftData) => {
    if (shiftData.status === 'active' || shiftData.status === 'completed') {
      return shiftData.status;
    }
    
    if (isShiftExpired(shiftData)) {
      return 'expired';
    }
    
    return 'scheduled';
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'scheduled':
        return { icon: '📅', text: 'Programado', color: '#f59e0b' };
      case 'active':
        return { icon: '🟢', text: 'En progreso', color: '#10b981' };
      case 'completed':
        return { icon: '✅', text: 'Completado', color: '#3b82f6' };
      case 'expired':
        return { icon: '⏰', text: 'Vencido', color: '#ef4444' };
      default:
        return { icon: '❓', text: 'Desconocido', color: '#6b7280' };
    }
  };

  const calculateDuration = () => {
    const [startHour, startMinute] = currentShift.startTime.split(':').map(Number);
    const [endHour, endMinute] = currentShift.endTime.split(':').map(Number);
    
    let duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // Manejar turnos que cruzan medianoche
    if (duration < 0) {
      duration += 24 * 60; // Agregar 24 horas en minutos
    }
    
    return duration / 60; // Convertir a horas
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este turno?')) {
      deleteShift(currentShift.id);
      onClose();
    }
  };

  const status = getShiftRealStatus(currentShift);
  const statusInfo = getStatusInfo(status);
  const duration = calculateDuration();
  const actualDuration = currentShift.actualHours || duration;

  return (
    <div className="shift-preview">
      <div className="shift-preview__overlay" onClick={onClose}>
        <div className="shift-preview__modal" onClick={(e) => e.stopPropagation()}>
          <div className="shift-preview__header">
            <div className="shift-preview__title">
              <h2>Detalles del turno</h2>
              <div 
                className="shift-preview__status"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.icon} {statusInfo.text}
              </div>
            </div>
            <button
              type="button"
              className="shift-preview__close-button"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="shift-preview__content">
            {/* Información básica */}
            <div className="shift-preview__section">
              <h3>Información general</h3>
              <div className="shift-preview__details">
                <div className="detail-item">
                  <span className="label">📅 Fecha:</span>
                  <span className="value">
                    {formatDate(new Date(currentShift.date), { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">⏰ Horario:</span>
                  <span className="value">{currentShift.startTime} - {currentShift.endTime}</span>
                </div>
                <div className="detail-item">
                  <span className="label">⏱️ Duración programada:</span>
                  <span className="value">{duration.toFixed(2)} horas</span>
                </div>
                {currentShift.actualHours && (
                  <div className="detail-item">
                    <span className="label">⏱️ Duración real:</span>
                    <span className="value">{actualDuration.toFixed(2)} horas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ganancias */}
            <div className="shift-preview__section">
              <h3>Ganancias</h3>
              <div className="shift-preview__details">
                <div className="detail-item">
                  <span className="label">💰 Ganancias programadas:</span>
                  <span className="value">${currentShift.earnings.toFixed(2)}</span>
                </div>
                {currentShift.actualEarnings && (
                  <div className="detail-item">
                    <span className="label">💰 Ganancias reales:</span>
                    <span className="value">${currentShift.actualEarnings.toFixed(2)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">💵 Tarifa por hora:</span>
                  <span className="value">${currentShift.hourlyRate.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tiempos reales (si está completado) */}
            {currentShift.actualStartTime && (
              <div className="shift-preview__section">
                <h3>Horarios reales</h3>
                <div className="shift-preview__details">
                  <div className="detail-item">
                    <span className="label">▶️ Hora de inicio:</span>
                    <span className="value">
                      {new Date(currentShift.actualStartTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {currentShift.actualEndTime && (
                    <div className="detail-item">
                      <span className="label">⏹️ Hora de fin:</span>
                      <span className="value">
                        {new Date(currentShift.actualEndTime).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tareas */}
            <div className="shift-preview__section">
              <h3>Tareas {currentShift.tasks && currentShift.tasks.length > 0 && `(${currentShift.tasks.filter(task => task.status === 'completed').length}/${currentShift.tasks.length})`}</h3>
              <TaskManager 
                tasks={currentShift.tasks || []}
                onTaskUpdate={handleTaskUpdate}
                editable={getShiftRealStatus(currentShift) === 'active' || getShiftRealStatus(currentShift) === 'scheduled'}
              />
            </div>

            {/* Notas */}
            {currentShift.notes && (
              <div className="shift-preview__section">
                <h3>Notas</h3>
                <div className="shift-preview__notes">
                  {currentShift.notes}
                </div>
              </div>
            )}
          </div>

          <div className="shift-preview__actions">
            {status === 'scheduled' && onEdit && (
              <button
                type="button"
                className="shift-preview__action-button shift-preview__action-button--primary"
                onClick={() => {
                  onEdit(currentShift);
                  onClose();
                }}
              >
                ✏️ Editar turno
              </button>
            )}
            {status !== 'active' && status !== 'completed' && (
              <button
                type="button"
                className="shift-preview__action-button shift-preview__action-button--danger"
                onClick={handleDelete}
              >
                🗑️ Eliminar turno
              </button>
            )}
            <button
              type="button"
              className="shift-preview__action-button shift-preview__action-button--secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftPreview;