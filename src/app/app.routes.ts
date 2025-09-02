import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard';
import { canActivateAuth } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [canActivateAuth] },

  { path: 'activity-types', loadComponent: () => import('./features/activity-types/activity-types-page/activity-types-page').then(m => m.ActivityTypesPage), canActivate: [canActivateAuth] },

  { path: 'employers', loadComponent: () => import('./features/employers/employers-page/employers-page').then(m => m.EmployersPageComponent), canActivate: [canActivateAuth] },
  { path: 'jobseekers', loadComponent: () => import('./features/jobseekers/jobseekers-page/jobseekers-page').then(m => m.JobseekersPageComponent), canActivate: [canActivateAuth] },
  { path: 'vacancies', loadComponent: () => import('./features/vacancies/vacancies-page/vacancies-page').then(m => m.VacanciesPage), canActivate: [canActivateAuth] },
  { path: 'agreements', loadComponent: () => import('./features/agreements/agreements-page/agreements-page').then(m => m.AgreementsPage), canActivate: [canActivateAuth] },

  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent) },
  { path: '**', redirectTo: 'dashboard' }
];

