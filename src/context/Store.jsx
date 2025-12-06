import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  search: {
    filters: {
      category: '',
      withinHours: 24,
      radiusKm: 10,
      lat: '',
      lng: ''
    },
    results: [],
    loading: false,
    error: null
  },
  vendor: {
    id: 'vnd_demo_1', // Demo vendor ID
    name: 'Demo Vendor'
  },
  notifications: {
    enabled: true,
    messages: []
  }
};

// Action types
const ActionTypes = {
  SET_SEARCH_FILTERS: 'SET_SEARCH_FILTERS',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_SEARCH_ERROR: 'SET_SEARCH_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_VENDOR: 'SET_VENDOR'
};

// Reducer
const storeReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_SEARCH_FILTERS:
      return {
        ...state,
        search: {
          ...state.search,
          filters: { ...state.search.filters, ...action.payload }
        }
      };
    
    case ActionTypes.SET_SEARCH_RESULTS:
      return {
        ...state,
        search: {
          ...state.search,
          results: action.payload,
          loading: false,
          error: null
        }
      };
    
    case ActionTypes.SET_SEARCH_LOADING:
      return {
        ...state,
        search: {
          ...state.search,
          loading: action.payload
        }
      };
    
    case ActionTypes.SET_SEARCH_ERROR:
      return {
        ...state,
        search: {
          ...state.search,
          error: action.payload,
          loading: false
        }
      };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          messages: [...state.notifications.messages, action.payload]
        }
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          messages: state.notifications.messages.filter(msg => msg.id !== action.payload)
        }
      };
    
    case ActionTypes.SET_VENDOR:
      return {
        ...state,
        vendor: { ...state.vendor, ...action.payload }
      };
    
    default:
      return state;
  }
};

// Create context
const StoreContext = createContext();

// Store provider component
export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Action creators
  const actions = {
    setSearchFilters: (filters) => {
      dispatch({ type: ActionTypes.SET_SEARCH_FILTERS, payload: filters });
    },
    
    setSearchResults: (results) => {
      dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: results });
    },
    
    setSearchLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_SEARCH_LOADING, payload: loading });
    },
    
    setSearchError: (error) => {
      dispatch({ type: ActionTypes.SET_SEARCH_ERROR, payload: error });
    },
    
    addNotification: (message, type = 'info') => {
      const notification = {
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toISOString()
      };
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
    },
    
    removeNotification: (id) => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    },
    
    setVendor: (vendor) => {
      dispatch({ type: ActionTypes.SET_VENDOR, payload: vendor });
    }
  };

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook to use store
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
