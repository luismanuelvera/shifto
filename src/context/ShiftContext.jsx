import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { shiftsStorage, activeShiftStorage } from '../utils/storage';
import { validateShiftData, validateTimeOverlap } from '../utils/validation';
import { useUser } from './UserContext';
import {
  calculateHoursWorked, 
  calculateEarnings, 
  calculateEarningsWithNightRate,
  generateShiftId,
  isOvernightShift,
  isWeekend,
  calculateShiftStartDateTime,
  calculateShiftEndDateTime,
  isShiftExpired
} from '../utils/dateUtils';

const ShiftContext = createContext();

// Estados iniciales
const initialState = {
  shifts: [],
  activeShift: null,
  isLoading: false,
  error: null
};

// Tipos de acciones
const SHIFT_ACTIONS = {
  LOAD_SHIFTS: 'LOAD_SHIFTS',
  ADD_SHIFT: 'ADD_SHIFT',
  UPDATE_SHIFT: 'UPDATE_SHIFT',
  DELETE_SHIFT: 'DELETE_SHIFT',
  START_SHIFT: 'START_SHIFT',
  END_SHIFT: 'END_SHIFT',
  SET_ACTIVE_SHIFT: 'SET_ACTIVE_SHIFT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_ALL: 'CLEAR_ALL'
};

