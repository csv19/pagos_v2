import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { TributosMunicipalesComponent } from './pages/tributos-municipales/tributos-municipales.component';
import { TramitesServiciosComponent } from './pages/tramites-servicios/tramites-servicios.component';
import { MultasComponent } from './pages/multas/multas.component';
import { CamposDeportivosComponent } from './pages/campos-deportivos/campos-deportivos.component';
import { TalleresUtilesComponent } from './pages/talleres-utiles/talleres-utiles.component';
import { authGuard } from '../auth/guard/auth.guard';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ListaUsuariosComponent } from './pages/lista-usuarios/lista-usuarios.component';
import { ReportesCamposDeportivosAdminComponent } from './reports/reporte-campos-deportivos/admin/admin.component';
import { ReportesCamposDeportivosAtmComponent } from './reports/reporte-campos-deportivos/atm/atm.component';
import { ReportesTalleresUtilesAdminComponent } from './reports/reporte-talleres-utiles/admin/admin.component';
import { ReportesTalleresUtilesAtmComponent } from './reports/reporte-talleres-utiles/atm/atm.component';



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      //REVISAR STEPPER PARA EL RECIBO
      { path: 'tributos-municipales', component: TributosMunicipalesComponent, data:{authenticate:true}},
      { path: 'tramites-servicios', component: TramitesServiciosComponent },
      { path: 'multas', component: MultasComponent },
      { path: 'campos-deportivos', component: CamposDeportivosComponent, data:{authenticate:true} },
      { path: 'campos-deportivos/recibo/:stepp/:voucher/:payment', component: CamposDeportivosComponent, data:{authenticate:true} },
      { path: 'talleres-utiles', component: TalleresUtilesComponent, data:{authenticate:true} },
      { path: 'talleres-utiles/recibo/:stepp/:voucher/:payment', component: TalleresUtilesComponent, data:{authenticate:true} },
      //USER
      { path: 'usuario/registro-usuario', component: SignUpComponent, data:{roles:'admin'} },
      { path: 'usuario/lista-usuario', component: ListaUsuariosComponent },
      //REPORTES
      { path: 'reporte/campos-deportivos', component:  ReportesCamposDeportivosAdminComponent},
      { path: 'reporte/campos-deportivos/atm', component:  ReportesCamposDeportivosAtmComponent},
      { path: 'reporte/talleres-utiles', component:  ReportesTalleresUtilesAdminComponent},
      { path: 'reporte/talleres-utiles/atm', component: ReportesTalleresUtilesAtmComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
