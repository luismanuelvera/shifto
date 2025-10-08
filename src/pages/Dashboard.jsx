import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useShifts } from '../context/ShiftContext';
import { isShiftExpired, formatHours } from '../utils/dateUtils';
import CreateShift from '../components/shift/CreateShift';
import ActiveShiftControl from '../components/shift/ActiveShiftControl';
import RateConfiguration from '../components/user/RateConfiguration';
import ShiftPreview from '../components/shift/ShiftPreview';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { config } = useUser();
  const { shifts, activeShift, clearAllShifts } = useShifts();
  const [showCreateShift, setShowCreateShift] = useState(false);
  const [showRateConfig, setShowRateConfig] = useState(false);
  const [previewShift, setPreviewShift] = useState(null);

  const calculateTotalEarnings = () => {
    return shifts
      .filter(shift => !isShiftExpired(shift))
      .reduce((total, shift) => {
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
      .filter(shift => !isShiftExpired(shift))
      .reduce((total, shift) => {
        const hours = shift.actualHours || shift.hoursWorked || 0;
        return total + hours;
      }, 0);
  };

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

  const getNextShifts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        return shift.status === 'scheduled' && shiftDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Buenos días.';
    if (hour < 18) return '☀️ Buenas tardes.';
    return '🌙 Buenas noches.';
  };

  const nextShifts = getNextShifts();
  const totalEarnings = calculateTotalEarnings();
  const completedShifts = getCompletedShifts();
  const scheduledShifts = getScheduledShifts();
  const totalWorkedHours = getTotalWorkedHours();

  if (showCreateShift) {
    return (
      <CreateShift
        onShiftCreated={handleShiftCreated}
        onClose={() => setShowCreateShift(false)}
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

        {/* Resumen básico de rendimiento */}
        {completedShifts.length > 0 && (
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h3>📊 Resumen de rendimiento</h3>
              <p>Ganancias reales basadas en tiempo trabajado: ${getActualEarnings().toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Control de turnos activos */}
        <div className="dashboard__section">
          <ActiveShiftControl />
        </div>

        {/* Acciones rápidas */}
        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <h3>⚡ Acciones rápidas</h3>
          </div>
          <div className="dashboard__quick-actions">
            <button
              className="quick-action-card"
              onClick={() => setShowRateConfig(true)}
            >
              <div className="quick-action-icon">⚙️</div>
              <div className="quick-action-content">
                <h4>Configurar tarifa</h4>
                <p>Ajusta tu tarifa por hora</p>
              </div>
            </button>
            
            <button
              className="quick-action-card quick-action-card--danger"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas borrar todos los turnos? Esta acción no se puede deshacer.')) {
                  clearAllShifts();
                }
              }}
            >
              <div className="quick-action-icon">🗑️</div>
              <div className="quick-action-content">
                <h4>Borrar todos los turnos</h4>
                <p>Elimina todos los turnos permanentemente</p>
              </div>
            </button>
          </div>
        </div>

        {/* Próximos turnos */}
        {nextShifts.length > 0 && (
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h3>📅 Próximos turnos</h3>
            </div>
            <div className="dashboard__upcoming-shifts">
              {nextShifts.map(shift => (
                <div
                  key={shift.id}
                  className="upcoming-shift-card"
                  onClick={() => setPreviewShift(shift)}
                >
                  <div className="upcoming-shift-time">
                    <div className="upcoming-shift-date">
                      {new Date(shift.date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div className="upcoming-shift-hours">
                      {shift.startTime} - {shift.endTime}
                    </div>
                  </div>
                  <div className="upcoming-shift-details">
                    <div className="upcoming-shift-company">{shift.company}</div>
                    <div className="upcoming-shift-location">{shift.location}</div>
                  </div>
                  <div className="upcoming-shift-earnings">
                    ${shift.earnings?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Si no hay turnos programados */}
        {nextShifts.length === 0 && scheduledShifts.length === 0 && (
          <div className="dashboard__section">
            <div className="dashboard__empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No hay turnos programados</h3>
              <p>¡Perfecto momento para programar tu próximo turno!</p>
              <button
                className="dashboard__action-button dashboard__action-button--primary"
                onClick={() => setShowCreateShift(true)}
              >
                ➕ Crear primer turno
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview del turno */}
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