/**
 * Utilidades para almacenamiento local
 */

const STORAGE_KEYS = {
  USER_CONFIG: 'shifto_user_config',
  SHIFTS: 'shifto_shifts',
  ACTIVE_SHIFT: 'shifto_active_shift'
};

/**
 * Guarda datos en localStorage
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Obtiene datos de localStorage
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Elimina datos de localStorage
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

/**
 * Funciones específicas para cada tipo de dato
 */
export const userConfigStorage = {
  save: (config) => saveToStorage(STORAGE_KEYS.USER_CONFIG, config),
  get: () => getFromStorage(STORAGE_KEYS.USER_CONFIG, {
    weekdayRate: null,
    weekendRate: null,
    hasConfiguredRates: false,
    notificationPreferences: {
      shiftStart: 30, // minutos antes
      shiftEnd: true,
      tasks: true,
      notes: true
    }
  }),
  remove: () => removeFromStorage(STORAGE_KEYS.USER_CONFIG)
};

export const shiftsStorage = {
  save: (shifts) => saveToStorage(STORAGE_KEYS.SHIFTS, shifts),
  get: () => getFromStorage(STORAGE_KEYS.SHIFTS, []),
  remove: () => removeFromStorage(STORAGE_KEYS.SHIFTS)
};

export const activeShiftStorage = {
  save: (shift) => saveToStorage(STORAGE_KEYS.ACTIVE_SHIFT, shift),
  get: () => getFromStorage(STORAGE_KEYS.ACTIVE_SHIFT, null),
  remove: () => removeFromStorage(STORAGE_KEYS.ACTIVE_SHIFT)
};