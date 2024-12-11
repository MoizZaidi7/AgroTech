import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import authReducer from './authslice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], 
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
});

const persistor = persistStore(store);

export { store, persistor };
