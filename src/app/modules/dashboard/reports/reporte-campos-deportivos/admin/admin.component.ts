import { HttpClient } from '@angular/common/http';
import { Component,Inject, Input, OnInit, Output } from "@angular/core";
import {provideNativeDateAdapter} from '@angular/material/core';
import { DataTablesModule } from 'angular-datatables';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule,NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { NgClass, NgIf, NgFor } from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';

const RESERVATION2= environment.SERVER2;
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DataTablesModule,MatProgressSpinnerModule, NgClass,MatDialogModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class ReportesCamposDeportivosAdminComponent {
  url:string=RESERVATION2; 
  reserva:any;
  isLoading:boolean=true;
  iconoVoucher = 'assets/icons/heroicons/outline/voucher.svg';
  iconoPencil = 'assets/icons/heroicons/outline/pencil.svg';
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>();
  constructor(private http: HttpClient, public dialog: MatDialog){
    setTimeout(()=>{
      this.isLoading=false;
    },1000)
    this.loadReserva();
    this.dtOptions={
      pagingType:'simple_numbers',
      language: LanguageApp.spanish_datatables,
      responsive: true,
      order : [10, 'desc'],
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
  update(id:number) {
    console.log(id);
    
    const data={
      id: id
    }
    this.dialog.open(EditarCampoDeportivoComponent,{
      data: data
    });
    
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
@Component({
  selector: 'editar-campo-deportivo',
  standalone: true,
  providers:[provideNativeDateAdapter()],
  imports: [EditarCampoDeportivoComponent,MatDialogModule,FormsModule,ReactiveFormsModule,RouterLink,AngularSvgIconModule,ButtonComponent,NgClass,NgIf,NgFor,MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,],
  templateUrl: '../../../components/editar-campo-deportivo/editar-campo-deportivo.component.html',
})
export class EditarCampoDeportivoComponent implements OnInit{
  form!: FormGroup;
  login:any;
  authenticate!:boolean;
  passwordTextType!: boolean;
  passwordColor!: boolean;
  submitted = false;
  textScheduleLabel:string;
  voucherId!:number;
  sizeCharter!:number;
  category!:number;
  quantitySchedule!:number;
  optionSchedule!:boolean;
  dataField:any;dataSchedule:any[]=[]; selectSchedule:any;
  dataHolidays: any[]=[]; currentDate:any; nextDate:any;
  secondFormGroup = this._formBuilder.group({
    fieldCtrl: [null, Validators.required],
    dateCtrl: [null, Validators.required],
    scheduleCtrl: [{ value:null, disabled: true }, Validators.required],
  },{ validators: this.checkFieldsNotEmptySecondGroup });
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private readonly _formBuilder: FormBuilder, private readonly _router: Router, private http: HttpClient,public dialog: MatDialog) {
    this.textScheduleLabel='Horarios Disponibles';
    this.http.get(`${RESERVATION2}/workshop/reservation/${data.id}`).subscribe(
      (response:any)=>{
        this.quantitySchedule=response.data.length;
        this.category=response.data[0].category_id;
        const field_id=response.data[0].field_id;
        this.http.get(`${RESERVATION2}/fields/${this.category}`).subscribe(
          (value:any) => {
            if(value.code===200){
              this.secondFormGroup?.get('fieldCtrl')?.setValue(field_id);
              this.dataField= value.data;
              this.optionSchedule=false;
              console.log(this.optionSchedule);
              
            }
          },
          (error) => {
            console.error('Error en la solicitud:', error);
          }
        );
      },error=>{console.log(error);
      }
    );
    
  }
  ngOnInit(): void {
    this.form = this._formBuilder.group({});
  }
  get f() {
    return this.form.controls;
  }
  formatDate(date:any){
    const fecha = new Date(Date.parse(date));
    const year = fecha.getFullYear();
    const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const day = ('0' + fecha.getDate()).slice(-2);
    const dateFormat = `${year}-${month}-${day}`;
    return dateFormat;
  }
  formatHour(hour:any) {
    return (hour > 11 ? ((hour - 12)==0?12:hour-12)  +":00pm" : hour +":00am");
  }
  myFilter = (d: Date | null): boolean => {
    const disabledDates:any[] = [];
    const year=new Date().getFullYear();
    this.dataHolidays.map(
      (value:any)=> disabledDates.push(new Date(year, value.month, value.day)),
    )
    const day = (d || new Date()).getDay();
    const restrinctDays=disabledDates.some(disabledDate => 
      (d || new Date()).getFullYear() === disabledDate.getFullYear() &&
       (d || new Date()).getMonth() === disabledDate.getMonth() &&
       (d || new Date()).getDate() === disabledDate.getDate()
     );
     return day !== 0 && day !== 7 && !restrinctDays;
  }; 
  checkFieldsNotEmptySecondGroup(group: FormGroup){
    const field= group.get('fieldCtrl')?.value;
    const date= group.get('dateCtrl')?.value;
    const schedule= group.get('scheduleCtrl')?.value;
    return (field !==null && date !== null && schedule !== null ) ? null : { fieldsEmpty: true };
  }
  validateSecondFormGroup(){
    const field= this.secondFormGroup?.get('fieldCtrl');
    const date= this.secondFormGroup?.get('dateCtrl');
    const schedule= this.secondFormGroup?.get('scheduleCtrl');
    return {field,date, schedule};
  }
  
  getSelectSecondFormGroup(route: string, data: any) {
    let list = this.http.get(`${RESERVATION2}/${route}`);
    if (data) {
        const values = data.join('/');
        list = this.http.get(`${RESERVATION2}/${route}/${values}`);
    }
    return list;
  }
  getDateReservation(){
    const dataSchedules:any=[];
    const field= this.validateSecondFormGroup().field;
    const date= this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;
    if(field?.value&&date?.value){
      const dateFormat= this.formatDate(date.value);
        schedule?.enable();
        console.log("horarios");
        const url = `${RESERVATION2}/schedule/${this.category}/${field.value}/${dateFormat}`;
        this.http.get<any>(`${url}`).subscribe(
          (response)=>{
            response.data.map(
              (value:any)=>{    
                const hourActual=new Date().getHours();
                if(this.currentDate === date.value){
                  console.log(value.hour_start);
                  if(Number(value.hour_start) >= hourActual ){
                    dataSchedules.push(value)
                  }
                }else{
                  dataSchedules.push(value)
                }            
              }
            )
            this.dataSchedule=dataSchedules;
            this.textScheduleLabel=(this.dataSchedule.length>0)?'Horarios Disponibles':'No hay horarios disponibles';
            console.log(this.dataSchedule);
          }
        )
    }
  }
  getSchedule(){
    const schedule=this.validateSecondFormGroup().schedule;
    if(schedule){
      const selectSchedule=schedule.value.length;
      if(this.quantitySchedule == selectSchedule){
        console.log("SELECCION COMPLETA");
      }else{
        console.log("FALTA SELECCIONAR");
      }
    }
    
  }
  onSubmit(){}
}