import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CamposDeportivosComponent } from './modules/dashboard/pages/campos-deportivos/campos-deportivos.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule),

  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/layout/layout.module').then((m) => m.LayoutModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'errors',
    loadChildren: () => import('./modules/error/error.module').then((m) => m.ErrorModule),
  },
  { path: '**', redirectTo: 'errors/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ]
})
export class AppRoutingModule {}
