import React from 'react';
import { formatDate, formatHours } from '../../utils/dateUtils';

const DayDetailsModal = ({ selectedDate, shifts, onClose, onShiftClick, getShiftRealStatus, formatShiftTime, getShiftStatusIcon, getShiftStatusText }) => {
  if (!selectedDate) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content day-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {formatDate(selectedDate, { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </h3>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {shifts.length === 0 ? (
            <div className="day-details__no-shifts">
              📅 No hay turnos programados para este día
            </div>
          ) : (
            <>
              <div className="day-details__shifts-list">
                {shifts.map(shift => (
                  <div 
                    key={shift.id} 
                    className={`day-details__shift-card day-details__shift-card--${getShiftRealStatus(shift)}`}
                    onClick={() => onShiftClick(shift)}
                  >
                    <div className="day-details__shift-header">
                      <span className="shift-status">
                        {getShiftStatusIcon(shift)} {getShiftStatusText(shift)}
                      </span>
                      <span className="shift-time">
                        {formatShiftTime(shift)}
                      </span>
                    </div>

                    <div className="day-details__shift-details">
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
                      <div className="day-details__shift-notes">
                        📝 {shift.notes.substring(0, 50)}
                        {shift.notes.length > 50 && '...'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="day-details__summary">
                <h4>Resumen del día</h4>
                <div className="summary-item">
                  <span className="label">Total turnos:</span>
                  <span className="value">{shifts.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Horas totales:</span>
                  <span className="value">
                    {formatHours(shifts.reduce((sum, shift) => {
                      return sum + (shift.actualHours || shift.hoursWorked || 0);
                    }, 0))}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Ganancias totales:</span>
                  <span className="value">
                    ${shifts.reduce((sum, shift) => {
                      return sum + (shift.actualEarnings || shift.earnings || 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetailsModal;