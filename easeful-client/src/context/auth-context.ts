import { createContext } from 'react';
import type { AuthContextType } from './authTypes';

// Create and export the context (no React components or hooks here)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
