import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { CamposDeportivosComponent } from '../dashboard/pages/campos-deportivos/campos-deportivos.component';
import { TributosMunicipalesComponent } from '../dashboard/pages/tributos-municipales/tributos-municipales.component';
import { TramitesServiciosComponent } from '../dashboard/pages/tramites-servicios/tramites-servicios.component';
import { MultasComponent } from '../dashboard/pages/multas/multas.component';
import { TalleresUtilesComponent } from '../dashboard/pages/talleres-utiles/talleres-utiles.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
        { path: '', redirectTo: '/', pathMatch: 'full' },
        { path: 'tributos-municipales', component: TributosMunicipalesComponent, data:{authenticate:false}},
        { path: 'tramites-servicios', component: TramitesServiciosComponent },
        { path: 'multas', component: MultasComponent },
        { path: 'campos-deportivos', component: CamposDeportivosComponent, data:{authenticate:false} },
        { path: 'campos-deportivos/recibo/:stepp/:voucher/:payment', component: CamposDeportivosComponent, data:{authenticate:false, roles: 'admin'} },
        { path: 'talleres-utiles', component: TalleresUtilesComponent, data:{authenticate:false}},
        { path: 'talleres-utiles/recibo/:stepp/:voucher/:payment', component: TalleresUtilesComponent, data:{authenticate:false, roles: 'user'} },
        { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
