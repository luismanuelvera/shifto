import React, { useState } from 'react';

const NotesAndTasks = ({ 
  notes = '', 
  tasks = [], 
  onNotesChange, 
  onTasksChange,
  showTaskCompletion = false 
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [multiTaskMode, setMultiTaskMode] = useState(false);
  const [multiTaskText, setMultiTaskText] = useState('');

  const handleNotesChange = (e) => {
    onNotesChange(e.target.value);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newTaskText.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onTasksChange([...tasks, newTask]);
    setNewTaskText('');
  };

  const addMultipleTasks = () => {
    if (!multiTaskText.trim()) return;

    // Dividir por líneas y filtrar líneas vacías
    const taskTexts = multiTaskText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (taskTexts.length === 0) return;

    const newTasks = taskTexts.map((text, index) => ({
      id: `task_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      text: text,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));

    onTasksChange([...tasks, ...newTasks]);
    setMultiTaskText('');
    setMultiTaskMode(false);
  };

  const removeTask = (taskId) => {
    onTasksChange(tasks.filter(task => task.id !== taskId));
  };

  const getTaskStatusColor = (task) => {
    switch (task.status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'pending';
    }
  };

  const getTaskStatusText = (task) => {
    switch (task.status) {
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="notes-and-tasks">
      {/* Sección de Notas */}
      <div className="notes-and-tasks__section">
        <h3>Notas y recordatorios</h3>
        <textarea
          className="notes-and-tasks__textarea"
          placeholder="Agrega notas, recordatorios o cualquier información importante para este turno..."
          value={notes}
          onChange={handleNotesChange}
          rows={4}
        />
        <small className="notes-and-tasks__help">
          💡 Las notas son para recordatorios generales y información adicional
        </small>
      </div>

      {/* Sección de Tareas */}
      <div className="notes-and-tasks__section">
        <h3>Tareas del día</h3>
        <p className="notes-and-tasks__description">
          Las tareas son actividades específicas que debes completar durante el turno.
          {!showTaskCompletion && ' Al final del día deberás marcarlas como completadas o fallidas.'}
        </p>

        {/* Agregar tareas */}
        <div className="notes-and-tasks__add-controls">
          <div className="notes-and-tasks__mode-toggle">
            <button
              type="button"
              className={`notes-and-tasks__mode-button ${!multiTaskMode ? 'active' : ''}`}
              onClick={() => setMultiTaskMode(false)}
            >
              Una tarea
            </button>
            <button
              type="button"
              className={`notes-and-tasks__mode-button ${multiTaskMode ? 'active' : ''}`}
              onClick={() => setMultiTaskMode(true)}
            >
              Múltiples tareas
            </button>
          </div>

          {!multiTaskMode ? (
            /* Modo de tarea única */
            <div className="notes-and-tasks__add-task">
              <input
                type="text"
                className="notes-and-tasks__task-input"
                placeholder="Escribe una nueva tarea..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTask();
                  }
                }}
              />
              <button
                type="button"
                className="notes-and-tasks__add-button"
                onClick={addTask}
                disabled={!newTaskText.trim()}
              >
                Agregar
              </button>
            </div>
          ) : (
            /* Modo de múltiples tareas */
            <div className="notes-and-tasks__add-multiple">
              <textarea
                className="notes-and-tasks__multi-task-input"
                placeholder="Escribe cada tarea en una línea diferente:&#10;&#10;• Revisar inventario&#10;• Limpiar área de trabajo&#10;• Actualizar reportes&#10;• Atender clientes"
                value={multiTaskText}
                onChange={(e) => setMultiTaskText(e.target.value)}
                rows={6}
              />
              <div className="notes-and-tasks__multi-task-actions">
                <small className="notes-and-tasks__multi-task-help">
                  💡 Escribe una tarea por línea. Se crearán {multiTaskText.split('\n').filter(line => line.trim()).length} tareas
                </small>
                <button
                  type="button"
                  className="notes-and-tasks__add-button"
                  onClick={addMultipleTasks}
                  disabled={!multiTaskText.trim()}
                >
                  Agregar {multiTaskText.split('\n').filter(line => line.trim()).length} tareas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de tareas */}
        <div className="notes-and-tasks__tasks-list">
          {tasks.length === 0 ? (
            <div className="notes-and-tasks__empty">
              📝 No hay tareas agregadas para este turno
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={`notes-and-tasks__task notes-and-tasks__task--${getTaskStatusColor(task)}`}
              >
                <div className="notes-and-tasks__task-content">
                  <span className="notes-and-tasks__task-text">
                    {task.text}
                  </span>
                  <div className="notes-and-tasks__task-status">
                    <span className="notes-and-tasks__task-status-text">
                      {getTaskStatusText(task)}
                    </span>
                  </div>
                </div>

                <div className="notes-and-tasks__task-actions">
                  {!showTaskCompletion && (
                    <button
                      type="button"
                      className="notes-and-tasks__task-action notes-and-tasks__task-action--remove"
                      onClick={() => removeTask(task.id)}
                      title="Eliminar tarea"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {tasks.length > 0 && showTaskCompletion && (
          <div className="notes-and-tasks__task-summary">
            <div className="notes-and-tasks__task-stats">
              <span className="notes-and-tasks__stat">
                Total: {tasks.length}
              </span>
              <span className="notes-and-tasks__stat notes-and-tasks__stat--success">
                Completadas: {tasks.filter(t => t.status === 'completed').length}
              </span>
              <span className="notes-and-tasks__stat notes-and-tasks__stat--error">
                Canceladas: {tasks.filter(t => t.status === 'cancelled').length}
              </span>
              <span className="notes-and-tasks__stat notes-and-tasks__stat--pending">
                Pendientes: {tasks.filter(t => t.status === 'pending').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesAndTasks;