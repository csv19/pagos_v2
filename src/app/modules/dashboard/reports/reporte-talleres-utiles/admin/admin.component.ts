import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Component, OnInit,OnDestroy, ViewChild } from "@angular/core";
import {provideNativeDateAdapter} from '@angular/material/core';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NgClass} from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import { DataTableDirective } from 'angular-datatables';

const RESERVATION2= environment.SERVER2;

@Component({
  selector: 'app-admin',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [FormsModule,DataTablesModule,MatProgressSpinnerModule, NgClass,MatDialogModule,MatFormFieldModule, MatInputModule, MatDatepickerModule,MatTooltipModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class ReportesTalleresUtilesAdminComponent implements OnDestroy, OnInit {  
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  date1:any;date2:any;
  dtInstance: any;
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>(); 
  reserva:any=[];
  positionOption: TooltipPosition='above';
  constructor(private http: HttpClient, public dialog: MatDialog){
    this.date1=new Date().toISOString().slice(0, 10).slice(0, 10);
    this.date2=new Date().toISOString().slice(0, 10).slice(0, 10);
  }
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      language: LanguageApp.spanish_datatables,
      responsive: true,
    }
    this.fetchData();
  }
  validateDate(){
    if(this.date1>this.date2){
      return false;
    }
    return true;
  }
  formatDDMMYY(dateString:string) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}-${month}-${year}`;
  }
  fetchData():void{
    const date1=this.date1.replace(/-/g, '');
    const date2=this.date2.replace(/-/g, '');
    console.log(date1);
    
    this.http.get(`${RESERVATION2}/workshops/reservations/${date1}/${date2}`).subscribe(
      (response:any)=>{
        console.log(response);
        this.reserva=response.data; 
        this.dtTrigger.next(this.dtOptions);
      },error=>{console.log(error);
      }
    )
  }
  search(){
    const date1=this.date1.replace(/-/g, '');
    const date2=this.date2.replace(/-/g, '');
    
    this.http.get(`${RESERVATION2}/workshops/reservations/${date1}/${date2}`).subscribe(
      (response:any)=>{
        this.reserva=response.data; 
        this.rerender()
      },error=>{console.log(error);
      }
    )
    
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next(this.dtOptions);
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  download(){
    const fecha1 = new Date(this.date1);
    const fecha2 = new Date(this.date2);
    const date1 = fecha1.toISOString().slice(0, 10).replace(/-/g, '').slice(0, 8);
    const date2 = fecha2.toISOString().slice(0, 10).replace(/-/g, '').slice(0, 8);
    console.log(date1);
    
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
          link.download = 'talleres.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);
        },error => {
          console.error('Download error:', error);
        }
      )
    }
  }
  downloadVoucher(operation:number){
    const data={
      'operation':operation
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    this.http.post(`${RESERVATION2}/report/voucher`, data, {
      headers: headers,
      responseType: 'blob' // Asegúrate de que la respuesta sea tratada como un blob
    }).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.target='_blank';
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
      },error => {
        console.error('Download error:', error);
      }
    )
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

