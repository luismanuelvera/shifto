import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { userConfigStorage } from '../utils/storage';
import { validateRateConfig } from '../utils/validation';

const UserContext = createContext();

// Estados iniciales
const initialState = {
  config: {
    weekdayRate: null,
    weekendRate: null,
    nightRate: null, // Nueva tarifa nocturna
    hasConfiguredRates: false,
    notificationPreferences: {
      shiftStart: 30,
      shiftEnd: true,
      tasks: true,
      notes: true
    }
  },
  isLoading: false,
  error: null
};

// Tipos de acciones
const USER_ACTIONS = {
  LOAD_CONFIG: 'LOAD_CONFIG',
  UPDATE_RATES: 'UPDATE_RATES',
  UPDATE_NOTIFICATIONS: 'UPDATE_NOTIFICATIONS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer para manejar el estado
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.LOAD_CONFIG:
      return {
        ...state,
        config: action.payload,
        isLoading: false
      };

    case USER_ACTIONS.UPDATE_RATES:
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
          hasConfiguredRates: true
        }
      };

    case USER_ACTIONS.UPDATE_NOTIFICATIONS:
      return {
        ...state,
        config: {
          ...state.config,
          notificationPreferences: {
            ...state.config.notificationPreferences,
            ...action.payload
          }
        }
      };

    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case USER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Provider del contexto
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Cargar configuración al inicializar
  useEffect(() => {
    const loadConfig = () => {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
      try {
        const savedConfig = userConfigStorage.get();
        dispatch({ type: USER_ACTIONS.LOAD_CONFIG, payload: savedConfig });
      } catch (error) {
        dispatch({ type: USER_ACTIONS.SET_ERROR, payload: 'Error al cargar la configuración' });
      }
    };

    loadConfig();
  }, []);

  // Guardar configuración cuando cambie
  useEffect(() => {
    if (!state.isLoading && state.config.hasConfiguredRates !== undefined) {
      userConfigStorage.save(state.config);
    }
  }, [state.config, state.isLoading]);

  // Funciones del contexto
  const updateRates = (rateData) => {
    const validation = validateRateConfig(rateData);
    
    if (!validation.isValid) {
      dispatch({ 
        type: USER_ACTIONS.SET_ERROR, 
        payload: validation.errors.join(', ') 
      });
      return false;
    }

    dispatch({ type: USER_ACTIONS.UPDATE_RATES, payload: rateData });
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
    return true;
  };

  const updateNotificationPreferences = (preferences) => {
    dispatch({ type: USER_ACTIONS.UPDATE_NOTIFICATIONS, payload: preferences });
  };

  const clearError = () => {
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
  };

  const contextValue = {
    ...state,
    updateRates,
    updateNotificationPreferences,
    clearError
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};