// Reducer para manejar el estado
const shiftReducer = (state, action) => {
  switch (action.type) {
    case SHIFT_ACTIONS.LOAD_SHIFTS:
      return {
        ...state,
        shifts: action.payload.shifts,
        activeShift: action.payload.activeShift,
        isLoading: false
      };

    case SHIFT_ACTIONS.ADD_SHIFT:
      return {
        ...state,
        shifts: [...state.shifts, action.payload]
      };

    case SHIFT_ACTIONS.UPDATE_SHIFT:
      console.log('UPDATE_SHIFT reducer ejecutado:', action.payload);
      console.log('Estado actual shifts:', state.shifts);
      const updatedShifts = state.shifts.map(shift => 
        shift.id === action.payload.id ? action.payload : shift
      );
      console.log('Shifts actualizados:', updatedShifts);
      return {
        ...state,
        shifts: updatedShifts
      };

    case SHIFT_ACTIONS.DELETE_SHIFT:
      return {
        ...state,
        shifts: state.shifts.filter(shift => shift.id !== action.payload)
      };

    case SHIFT_ACTIONS.START_SHIFT:
      return {
        ...state,
        activeShift: action.payload
      };

    case SHIFT_ACTIONS.END_SHIFT:
      return {
        ...state,
        activeShift: null,
        shifts: state.shifts.map(shift => 
          shift.id === action.payload.id ? action.payload : shift
        )
      };

    case SHIFT_ACTIONS.SET_ACTIVE_SHIFT:
      return {
        ...state,
        activeShift: action.payload
      };

    case SHIFT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case SHIFT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case SHIFT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case SHIFT_ACTIONS.CLEAR_ALL:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

// Provider del contexto
export const ShiftProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shiftReducer, initialState);
  const { config } = useUser(); // Obtener configuración del usuario incluyendo nightRate

  // Cargar turnos al inicializar
  useEffect(() => {
    const loadShifts = () => {
      dispatch({ type: SHIFT_ACTIONS.SET_LOADING, payload: true });
      try {
        const savedShifts = shiftsStorage.get();
        const savedActiveShift = activeShiftStorage.get();
        
        // Migrar turnos existentes para agregar campos faltantes
        const migratedShifts = savedShifts.map(shift => {
          let updatedShift = { ...shift };
          
          // Agregar isOvernight si no existe
          if (updatedShift.isOvernight === undefined) {
            updatedShift.isOvernight = isOvernightShift(shift.startTime, shift.endTime);
          }
          
          // Agregar startDate y endDate si no existen
          if (!updatedShift.startDate || !updatedShift.endDate) {
            updatedShift.startDate = calculateShiftStartDateTime(shift.date, shift.startTime).toISOString();
            updatedShift.endDate = calculateShiftEndDateTime(shift.date, shift.startTime, shift.endTime).toISOString();
          }
          
          return updatedShift;
        });
        
        // Si hubo migración, guardar los turnos actualizados
        if (migratedShifts.some((shift, index) => shift !== savedShifts[index])) {
          shiftsStorage.save(migratedShifts);
        }
        
        dispatch({ 
          type: SHIFT_ACTIONS.LOAD_SHIFTS, 
          payload: { 
            shifts: migratedShifts,
            activeShift: savedActiveShift 
          } 
        });
      } catch (error) {
        dispatch({ 
          type: SHIFT_ACTIONS.SET_ERROR, 
          payload: 'Error al cargar los turnos' 
        });
      }
    };

    loadShifts();
  }, []);

  // Guardar turnos cuando cambien
  useEffect(() => {
    if (!state.isLoading) {
      shiftsStorage.save(state.shifts);
    }
  }, [state.shifts, state.isLoading]);

  // Guardar turno activo cuando cambie
  useEffect(() => {
    if (!state.isLoading) {
      if (state.activeShift) {
        activeShiftStorage.save(state.activeShift);
      } else {
        activeShiftStorage.remove();
      }
    }
  }, [state.activeShift, state.isLoading]);

  // Funciones del contexto
  const addShift = (shiftData, userConfig) => {
    const validation = validateShiftData(shiftData);
    
    if (!validation.isValid) {
      dispatch({ 
        type: SHIFT_ACTIONS.SET_ERROR, 
        payload: validation.errors.join(', ') 
      });
      return false;
    }

    // Validar superposición de horarios
    const sameDateShifts = state.shifts.filter(shift => 
      new Date(shift.date).toDateString() === new Date(shiftData.date).toDateString()
    );

    if (!validateTimeOverlap(sameDateShifts, shiftData.startTime, shiftData.endTime, shiftData.date)) {
      dispatch({ 
        type: SHIFT_ACTIONS.SET_ERROR, 
        payload: 'Este horario se superpone con otro turno existente' 
      });
      return false;
    }

    try {
      const hoursWorked = calculateHoursWorked(shiftData.startTime, shiftData.endTime, shiftData.date);
      const isOvernight = isOvernightShift(shiftData.startTime, shiftData.endTime);
      
      // Calcular ganancias considerando tarifa nocturna si está configurada
      const earnings = calculateEarningsWithNightRate(
        hoursWorked, 
        shiftData.hourlyRate, 
        config.nightRate, 
        shiftData.startTime, 
        shiftData.endTime, 
        shiftData.date
      );
      
      // Calcular fechas de inicio y fin exactas
      const startDate = calculateShiftStartDateTime(shiftData.date, shiftData.startTime);
      const endDate = calculateShiftEndDateTime(shiftData.date, shiftData.startTime, shiftData.endTime);

      const newShift = {
        ...shiftData,
        id: generateShiftId(),
        hoursWorked,
        earnings,
        isOvernight,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'scheduled', // scheduled, active, completed
        actualStartTime: null,
        actualEndTime: null,
        actualHours: null,
        actualEarnings: null,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: SHIFT_ACTIONS.ADD_SHIFT, payload: newShift });
      dispatch({ type: SHIFT_ACTIONS.CLEAR_ERROR });
      return true;
    } catch (error) {
      dispatch({ 
        type: SHIFT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      return false;
    }
  };

  const startShift = (shiftId) => {
    const shift = state.shifts.find(s => s.id === shiftId);
    if (!shift) {
      dispatch({ 
        type: SHIFT_ACTIONS.SET_ERROR, 
        payload: 'Turno no encontrado' 
      });
      return false;
    }

    const updatedShift = {
      ...shift,
      status: 'active',
      actualStartTime: new Date().toISOString()
    };

    dispatch({ type: SHIFT_ACTIONS.START_SHIFT, payload: updatedShift });
    dispatch({ type: SHIFT_ACTIONS.UPDATE_SHIFT, payload: updatedShift });
    return true;
  };

  const endShift = (shiftId, notes = '') => {
    const shift = state.activeShift;
    if (!shift || shift.id !== shiftId) {
      dispatch({ 
        type: SHIFT_ACTIONS.SET_ERROR, 
        payload: 'No hay un turno activo con ese ID' 
      });
      return false;
    }

    const endTime = new Date();
    const startTime = new Date(shift.actualStartTime);
    const actualHours = (endTime - startTime) / (1000 * 60 * 60);
    
    // Calcular ganancias reales considerando tarifa nocturna
    const actualEarnings = calculateEarningsWithNightRate(
      actualHours, 
      shift.hourlyRate, 
      config.nightRate, 
      shift.startTime, 
      shift.endTime, 
      new Date(shift.date)
    );

    const completedShift = {
      ...shift,
      status: 'completed',
      actualEndTime: endTime.toISOString(),
      actualHours,
      actualEarnings,
      completionNotes: notes
    };

    dispatch({ type: SHIFT_ACTIONS.END_SHIFT, payload: completedShift });
    return true;
  };

  const deleteShift = (shiftId) => {
    dispatch({ type: SHIFT_ACTIONS.DELETE_SHIFT, payload: shiftId });
  };

  const updateShift = (updatedShift) => {
    console.log('updateShift llamado con:', updatedShift);
    dispatch({ type: SHIFT_ACTIONS.UPDATE_SHIFT, payload: updatedShift });
  };

  const clearAllShifts = () => {
    dispatch({ type: SHIFT_ACTIONS.CLEAR_ALL });
    shiftsStorage.remove();
    activeShiftStorage.remove();
  };

  const clearError = () => {
    dispatch({ type: SHIFT_ACTIONS.CLEAR_ERROR });
  };

  const contextValue = {
    ...state,
    addShift,
    updateShift,
    startShift,
    endShift,
    deleteShift,
    clearAllShifts,
    clearError
  };

  return (
    <ShiftContext.Provider value={contextValue}>
      {children}
    </ShiftContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useShifts = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShifts debe ser usado dentro de un ShiftProvider');
  }
  return context;
};