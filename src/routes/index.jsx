import { lazy } from 'react';

// Lazy load all route components for code splitting
export const FrontPageView = lazy(() => import('../pages/FrontPageView.jsx'));
export const AuthView = lazy(() => import('../pages/AuthView.jsx'));
export const DashboardView = lazy(() => import('../pages/DashboardView.jsx'));
export const ApiDocsView = lazy(() => import('../pages/ApiDocsView.jsx'));
export const SettingsView = lazy(() => import('../pages/SettingsView.jsx'));