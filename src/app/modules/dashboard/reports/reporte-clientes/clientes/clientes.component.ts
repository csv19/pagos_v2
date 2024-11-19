import { Component,Inject, OnInit,OnDestroy, ViewChild } from "@angular/core";
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DataTablesModule } from 'angular-datatables';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from "angular-datatables/src/models/settings";
import { NgClass, NgIf, NgFor } from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Subject } from "rxjs";

const SERVER= environment.SERVER2;
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [DataTablesModule,NgClass,MatProgressSpinnerModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ReportesClientesComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  preloader:boolean=true;
  clients:any=[];
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>(); 
  constructor(private http: HttpClient){}
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      language: LanguageApp.spanish_datatables,
      responsive: true,
      processing:true,
      columns: [
        { title: 'Nro Documento', data: 'nro_document' },
        { title: 'Nombres y Apellidos', data: 'name' },
        { title: 'Correo', data: 'email' },
        { title: 'Celular', data: 'phone' },
      ],
    }
    this.fetchData()
  }
  fetchData():void{
    setTimeout(()=>{
      this.http.get(`${SERVER}/list/clients`).subscribe(
        (response:any)=>{
          console.log(response);
          this.clients=response.data;
          this.dtTrigger.next(this.dtOptions);
        },error=>{console.log(error);
        }
      )
      this.preloader=false;
    },1000)
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
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