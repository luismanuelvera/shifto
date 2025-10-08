import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useShifts } from '../context/ShiftContext';
import { isShiftExpired, formatHours } from '../utils/dateUtils';
import CreateShift from '../components/shift/CreateShift';
import ActiveShiftControl from '../components/shift/ActiveShiftControl';
import RateConfiguration from '../components/user/RateConfiguration';
import ShiftPreview from '../components/shift/ShiftPreview';

const Dashboard = () => {
  const { config } = useUser();
  const { shifts, activeShift, clearAllShifts } = useShifts();
  const [showCreateShift, setShowCreateShift] = useState(false);
  const [showRateConfig, setShowRateConfig] = useState(false);
  const [previewShift, setPreviewShift] = useState(null);

  const calculateTotalEarnings = () => {
    return shifts
      .filter(shift => !isShiftExpired(shift)) // Excluir turnos vencidos
      .reduce((total, shift) => {
        // Priorizar ganancias basadas en tiempo real trabajado
        const earnings = shift.actualEarnings || shift.earnings || 0;
        return total + earnings;
      }, 0);
  };

  const getCompletedShifts = () => {
    return shifts.filter(shift => shift.status === 'completed');
  };

  const getScheduledShifts = () => {
    return shifts.filter(shift => shift.status === 'scheduled' && !isShiftExpired(shift));
  };

  const getTotalWorkedHours = () => {
    return shifts
      .filter(shift => !isShiftExpired(shift)) // Excluir turnos vencidos
      .reduce((total, shift) => {
        // Priorizar horas reales trabajadas
        const hours = shift.actualHours || shift.hoursWorked || 0;
        return total + hours;
      }, 0);
  };

  // Nueva función para calcular solo ganancias de turnos completados (tiempo real)
  const getActualEarnings = () => {
    return shifts
      .filter(shift => shift.status === 'completed')
      .reduce((total, shift) => {
        return total + (shift.actualEarnings || 0);
      }, 0);
  };

  const handleShiftCreated = () => {
    setShowCreateShift(false);
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los turnos? Esta acción no se puede deshacer.')) {
      clearAllShifts();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  const completedShifts = getCompletedShifts();
  const scheduledShifts = getScheduledShifts();
  const totalEarnings = calculateTotalEarnings();
  const totalWorkedHours = getTotalWorkedHours();
  const actualEarnings = getActualEarnings();
  const earningsComparison = getEarningsComparison();
  const timeMetrics = getTimeMetrics();
  const punctualityMetrics = getPunctualityMetrics();

  if (showCreateShift) {
    return (
      <CreateShift
        onClose={() => setShowCreateShift(false)}
        onShiftCreated={handleShiftCreated}
      />
    );
  }

  if (showRateConfig) {
    return (
      <RateConfiguration
        onClose={() => setShowRateConfig(false)}
      />
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__title">
          <h1>Dashboard</h1>
          <p>{getGreeting()} Organiza tus turnos de forma inteligente.</p>
        </div>
        
        <div className="dashboard__actions">
          <button
            className="dashboard__action-button dashboard__action-button--primary"
            onClick={() => setShowCreateShift(true)}
          >
            ➕ Nuevo turno
          </button>
        </div>
      </div>

      <div className="dashboard__content">
        {/* Estadísticas generales */}
        <div className="dashboard__stats">
          <div className="dashboard__stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">${totalEarnings.toFixed(2)}</div>
              <div className="stat-label">Ganancias totales</div>
            </div>
          </div>
          
          <div className="dashboard__stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{completedShifts.length}</div>
              <div className="stat-label">Turnos completados</div>
            </div>
          </div>
          
          <div className="dashboard__stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">{scheduledShifts.length}</div>
              <div className="stat-label">Turnos programados</div>
            </div>
          </div>
          
          <div className="dashboard__stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">
                {formatHours(totalWorkedHours)}
              </div>
              <div className="stat-label">Horas trabajadas</div>
            </div>
          </div>
        </div>

        {/* Métricas avanzadas - Solo mostrar si hay turnos completados */}
        {completedShifts.length > 0 && (
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h3>📊 Resumen de rendimiento</h3>
              <p>Ganancias reales basadas en tiempo trabajado: ${getActualEarnings().toFixed(2)}</p>
            </div>
          </div>
        )}
                    <div className="metric-item">
                      <span className="metric-label">Reales:</span>
                      <span className="metric-value">${earningsComparison.actual.toFixed(2)}</span>
                    </div>
                    <div className="metric-item metric-item--highlight">
                      <span className="metric-label">Diferencia:</span>
                      <span className={`metric-value ${earningsComparison.difference >= 0 ? 'positive' : 'negative'}`}>
                        {earningsComparison.difference > 0 ? '+' : ''}${earningsComparison.difference.toFixed(2)}
                      <span className="metric-label">Diferencia:</span>
                      <span className={`metric-value ${earningsComparison.difference >= 0 ? 'positive' : 'negative'}`}>
                        {earningsComparison.difference > 0 ? '+' : ''}${Math.abs(earningsComparison.difference).toFixed(2)}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Rendimiento:</span>
                      <span className="metric-value">{earningsComparison.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas de puntualidad */}
              {punctualityMetrics && (
                <div className="metric-card">
                  <div className="metric-card__header">
                    <h4>🎯 Puntualidad</h4>
                  </div>
                  <div className="metric-card__content">
                    <div className="metric-comparison">
                      <div className="metric-item">
                        <span className="metric-label">A tiempo:</span>
                        <span className="metric-value">{punctualityMetrics.onTime}/{punctualityMetrics.total}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Puntualidad:</span>
                        <span className="metric-value">{punctualityMetrics.onTimePercentage.toFixed(1)}%</span>
                      </div>
                      {punctualityMetrics.late > 0 && (
                        <div className="metric-item">
                          <span className="metric-label">Retraso promedio:</span>
                          <span className="metric-value negative">{punctualityMetrics.averageDelay.toFixed(1)} min</span>
                        </div>
                      )}
                      <div className="metric-item">
                        <span className="metric-label">Tarde/Temprano:</span>
                        <span className="metric-value">{punctualityMetrics.late}/{punctualityMetrics.early}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Control de turnos activos */}
        <div className="dashboard__section">
          <ActiveShiftControl />
        </div>

        {/* Acciones rápidas */}
        <div className="dashboard__section">
          <div className="dashboard__quick-actions">
            <h3>Acciones rápidas</h3>
            <div className="dashboard__action-buttons">
              <button
                className="dashboard__action-button"
                onClick={() => setShowCreateShift(true)}
              >
                ➕ Crear nuevo turno
              </button>
              <button
                className="dashboard__action-button"
                onClick={() => setShowRateConfig(true)}
              >
                ⚙️ Configurar tarifas
              </button>
              {shifts.length > 0 && (
                <button
                  className="dashboard__action-button dashboard__action-button--danger"
                  onClick={handleClearAll}
                >
                  🗑️ Borrar todos los turnos
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de bienvenida si no hay turnos */}
        {shifts.length === 0 && (
          <div className="dashboard__welcome">
            <div className="dashboard__welcome-content">
              <h3>¡Bienvenido a Shifto! 🎉</h3>
              <p>
                Parece que es tu primera vez aquí. Shifto te ayuda a organizar tus turnos de trabajo,
                calcular tus ganancias y gestionar tus tareas diarias.
              </p>
              <div className="dashboard__welcome-features">
                <div className="feature">
                  <span className="feature-icon">📅</span>
                  <span className="feature-text">Programar turnos con fechas y horarios</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💰</span>
                  <span className="feature-text">Calcular ganancias automáticamente</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📝</span>
                  <span className="feature-text">Gestionar tareas y notas</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">⏰</span>
                  <span className="feature-text">Controlar turnos en tiempo real</span>
                </div>
              </div>
              <button
                className="dashboard__welcome-button"
                onClick={() => setShowCreateShift(true)}
              >
                Crear mi primer turno
              </button>
            </div>
          </div>
        )}
      </div>
      
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

export default Dashboard;