/**
 * Utilidades para manejo de fechas y horarios
 */

/**
 * Formatea una fecha a string localizado en español
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
};

/**
 * Calcula las horas trabajadas entre dos horarios
 * Maneja turnos nocturnos que cruzan medianoche
 */
export const calculateHoursWorked = (startTime, endTime, date = new Date()) => {
  const start = new Date(`${date.toDateString()} ${startTime}`);
  let end = new Date(`${date.toDateString()} ${endTime}`);
  
  // Si la hora de fin es menor que la de inicio, es un turno nocturno
  // que cruza medianoche, así que agregamos un día a la hora de fin
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  
  return (end - start) / (1000 * 60 * 60);
};

/**
 * Calcula las ganancias basado en horas y tarifa
 */
export const calculateEarnings = (hours, hourlyRate) => {
  return hours * hourlyRate;
};

/**
 * Valida que dos horarios no se superpongan
 */
export const validateTimeOverlap = (existingShifts, newStart, newEnd, date) => {
  const newStartTime = new Date(`${date.toDateString()} ${newStart}`);
  const newEndTime = new Date(`${date.toDateString()} ${newEnd}`);
  
  for (const shift of existingShifts) {
    const existingStart = new Date(`${shift.date} ${shift.startTime}`);
    const existingEnd = new Date(`${shift.date} ${shift.endTime}`);
    
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
 * Verifica si una fecha es fin de semana
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Domingo o Sábado
};

/**
 * Verifica si una fecha es día de semana
 */
export const isWeekday = (date) => {
  return !isWeekend(date);
};

/**
 * Genera un ID único para un turno
 */
export const generateShiftId = () => {
  return `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Detecta si un turno es nocturno (cruza medianoche)
 */
export const isOvernightShift = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes <= startMinutes;
};

/**
 * Obtiene las fechas que ocupa un turno (una para turnos regulares, dos para nocturnos)
 */
export const getShiftDates = (date, startTime, endTime, isOvernight = null) => {
  const shiftDate = new Date(date);
  const dates = [shiftDate];
  
  // Si se proporciona el indicador isOvernight, úsalo; sino, calcúlalo
  const overnight = isOvernight !== null ? isOvernight : isOvernightShift(startTime, endTime);
  
  if (overnight) {
    const nextDay = new Date(shiftDate);
    nextDay.setDate(nextDay.getDate() + 1);
    dates.push(nextDay);
  }
  
  return dates;
};

/**
 * Determina si un turno está vencido
 */
export const isShiftExpired = (shift) => {
  if (shift.status === 'completed' || shift.status === 'active') {
    return false; // No puede estar vencido si está completado o activo
  }
  
  const now = new Date();
  
  // Usar la fecha de fin del turno si está disponible, sino calcularla
  let shiftEndDateTime;
  if (shift.endDate) {
    shiftEndDateTime = new Date(shift.endDate);
  } else {
    // Fallback para turnos antiguos sin endDate
    shiftEndDateTime = getShiftEndDateTime(shift);
  }
  
  // El turno está vencido si ha pasado 1 hora después de su hora de fin
  const expiredTime = new Date(shiftEndDateTime);
  expiredTime.setHours(expiredTime.getHours() + 1);
  
  return now > expiredTime;
};

/**
 * Obtiene la fecha y hora real de fin de un turno considerando si es nocturno
 */
export const getShiftEndDateTime = (shift) => {
  const shiftDate = new Date(shift.date);
  const [endHour, endMinute] = shift.endTime.split(':').map(Number);
  
  let shiftEndDateTime = new Date(shiftDate);
  shiftEndDateTime.setHours(endHour, endMinute, 0, 0);
  
  // Si es un turno nocturno, la hora de fin está en el día siguiente
  if (shift.isOvernight) {
    shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1);
  }
  
  return shiftEndDateTime;
};

/**
 * Calcula la fecha y hora de inicio de un turno
 */
export const calculateShiftStartDateTime = (date, startTime) => {
  const shiftDate = new Date(date);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  const startDateTime = new Date(shiftDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);
  
  return startDateTime;
};

/**
 * Calcula la fecha y hora de fin de un turno
 */
export const calculateShiftEndDateTime = (date, startTime, endTime) => {
  const shiftDate = new Date(date);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let endDateTime = new Date(shiftDate);
  endDateTime.setHours(endHour, endMinute, 0, 0);
  
  // Si es un turno nocturno (hora de fin menor que hora de inicio), 
  // la fecha de fin es el día siguiente
  if (isOvernightShift(startTime, endTime)) {
    endDateTime.setDate(endDateTime.getDate() + 1);
  }
  
  return endDateTime;
};

/**
 * Obtiene todas las fechas que ocupa un turno basado en sus fechas de inicio y fin
 */
export const getShiftDateRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Resetear horas para comparar solo fechas
  const currentDate = new Date(start);
  currentDate.setHours(0, 0, 0, 0);
  
  const finalDate = new Date(end);
  finalDate.setHours(0, 0, 0, 0);
  
  while (currentDate <= finalDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Obtiene todas las fechas que ocupa un turno, usando las fechas explícitas si están disponibles
 */
export const getShiftDateRangeFromShift = (shift) => {
  // Priorizar las fechas explícitas si están disponibles
  if (shift.startDate && shift.endDate) {
    return getShiftDateRange(shift.startDate, shift.endDate);
  }
  
  // Fallback para turnos antiguos
  return getShiftDates(new Date(shift.date), shift.startTime, shift.endTime, shift.isOvernight);
};

/**
 * Formatea el rango de fechas de un turno para mostrar
 */
export const formatShiftDateRange = (shift) => {
  if (!shift.startDate || !shift.endDate) {
    // Fallback para turnos antiguos
    if (shift.isOvernight) {
      const startDate = new Date(shift.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      return `${formatDate(startDate, { day: 'numeric', month: 'short' })} - ${formatDate(endDate, { day: 'numeric', month: 'short' })}`;
    }
    return formatDate(new Date(shift.date), { day: 'numeric', month: 'short', weekday: 'short' });
  }
  
  const startDate = new Date(shift.startDate);
  const endDate = new Date(shift.endDate);
  
  // Si es el mismo día
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(startDate, { day: 'numeric', month: 'short', weekday: 'short' });
  }
  
  // Si son días diferentes
  return `${formatDate(startDate, { day: 'numeric', month: 'short' })} - ${formatDate(endDate, { day: 'numeric', month: 'short' })}`;
};

/**
 * Convierte horas decimales a formato sexagesimal (HH:MM)
 * Ejemplo: 8.5 horas → "8:30", 0.25 horas → "0:15"
 */
export const formatHoursToSexagesimal = (decimalHours) => {
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Formatea horas con opción de mostrar en formato sexagesimal o decimal
 */
export const formatHours = (hours, useSexagesimal = true) => {
  if (useSexagesimal) {
    return formatHoursToSexagesimal(hours);
  }
  return `${hours.toFixed(2)}h`;
};

/**
 * Verifica si una hora está en el rango nocturno (22:00 - 06:00)
 */
export const isNightTime = (timeString) => {
  const [hour] = timeString.split(':').map(Number);
  return hour >= 22 || hour < 6;
};

/**
 * Calcula las horas que caen en el horario nocturno para un turno
 */
export const calculateNightHours = (startTime, endTime, date = new Date()) => {
  const isOvernight = isOvernightShift(startTime, endTime);
  
  // Crear fechas para inicio y fin del turno
  const startDate = new Date(date);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(date);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  endDate.setHours(endHour, endMinute, 0, 0);
  
  // Si es overnight, el end date es al día siguiente
  if (isOvernight) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  // Definir rangos nocturnos en el período del turno
  const nightStart1 = new Date(startDate);
  nightStart1.setHours(22, 0, 0, 0);
  
  const nightEnd1 = new Date(startDate);
  nightEnd1.setDate(nightEnd1.getDate() + 1);
  nightEnd1.setHours(6, 0, 0, 0);
  
  let nightHours = 0;
  
  // Calcular superposición con el período nocturno
  const overlapStart = new Date(Math.max(startDate.getTime(), nightStart1.getTime()));
  const overlapEnd = new Date(Math.min(endDate.getTime(), nightEnd1.getTime()));
  
  if (overlapStart < overlapEnd) {
    nightHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
  }
  
  return nightHours;
};

/**
 * Calcula las ganancias considerando tarifas nocturnas
 */
export const calculateEarningsWithNightRate = (hours, regularRate, nightRate = null, startTime, endTime, date = new Date()) => {
  if (!nightRate) {
    // Si no hay tarifa nocturna configurada, usar la tarifa regular
    return calculateEarnings(hours, regularRate);
  }
  
  const nightHours = calculateNightHours(startTime, endTime, date);
  const regularHours = hours - nightHours;
  
  const regularEarnings = regularHours * regularRate;
  const nightEarnings = nightHours * nightRate;
  
  return regularEarnings + nightEarnings;
};