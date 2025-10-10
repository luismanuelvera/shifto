import React, { useState } from 'react';

const TaskManager = ({ tasks, onTaskUpdate, editable = false }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const handleTaskComplete = (taskIndex) => {
    console.log('Completando tarea:', taskIndex, tasks[taskIndex]);
    const updatedTasks = tasks.map((task, index) => {
      if (index === taskIndex) {
        return {
          ...task,
          completed: true,
          status: 'completed',
          completedAt: new Date().toISOString()
        };
      }
      return task;
    });
    console.log('Tareas actualizadas:', updatedTasks);
    onTaskUpdate(updatedTasks);
  };

  const handleTaskCancel = (taskIndex) => {
    if (!cancellationReason.trim()) {
      alert('Por favor, proporciona una razón para cancelar la tarea');
      return;
    }

    const updatedTasks = tasks.map((task, index) => {
      if (index === taskIndex) {
        return {
          ...task,
          completed: false,
          failed: true,
          status: 'cancelled',
          cancellationReason: cancellationReason,
          failureReason: cancellationReason, // Mantener compatibilidad
          cancelledAt: new Date().toISOString()
        };
      }
      return task;
    });
    onTaskUpdate(updatedTasks);
    setEditingTask(null);
    setCancellationReason('');
  };

  const handleTaskReset = (taskIndex) => {
    const updatedTasks = tasks.map((task, index) => {
      if (index === taskIndex) {
        return {
          ...task,
          completed: false,
          failed: false,
          status: 'pending',
          cancellationReason: undefined,
          failureReason: undefined,
          completedAt: undefined,
          cancelledAt: undefined
        };
      }
      return task;
    });
    onTaskUpdate(updatedTasks);
  };

  const getTaskIcon = (task) => {
    if (task.status === 'completed' || (task.completed && !task.failed)) return '✅';
    if (task.status === 'cancelled' || task.failed) return '❌';
    return '⏳';
  };

  const getTaskStatusText = (task) => {
    if (task.status === 'completed' || (task.completed && !task.failed)) return 'Completada';
    if (task.status === 'cancelled' || task.failed) return 'Cancelada';
    return 'Pendiente';
  };

  const getTaskStatus = (task) => {
    if (task.status) return task.status;
    if (task.completed && !task.failed) return 'completed';
    if (task.failed) return 'cancelled';
    return 'pending';
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-manager__empty">
        📋 No hay tareas asignadas para este turno
      </div>
    );
  }

  return (
    <div className="task-manager">
      <div className="task-manager__list">
        {tasks.map((task, index) => {
          const taskStatus = getTaskStatus(task);
          return (
            <div 
              key={task.id || index} 
              className={`task-manager__item task-manager__item--${taskStatus}`}
            >
              <div className="task-manager__item-header">
                <div className="task-manager__item-info">
                  <span className="task-manager__icon">
                    {getTaskIcon(task)}
                  </span>
                  <span className="task-manager__text">{task.text}</span>
                </div>
                
                <div className="task-manager__status">
                  <span className={`status-badge status-badge--${taskStatus}`}>
                    {getTaskStatusText(task)}
                  </span>
                </div>
              </div>

              {/* Botones de acción - solo para tareas pendientes y si es editable */}
              {editable && taskStatus === 'pending' && (
                <div className="task-manager__actions">
                  <button
                    className="task-action-btn task-action-btn--complete"
                    onClick={() => handleTaskComplete(index)}
                    title="Marcar como completada"
                  >
                    ✓ Completar
                  </button>
                  <button
                    className="task-action-btn task-action-btn--cancel"
                    onClick={() => setEditingTask(index)}
                    title="Cancelar tarea"
                  >
                    ✗ Cancelar
                  </button>
                </div>
              )}

              {/* Botón de reset para tareas completadas/canceladas */}
              {editable && (taskStatus === 'completed' || taskStatus === 'cancelled') && (
                <div className="task-manager__actions">
                  <button
                    className="task-action-btn task-action-btn--reset"
                    onClick={() => handleTaskReset(index)}
                    title="Restaurar tarea"
                  >
                    ↺ Restaurar
                  </button>
                </div>
              )}

              {/* Razón de cancelación */}
              {(task.cancellationReason || task.failureReason) && (
                <div className="task-manager__cancellation">
                  <span className="cancellation-label">Razón:</span>
                  <span className="cancellation-reason">{task.cancellationReason || task.failureReason}</span>
                </div>
              )}

              {/* Timestamps */}
              {(task.completedAt || task.cancelledAt) && (
                <div className="task-manager__timestamp">
                  {task.completedAt && (
                    <span className="timestamp">
                      Completada: {new Date(task.completedAt).toLocaleString()}
                    </span>
                  )}
                  {task.cancelledAt && (
                    <span className="timestamp">
                      Cancelada: {new Date(task.cancelledAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para cancelar tarea */}
      {editingTask !== null && (
        <div className="task-cancellation-modal">
          <div className="modal-overlay" onClick={() => setEditingTask(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Cancelar tarea</h3>
                <button 
                  className="modal-close"
                  onClick={() => setEditingTask(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="task-to-cancel">
                  <strong>Tarea a cancelar:</strong>
                  <p>"{tasks[editingTask]?.text}"</p>
                </div>
                
                <div className="form-field">
                  <label htmlFor="cancellation-reason">
                    Razón de cancelación <span className="required">*</span>
                  </label>
                  <textarea
                    id="cancellation-reason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Explica por qué no se pudo completar esta tarea..."
                    rows={4}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => setEditingTask(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleTaskCancel(editingTask)}
                  disabled={!cancellationReason.trim()}
                >
                  Confirmar cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;