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
import { ReportesTalleresUtilesAdminComponent } from './reports/reporte-talleres-utiles/admin/admin.component';
import { ReportesTalleresUtilesAtmComponent } from './reports/reporte-talleres-utiles/atm/atm.component';
import { ConfigCamposDeportivosComponent } from './config/config-campos-deportivos/campos-deportivos/campos-deportivos.component';
import { ConfigTalleresUtilesComponent } from './config/config-talleres-utiles/talleres-utiles/talleres-utiles.component';



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      
      { path: 'caja/tributos-municipales', component: TributosMunicipalesComponent, data:{authenticate:true}},
      { path: 'caja/tramites-servicios', component: TramitesServiciosComponent },
      { path: 'caja/multas', component: MultasComponent },
      { path: 'caja/campos-deportivos', component: CamposDeportivosComponent, data:{authenticate:true} },
      { path: 'caja/campos-deportivos/recibo/:stepp/:payment', component: CamposDeportivosComponent, data:{authenticate:true} },
      { path: 'caja/talleres-utiles', component: TalleresUtilesComponent, data:{authenticate:true} },
      { path: 'caja/talleres-utiles/recibo/:stepp/:payment', component: TalleresUtilesComponent, data:{authenticate:true} },
      //REPORTES
      { path: 'reporte/campos-deportivos', component:  ReportesCamposDeportivosAdminComponent},
      { path: 'reporte/talleres-utiles', component:  ReportesTalleresUtilesAdminComponent},
      { path: 'reporte/talleres-utiles/atm', component: ReportesTalleresUtilesAtmComponent },
      //CONFIGURACION
      { path: 'configuracion/usuario/registro-usuario', component: SignUpComponent },
      { path: 'configuracion/usuario/lista-usuario', component: ListaUsuariosComponent },
      { path: 'configuracion/campos-deportivos', component: ConfigCamposDeportivosComponent },
      { path: 'configuracion/talleres-utiles', component: ConfigTalleresUtilesComponent },

      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
