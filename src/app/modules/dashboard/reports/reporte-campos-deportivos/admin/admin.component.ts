import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NgClass } from '@angular/common';

const RESERVATION2= environment.SERVER2;
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DataTablesModule,MatProgressSpinnerModule, NgClass],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class ReportesCamposDeportivosAdminComponent {
  url:string=RESERVATION2; 
  reserva:any;
  isLoading:boolean=true;
  iconoVoucher = 'assets/icons/heroicons/outline/voucher.svg';
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>();
  constructor(private http: HttpClient){
    setTimeout(()=>{
      this.isLoading=false;
    },1000)
    this.loadReserva();
    this.dtOptions={
      pagingType:'simple_numbers',
      language: LanguageApp.spanish_datatables,
      responsive: true,
    }
  }
  loadReserva(){
      this.getReserva().subscribe(
        (response:any)=>{
          console.log(response);
          this.reserva=response.data;        
        },error=>{
          console.error(error);
        }
      )
  }
  getReserva():Observable<any[]>{
    return this.http.get<any[]>(`${RESERVATION2}/workshops/reservations`);
  }
  showVoucher(id:number){
    console.log(id);
    
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.dtTrigger.next(this.dtOptions);
    }, 200);
  }
}
export class LanguageApp {
  public static spanish_datatables = {
    processing: "Procesando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ elementos",
    info: "Mostrando desde _START_ al _END_ de _TOTAL_ elementos",
    infoEmpty: "No hay ningún elemento.",
    infoFiltered: "(filtrado _MAX_ elementos total)",
    infoPostFix: "",
    loadingRecords: "Cargando registros...",
    zeroRecords: "No se encontraron registros",
    emptyTable: "No hay datos disponibles en la tabla",
    paginate: {
      first: "Primero",
      previous: "Anterior",
      next: "Siguiente",
      last: "Último"
    },
    aria: {
      sortAscending: ": Activar para ordenar la tabla en orden ascendente",
      sortDescending: ": Activar para ordenar la tabla en orden descendente"
    }
  }
}