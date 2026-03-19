import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'tracker',
        loadComponent: () => import('./pages/tracker/tracker.component').then(m => m.TrackerComponent),
      },
      {
        path: 'executive',
        loadComponent: () => import('./pages/executive/executive.component').then(m => m.ExecutiveComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'maintenance',
        loadComponent: () => import('./pages/maintenance/maintenance.component').then(m => m.MaintenanceComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
