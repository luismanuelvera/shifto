import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';

const RateConfiguration = ({ onClose, isFirstTime = false }) => {
  const { config, updateRates, error, clearError } = useUser();
  const [formData, setFormData] = useState({
    weekdayRate: config.weekdayRate || '',
    weekendRate: config.weekendRate || config.weekdayRate || '',
    nightRate: config.nightRate || ''
  });
  const [useUnifiedRate, setUseUnifiedRate] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si usamos tarifa unificada, sincronizar ambos campos
    if (useUnifiedRate && name === 'weekdayRate') {
      setFormData(prev => ({
        ...prev,
        weekendRate: value
      }));
    }

    // Limpiar error cuando el usuario empiece a escribir
    if (error) clearError();
  };

  const handleUnifiedRateToggle = (e) => {
    const isUnified = e.target.checked;
    setUseUnifiedRate(isUnified);
    
    if (isUnified) {
      setFormData(prev => ({
        ...prev,
        weekendRate: prev.weekdayRate
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const success = updateRates({
      weekdayRate: parseFloat(formData.weekdayRate),
      weekendRate: parseFloat(formData.weekendRate),
      nightRate: parseFloat(formData.nightRate) || null
    });

    if (success && onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (!isFirstTime && onClose) {
      onClose();
    }
  };

  return (
    <div className="rate-configuration">
      <div className="rate-configuration__overlay">
        <div className="rate-configuration__modal">
          <div className="rate-configuration__header">
            <div className="rate-configuration__title">
              <h2>
                {isFirstTime 
                  ? '¡Bienvenido a Shifto! 🎉' 
                  : 'Configurar Tarifas'
                }
              </h2>
              <p>
                {isFirstTime 
                  ? 'Para comenzar, necesitamos saber cuánto cobras por hora de trabajo.'
                  : 'Actualiza tus tarifas por hora de trabajo.'
                }
              </p>
            </div>
            {!isFirstTime && (
              <button
                type="button"
                className="rate-configuration__close-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Cerrar"
              >
                ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="rate-configuration__form">
            {error && (
              <div className="rate-configuration__error">
                {error}
              </div>
            )}

            <div className="rate-configuration__field">
              <label htmlFor="unified-rate">
                <input
                  type="checkbox"
                  id="unified-rate"
                  checked={useUnifiedRate}
                  onChange={handleUnifiedRateToggle}
                />
                Usar la misma tarifa para todos los días
              </label>
            </div>

            <div className="rate-configuration__field">
              <label htmlFor="weekday-rate">
                {useUnifiedRate ? 'Tarifa por hora' : 'Tarifa por hora (Lunes a Viernes)'}
              </label>
              <div className="rate-configuration__input-group">
                <span className="rate-configuration__currency">$</span>
                <input
                  type="number"
                  id="weekday-rate"
                  name="weekdayRate"
                  value={formData.weekdayRate}
                  onChange={handleInputChange}
                  placeholder="2000.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {!useUnifiedRate && (
              <div className="rate-configuration__field">
                <label htmlFor="weekend-rate">
                  Tarifa por hora (Sábados, Domingos y Feriados)
                </label>
                <div className="rate-configuration__input-group">
                  <span className="rate-configuration__currency">$</span>
                  <input
                    type="number"
                    id="weekend-rate"
                    name="weekendRate"
                    value={formData.weekendRate}
                    onChange={handleInputChange}
                    placeholder="2500.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <small className="rate-configuration__help">
                  Generalmente es mayor para compensar el trabajo en fines de semana
                </small>
              </div>
            )}

            <div className="rate-configuration__field">
              <label htmlFor="night-rate">
                Tarifa por hora nocturna (22:00 - 06:00) - Opcional
              </label>
              <div className="rate-configuration__input-group">
                <span className="rate-configuration__currency">$</span>
                <input
                  type="number"
                  id="night-rate"
                  name="nightRate"
                  value={formData.nightRate}
                  onChange={handleInputChange}
                  placeholder="3000.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <small className="rate-configuration__help">
                Tarifa especial para turnos nocturnos. Si no se configura, se usará la tarifa regular.
              </small>
            </div>

            <div className="rate-configuration__actions">
              {!isFirstTime && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rate-configuration__button rate-configuration__button--secondary"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="rate-configuration__button rate-configuration__button--primary"
              >
                {isFirstTime ? 'Comenzar a usar Shifto' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RateConfiguration;