import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { TributosMunicipalesComponent } from './pages/tributos-municipales/tributos-municipales.component';
import { TramitesServiciosComponent } from './pages/tramites-servicios/tramites-servicios.component';
import { MultasComponent } from './pages/multas/multas.component';
import { CamposDeportivosComponent } from './pages/campos-deportivos/campos-deportivos.component';
import { TalleresUtilesComponent } from './pages/talleres-utiles/talleres-utiles.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'tributos-municipales', component: TributosMunicipalesComponent, data:{authenticate:true}},
      { path: 'tramites-servicios', component: TramitesServiciosComponent },
      { path: 'multas', component: MultasComponent },
      { path: 'campos-deportivos', component: CamposDeportivosComponent, data:{authenticate:true} },
      { path: 'talleres-utiles', component: TalleresUtilesComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
