import { HttpClient } from '@angular/common/http';
import { Component,Inject, Input, OnInit, Output } from "@angular/core";
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
  calendar:any={
    purchaseNumber:'',
    sessionToken:'',
    people_id:'',
    category:'',
    field:'',
    reservation_shift:'',
    date:'',
    schedule:[],
    price:'',
   }
   totalPrice:any;
   styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;
  dataCategory:any; dataField:any; dataTypeReservation:any; dataShift:any; dataSchedule:any[]=[]; selectSchedule:any;
  dataHolidays: any[]=[]; currentDate:any; nextDate:any;
  secondFormGroup = this._formBuilder.group({
    categoryCtrl: [null, Validators.required],
    fieldCtrl: [{ value:null, disabled: true }, Validators.required],
    typeReservationCtrl: [{ value:null, disabled: true }, Validators.required],
    shiftCtrl: [{ value:null, disabled: true }, Validators.required],
    dateCtrl: [{ value:null, disabled: true }, Validators.required],
    scheduleCtrl: [{ value:null, disabled: true }, Validators.required],
    typePaymentCtrl: [null, localStorage.getItem('token')?Validators.required:null],
    optionPaymentCtrl: null,
    observationPaymentCtrl: null,
  },{ validators: this.checkFieldsNotEmptySecondGroup });
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private readonly _formBuilder: FormBuilder, private readonly _router: Router, private http: HttpClient,public dialog: MatDialog) {
    this.textScheduleLabel='Horarios Disponibles';
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
    const category= group.get('categoryCtrl')?.value;
    const field= group.get('fieldCtrl')?.value;
    const typeReservation= group.get('typeReservationCtrl')?.value;
    const shift= group.get('categoryCtrl')?.value;
    const date= group.get('dateCtrl')?.value;
    const schedule= group.get('scheduleCtrl')?.value;
    const typePayment= group.get('typePaymentCtrl')?.value;
    if(localStorage.getItem('token')){
      return (category !== null && field !==null && typeReservation !== null && shift !== null && date !== null && schedule !== null && typePayment !== null ) ? null : { fieldsEmpty: true };
    }else{
      return (category !== null && field !==null && typeReservation !== null && shift !== null && date !== null && schedule !== null ) ? null : { fieldsEmpty: true };
    }
  }
  validateSecondFormGroup(){
    const category= this.secondFormGroup?.get('categoryCtrl');
    const field= this.secondFormGroup?.get('fieldCtrl');
    const typeReservation= this.secondFormGroup?.get('typeReservationCtrl');
    const shift= this.secondFormGroup?.get('shiftCtrl');
    const date= this.secondFormGroup?.get('dateCtrl');
    const schedule= this.secondFormGroup?.get('scheduleCtrl');
    const typePayment= this.secondFormGroup?.get('typePaymentCtrl');
    const optionPayment= this.secondFormGroup?.get('optionPaymentCtrl');
    const observationPayment= this.secondFormGroup?.get('observationPaymentCtrl');
    return {category, field, typeReservation,shift,date, schedule, typePayment, optionPayment, observationPayment};
  }
  resetValidateSecondFormGroup(value:number){
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;
    const optionPayment= this.secondFormGroup?.get('optionPaymentCtrl');;
    switch(value){
      case 1: 
            field?.enable();
            field?.reset();
            typeReservation?.disable();
            typeReservation?.reset();
            shift?.disable();
            shift?.reset();
            date?.reset();
            date?.disable();
            schedule?.reset();
            schedule?.disable();
            this.calendar.price='';
            this.totalPrice='';
            break;
      case 2: 
            typeReservation?.enable();
            typeReservation?.reset();
            shift?.reset();
            shift?.disable();
            date?.reset();
            date?.disable();
            schedule?.reset();
            schedule?.disable();
            this.calendar.price='';
            this.totalPrice='';
            break;
      case 3:
            shift?.enable();
            shift?.reset();
            date?.disable();
            schedule?.reset();
            schedule?.disable();
            this.calendar.price='';
            this.totalPrice='';
            break;
      case 4:
            date?.enable();
            date?.reset();
            schedule?.disable();
            schedule?.reset();
            this.calendar.price='';
            this.totalPrice='';
            break;
      case 5:
            schedule?.enable();
            schedule?.reset();
            this.calendar.price='';
            this.totalPrice='';
            break;
      case 6:
            optionPayment?.reset();
            break;
      default:
            field?.reset();
            typeReservation?.reset();
            shift?.reset();
            date?.reset();
            schedule?.reset();
            this.calendar.price='';
            this.totalPrice='';
    }
  }
  getSelectSecondFormGroup(route: string, data: any) {
    let list = this.http.get(`${RESERVATION2}/${route}`);
    if (data) {
        const values = data.join('/');
        list = this.http.get(`${RESERVATION2}/${route}/${values}`);
    }
    return list;
  }
  async getCategory(){
    const category= this.validateSecondFormGroup().category;
    const route='fields';
    if(category?.value){
      const data=[category.value];
      const dataField:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataField.code ===200){
        this.dataField=dataField.data;
      }
    }
    this.resetValidateSecondFormGroup(1);
  }
  async getField(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const route='typeReservations';
    if(category?.value && field?.value){
      const admin= (this.authenticate)?1:2;
      const data=[category.value,field.value, admin];
      const dataTypeReservation:any= await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataTypeReservation.code ===200){
        this.dataTypeReservation=dataTypeReservation.data;
      }
    }
    this.resetValidateSecondFormGroup(2);
  }
  async getTypeReservation(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const route='shifts';
    if(category?.value && field?.value && typeReservation?.value){
      console.log(field.value);
      const data=false;
      const dataShift:any= await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataShift.code ===200){
        this.dataShift=dataShift.data;
      }
    }
    this.resetValidateSecondFormGroup(3);
  }
  async getShift(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    if(category?.value && field?.value && typeReservation?.value){
      const route='reservations';
      const data=[category.value,field.value,typeReservation.value];
      const calendar:any=await this.getSelectSecondFormGroup(route,data).toPromise();
      if(calendar.code ===200){
        this.calendar.reservation_shift= calendar.data[0].id;
      } 
    }
    this.resetValidateSecondFormGroup(4);
  }
  getDateReservation(){
    const dataSchedules:any=[];
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    if(category?.value&&field?.value&&shift?.value&&date?.value){
      const dateFormat= this.formatDate(date.value);
        console.log("horarios");
        console.log(field.value);
        let params;
        if(this.authenticate){
          params = field.value.map((value:any) => `${value}`).join(',');
        }else{
          params = field.value;
        }
        const url = `${RESERVATION2}/schedules?fields=${params}&category=${category.value}&shift=${shift.value}&date=${dateFormat}`;
        this.http.get<any>(`${url}`).subscribe(
          (response)=>{
            response.data.map(
              (value:any)=>{    
                if(this.currentDate === date.value){
                  if(Number(value.hour_start) >=new Date().getHours() ){
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
    this.resetValidateSecondFormGroup(5);
  }
  async getSchedule(){
    const shift= this.validateSecondFormGroup().shift;
    const schedule= this.validateSecondFormGroup().schedule;
    const field= this.validateSecondFormGroup().field;
    if( shift?.value && schedule?.value && this.calendar.reservation_shift){
      const route='detailShifts';
      const data=[this.calendar.reservation_shift,shift.value];
      const quantity= schedule.value.length;
      const fields= (this.authenticate)?field?.value.length:1;
      const total:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      if(total.code ===200){
        this.calendar.price=(total.data[0].price).toString();
        this.totalPrice=  (total.data[0].price * quantity * fields).toString();
      }
    }
    
  }
  onSubmit(){}
}