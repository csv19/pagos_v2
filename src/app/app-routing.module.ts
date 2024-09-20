import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CamposDeportivosComponent } from './modules/dashboard/pages/campos-deportivos/campos-deportivos.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { authGuard, authGuardMatch } from './modules/auth/guard/auth.guard';
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/layout/layout.module').then((m) => m.LayoutModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
    // redirectTo: (localStorage.getItem('token')===null)?'admin':'login'
  },
  {
    path: 'errors',
    loadChildren: () => import('./modules/error/error.module').then((m) => m.ErrorModule),
  },
  { path: '**', redirectTo: 'errors/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),RouterModule.forRoot(routes, { useHash: true }), HttpClientModule],
  exports: [RouterModule],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ]
})
export class AppRoutingModule {}
