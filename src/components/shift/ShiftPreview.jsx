import React from 'react';
import { useShifts } from '../../context/ShiftContext';
import { formatDate, isShiftExpired } from '../../utils/dateUtils';

const ShiftPreview = ({ shift, onClose, onEdit }) => {
  const { deleteShift } = useShifts();

  if (!shift) return null;

  // Obtener el estado real del turno
  const getShiftRealStatus = (shift) => {
    if (shift.status === 'active' || shift.status === 'completed') {
      return shift.status;
    }
    
    if (isShiftExpired(shift)) {
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
    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    
    let duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // Manejar turnos que cruzan medianoche
    if (duration < 0) {
      duration += 24 * 60; // Agregar 24 horas en minutos
    }
    
    return duration / 60; // Convertir a horas
  };

  const handleDelete = () => {
    // Prevenir eliminación de turnos completados
    if (shift.status === 'completed') {
      alert('⚠️ No se pueden eliminar turnos completados. Los turnos completados se mantienen para el historial y cálculo de métricas.');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este turno? Esta acción no se puede deshacer.')) {
      deleteShift(shift.id);
      onClose();
    }
  };

  const status = getShiftRealStatus(shift);
  const statusInfo = getStatusInfo(status);
  const duration = calculateDuration();
  const actualDuration = shift.actualHours || duration;
  const completedTasks = shift.tasks ? shift.tasks.filter(task => task.completed).length : 0;

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
                    {formatDate(new Date(shift.date), { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">⏰ Horario:</span>
                  <span className="value">{shift.startTime} - {shift.endTime}</span>
                </div>
                <div className="detail-item">
                  <span className="label">⏱️ Duración programada:</span>
                  <span className="value">{duration.toFixed(2)} horas</span>
                </div>
                {shift.actualHours && (
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
                  <span className="value">${shift.earnings.toFixed(2)}</span>
                </div>
                {shift.actualEarnings && (
                  <div className="detail-item">
                    <span className="label">💰 Ganancias reales:</span>
                    <span className="value">${shift.actualEarnings.toFixed(2)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">💵 Tarifa por hora:</span>
                  <span className="value">${shift.hourlyRate.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tiempos reales (si está completado) */}
            {shift.actualStartTime && (
              <div className="shift-preview__section">
                <h3>Horarios reales</h3>
                <div className="shift-preview__details">
                  <div className="detail-item">
                    <span className="label">▶️ Hora de inicio:</span>
                    <span className="value">
                      {new Date(shift.actualStartTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {shift.actualEndTime && (
                    <div className="detail-item">
                      <span className="label">⏹️ Hora de fin:</span>
                      <span className="value">
                        {new Date(shift.actualEndTime).toLocaleTimeString('es-ES', {
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
            {shift.tasks && shift.tasks.length > 0 && (
              <div className="shift-preview__section">
                <h3>Tareas ({completedTasks}/{shift.tasks.length})</h3>
                <div className="shift-preview__tasks">
                  {shift.tasks.map((task, index) => (
                    <div key={index} className={`task-item ${task.completed ? 'completed' : 'pending'}`}>
                      <span className="task-icon">
                        {task.completed ? '✅' : '⏳'}
                      </span>
                      <span className="task-text">{task.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            {shift.notes && (
              <div className="shift-preview__section">
                <h3>Notas</h3>
                <div className="shift-preview__notes">
                  {shift.notes}
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
                  onEdit(shift);
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