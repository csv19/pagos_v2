import { Component } from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgClass, NgIf, NgFor } from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';
import { ADTSettings } from 'angular-datatables/src/models/settings';

const RESERVATION2= environment.SERVER2;

@Component({
  selector: 'app-admin',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [FormsModule,DataTablesModule,MatProgressSpinnerModule, NgClass,MatDialogModule,MatFormFieldModule, MatInputModule, MatDatepickerModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class ReportesTalleresUtilesAdminComponent {
  url:string=RESERVATION2; 
  reserva:any;
  isLoading:boolean=true;
  date:any
  date1:any
  date2:any
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>();
  constructor(private http: HttpClient, public dialog: MatDialog){
    this.date=new Date();
    this.date1=new Date();
    this.date2=new Date();
    setTimeout(()=>{
      this.isLoading=false;
    },1000)
    this.loadReserva();
  }
  validateDate(){
    if(this.date1>this.date2){
      return false;
    }
    return true;
  }
  loadReserva(){
      this.getReserva().subscribe(
        (response:any)=>{
          this.reserva=response.data;        
        },error=>{
          console.error(error);
        }
      )
      this.dtOptions={
        pagingType:'simple_numbers',
        language: LanguageApp.spanish_datatables,
        responsive: true,
        order : [5, 'desc'],
      }
  }
  getReserva():Observable<any[]>{
    const day='20240101';
    const fecha2 = new Date();
    const day2 = fecha2.toISOString().slice(0, 10).replace(/-/g, '').slice(0, 8);
    return this.http.get<any[]>(`${RESERVATION2}/workshops/reservations/${day}/${day2}`);
  }
  getReport(){
    const fecha1 = new Date(this.date1);
    const fecha2 = new Date(this.date2);
      const date1 = fecha1.toISOString().slice(0, 10).replace(/-/g, '').slice(0, 8);
      const date2 = fecha2.toISOString().slice(0, 10).replace(/-/g, '').slice(0, 8);
    if(this.validateDate()){
      const data={
        'module':4,
        'date1':date1,
        'date2':date2,
      }
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      this.http.post(`${RESERVATION2}/report/excel`, data, {
        headers: headers,
        responseType: 'blob' // Asegúrate de que la respuesta sea tratada como un blob
      }).subscribe(
        (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'teatro.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);
        },error => {
          console.error('Download error:', error);
        }
      )
      console.log("reporte");
    }
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

