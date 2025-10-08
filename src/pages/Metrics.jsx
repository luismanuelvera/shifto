import React from 'react';
import { useUser } from '../context/UserContext';
import { useShifts } from '../context/ShiftContext';
import { isShiftExpired, formatHours } from '../utils/dateUtils';
import '../styles/metrics.css';

const Metrics = () => {
  const { config } = useUser();
  const { shifts } = useShifts();

  // Función para métricas de tiempo asignado vs trabajado
  const getTimeMetrics = () => {
    const completedShifts = shifts.filter(shift => shift.status === 'completed');
    
    const scheduledHours = completedShifts.reduce((total, shift) => {
      return total + (shift.hoursWorked || 0);
    }, 0);
    
    const actualHours = completedShifts.reduce((total, shift) => {
      return total + (shift.actualHours || 0);
    }, 0);
    
    const difference = actualHours - scheduledHours;
    const efficiency = scheduledHours > 0 ? ((actualHours / scheduledHours) * 100) : 0;
    
    return {
      scheduled: scheduledHours,
      actual: actualHours,
      difference,
      efficiency,
      isOvertime: difference > 0,
      isUndertime: difference < 0
    };
  };

  // Función para métricas de ganancias programadas vs reales
  const getEarningsComparison = () => {
    const completedShifts = shifts.filter(shift => shift.status === 'completed');
    
    const scheduledEarnings = completedShifts.reduce((total, shift) => {
      return total + (shift.earnings || 0);
    }, 0);
    
    const actualEarnings = completedShifts.reduce((total, shift) => {
      return total + (shift.actualEarnings || shift.earnings || 0);
    }, 0);
    
    const difference = actualEarnings - scheduledEarnings;
    
    return {
      scheduled: scheduledEarnings,
      actual: actualEarnings,
      difference,
      percentage: scheduledEarnings > 0 ? ((actualEarnings / scheduledEarnings) * 100) : 0
    };
  };

  // Función para métricas de puntualidad
  const getPunctualityMetrics = () => {
    const completedShifts = shifts.filter(shift => 
      shift.status === 'completed' && shift.actualStartTime
    );
    
    if (completedShifts.length === 0) {
      return {
        onTimeCount: 0,
        lateCount: 0,
        earlyCount: 0,
        onTimePercentage: 0,
        averageDelay: 0
      };
    }
    
    let onTimeCount = 0;
    let lateCount = 0;
    let earlyCount = 0;
    let totalDelay = 0;
    
    completedShifts.forEach(shift => {
      const scheduledStart = new Date(`${shift.date}T${shift.startTime}`);
      const actualStart = new Date(shift.actualStartTime);
      const diffMinutes = (actualStart - scheduledStart) / (1000 * 60);
      
      if (Math.abs(diffMinutes) <= 5) {
        onTimeCount++;
      } else if (diffMinutes > 5) {
        lateCount++;
        totalDelay += diffMinutes;
      } else {
        earlyCount++;
      }
    });
    
    return {
      onTimeCount,
      lateCount,
      earlyCount,
      onTimePercentage: (onTimeCount / completedShifts.length) * 100,
      averageDelay: lateCount > 0 ? totalDelay / lateCount : 0
    };
  };

  // Función para métricas de frecuencia
  const getFrequencyMetrics = () => {
    const completedShifts = shifts.filter(shift => shift.status === 'completed');
    
    if (completedShifts.length === 0) {
      return {
        totalShifts: 0,
        weeklyAverage: 0,
        monthlyAverage: 0,
        longestStreak: 0,
        currentStreak: 0
      };
    }

    // Calcular promedios por período
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const recentShifts = completedShifts.filter(shift => 
      new Date(shift.date) >= thirtyDaysAgo
    );
    
    const weeklyShifts = completedShifts.filter(shift => 
      new Date(shift.date) >= sevenDaysAgo
    );

    return {
      totalShifts: completedShifts.length,
      weeklyAverage: weeklyShifts.length,
      monthlyAverage: recentShifts.length,
      longestStreak: 0, // Implementar más tarde
      currentStreak: 0  // Implementar más tarde
    };
  };

  const timeMetrics = getTimeMetrics();
  const earningsComparison = getEarningsComparison();
  const punctualityMetrics = getPunctualityMetrics();
  const frequencyMetrics = getFrequencyMetrics();

  const hasCompletedShifts = shifts.some(shift => shift.status === 'completed');

  if (!hasCompletedShifts) {
    return (
      <div className="metrics">
        <div className="metrics__header">
          <h1>📊 Métricas de rendimiento</h1>
          <p>Analiza tu productividad y patrones de trabajo</p>
        </div>
        
        <div className="metrics__empty">
          <div className="empty-state">
            <span className="empty-state__icon">📈</span>
            <h3>No hay métricas disponibles</h3>
            <p>Completa algunos turnos para ver tus métricas de rendimiento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="metrics">
      <div className="metrics__header">
        <h1>📊 Métricas de rendimiento</h1>
        <p>Analiza tu productividad y patrones de trabajo</p>
      </div>

      <div className="metrics__grid">
        {/* Métricas de tiempo */}
        <div className="metric-card">
          <div className="metric-card__header">
            <h4>⏱️ Tiempo asignado vs trabajado</h4>
          </div>
          <div className="metric-card__content">
            <div className="metric-comparison">
              <div className="metric-item">
                <span className="metric-label">Programado:</span>
                <span className="metric-value">{formatHours(timeMetrics.scheduled)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Trabajado:</span>
                <span className="metric-value">{formatHours(timeMetrics.actual)}</span>
              </div>
              <div className="metric-item metric-item--highlight">
                <span className="metric-label">Diferencia:</span>
                <span className={`metric-value ${timeMetrics.difference >= 0 ? 'positive' : 'negative'}`}>
                  {timeMetrics.difference > 0 ? '+' : ''}{formatHours(Math.abs(timeMetrics.difference))}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Eficiencia:</span>
                <span className="metric-value">{timeMetrics.efficiency.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de ganancias */}
        <div className="metric-card">
          <div className="metric-card__header">
            <h4>💰 Ganancias programadas vs reales</h4>
          </div>
          <div className="metric-card__content">
            <div className="metric-comparison">
              <div className="metric-item">
                <span className="metric-label">Programadas:</span>
                <span className="metric-value">${earningsComparison.scheduled.toFixed(2)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Reales:</span>
                <span className="metric-value">${earningsComparison.actual.toFixed(2)}</span>
              </div>
              <div className="metric-item metric-item--highlight">
                <span className="metric-label">Diferencia:</span>
                <span className={`metric-value ${earningsComparison.difference >= 0 ? 'positive' : 'negative'}`}>
                  {earningsComparison.difference > 0 ? '+' : ''}${earningsComparison.difference.toFixed(2)}
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
        <div className="metric-card">
          <div className="metric-card__header">
            <h4>🎯 Puntualidad</h4>
          </div>
          <div className="metric-card__content">
            <div className="metric-comparison">
              <div className="metric-item">
                <span className="metric-label">Puntual (±5min):</span>
                <span className="metric-value">{punctualityMetrics.onTimeCount} turnos</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">% Puntualidad:</span>
                <span className="metric-value">{punctualityMetrics.onTimePercentage.toFixed(1)}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Tarde:</span>
                <span className="metric-value negative">{punctualityMetrics.lateCount} turnos</span>
              </div>
              {punctualityMetrics.averageDelay > 0 && (
                <div className="metric-item">
                  <span className="metric-label">Retraso promedio:</span>
                  <span className="metric-value negative">{punctualityMetrics.averageDelay.toFixed(1)} min</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Métricas de frecuencia */}
        <div className="metric-card">
          <div className="metric-card__header">
            <h4>📅 Frecuencia de trabajo</h4>
          </div>
          <div className="metric-card__content">
            <div className="metric-comparison">
              <div className="metric-item">
                <span className="metric-label">Total completados:</span>
                <span className="metric-value">{frequencyMetrics.totalShifts} turnos</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Esta semana:</span>
                <span className="metric-value">{frequencyMetrics.weeklyAverage} turnos</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Este mes:</span>
                <span className="metric-value">{frequencyMetrics.monthlyAverage} turnos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;