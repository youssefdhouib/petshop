import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminGuard } from './layouts/admin-layout/admin.guard';
import { AuthGuard } from './pages/authentification/auth.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth', // Authentication routes (SignIn, SignUp)
    loadChildren: () => import('./pages/authentification/authentification.module').then(m => m.AuthentificationModule)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
        {
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule)
  }]},

  /* {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [AuthGuard, ClientGuard], // Protect Client Routes
    loadChildren: () => import('./layouts/client-layout/client-layout.module').then(m => m.ClientLayoutModule)
  }, */

  {
    path: '**',
    redirectTo: 'dashboard'
  }
]
