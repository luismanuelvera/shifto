/**
 * Utilidades para validación de datos
 */

/**
 * Valida formato de tiempo (HH:MM)
 */
export const validateTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Valida que un valor sea un número positivo
 */
export const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Valida que dos horarios no se superpongan
 */
export const validateTimeOverlap = (existingShifts, newStart, newEnd, date) => {
  const newStartTime = new Date(`${date.toDateString()} ${newStart}`);
  const newEndTime = new Date(`${date.toDateString()} ${newEnd}`);
  
  for (const shift of existingShifts) {
    const shiftDate = new Date(shift.date);
    const existingStart = new Date(`${shiftDate.toDateString()} ${shift.startTime}`);
    const existingEnd = new Date(`${shiftDate.toDateString()} ${shift.endTime}`);
    
    // Verificar si hay superposición
    if (
      (newStartTime < existingEnd && newEndTime > existingStart) ||
      (existingStart < newEndTime && existingEnd > newStartTime)
    ) {
      return false;
    }
  }
  
  return true;
};

/**
 * Valida datos de un turno
 */
export const validateShiftData = (shiftData) => {
  const errors = [];

  if (!shiftData.date) {
    errors.push('La fecha es requerida');
  }

  if (!shiftData.startTime || !validateTimeFormat(shiftData.startTime)) {
    errors.push('La hora de entrada debe tener formato válido (HH:MM)');
  }

  if (!shiftData.endTime || !validateTimeFormat(shiftData.endTime)) {
    errors.push('La hora de salida debe tener formato válido (HH:MM)');
  }

  if (!validatePositiveNumber(shiftData.hourlyRate)) {
    errors.push('La tarifa por hora debe ser un número mayor a 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida configuración de tarifas
 */
export const validateRateConfig = (rateConfig) => {
  const errors = [];

  if (!validatePositiveNumber(rateConfig.weekdayRate)) {
    errors.push('La tarifa de días de semana debe ser un número mayor a 0');
  }

  if (!validatePositiveNumber(rateConfig.weekendRate)) {
    errors.push('La tarifa de fines de semana debe ser un número mayor a 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};