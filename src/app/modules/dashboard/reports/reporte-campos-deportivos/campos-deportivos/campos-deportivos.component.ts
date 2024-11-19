import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Component,Inject, OnInit,OnDestroy, ViewChild } from "@angular/core";
import {provideNativeDateAdapter} from '@angular/material/core';
import { DataTablesModule } from 'angular-datatables';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { interval, Subject } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { NgClass, NgIf, NgFor } from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DataTableDirective } from 'angular-datatables';
import {MatButtonModule} from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';



const SERVER= environment.SERVER;
@Component({
  selector: 'app-campos-deportivos',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [FormsModule,DataTablesModule,MatProgressSpinnerModule, NgClass,MatDialogModule,MatFormFieldModule, MatInputModule, MatDatepickerModule,MatTooltipModule],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})
export class ReportesCamposDeportivosComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;

  date1:any;date2:any;
  dtInstance: any;
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>(); 
  reserva:any=[];
  preloader:boolean=true;
  user!:number;
  user_code!:number;
  state:boolean=false;maxDateUpdate:any;
  positionOption: TooltipPosition='above';
  constructor(private http: HttpClient, public dialog: MatDialog, private toastr: ToastrService){
    this.date1=new Date().toISOString().slice(0, 10);
    this.date2=new Date().toISOString().slice(0, 10);
  }
  ngOnInit(): void {
    const profile:any=localStorage.getItem('profileData');
    this.user=JSON.parse(profile).data.id;
    this.user_code=JSON.parse(profile).data.code;
    this.dtOptions = {
      pagingType: 'simple_numbers',
      language: LanguageApp.spanish_datatables,
      responsive: true,
      processing:true,
      columns: [
        { title: 'Nro Documento', data: 'nro_document' },
        { title: 'Nombres y Apellidos', data: 'name' },
        { title: 'Categoria', data: 'category' },
        { title: 'Reserva', data: 'typeReservation' },
        { title: 'Fecha Reserva', data: 'date' },
        { title: 'Campo', data: 'field' },
        { title: 'Horario', data: 'hour_start'},
        { title: 'Precio', data: 'total' },
        { title: 'Tipo de Pago', data: 'typePayment' },
        { title: 'Fecha Pago', data: 'created_at' },  
      ],
    }
    this.fetchData();
  }
  validateDate(){
    if(this.date1>this.date2){
      return false;
    }
    return true;
  }
  fetchData():void{
    const date1=this.date1
    const date2=this.date2
    setTimeout(()=>{
      this.http.get(`${SERVER}/calendars/reservations/${date1}/${date2}`).subscribe(
        (response:any)=>{
          console.log(response);
          this.reserva=response.data; 
          this.dtTrigger.next(this.dtOptions);
        },error=>{console.log(error);
        }
      )
      this.preloader=false;
    },1000)
  }
  search(){
    const date1=this.date1
    const date2=this.date2
    console.log(date1);
    
    this.http.get(`${SERVER}/calendars/reservations/${date1}/${date2}`).subscribe(
      (response:any)=>{
        this.reserva=response.data; 
        this.rerender();
      },error=>{console.log(error);
      }
    )
    
  }
  update(field_id:number,id:number) {
    this.state=true;
    const data={
      id: id,
      field_id: field_id,
      user_id: this.user,
      user_code: this.user_code
    }
    
    const dialogRef= this.dialog.open(EditarCampoDeportivoComponent,{
      data: data
    });
    dialogRef.beforeClosed().subscribe(result => {
      if(result){
        this.rerender()
      }
    });
  }
  decline(field_id:number,id:number){
    this.state=true;
    const data={
      id: id,
      field_id: field_id,
      user_id: this.user,
    }
    Swal.fire({
      title: 'Estas seguro de querer eliminar esta reserva?',
      text: 'No se podrá revertir!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminalo!',
      cancelButtonText: 'No, ahora',
      customClass:{
        confirmButton: 'bg-blue-500',
        cancelButton: 'bg-red-500',
        denyButton: 'bg-red-500',
      }
    }).then((result) => {
      if (result.value) {
        this.http.post(`${SERVER}/calendars/reservation/decline`, data).subscribe(
          response=>{
            this.rerender();
          },error=>{
            console.log(error);
          }
        )
        Swal.fire(
          'Eliminado!',
          'Se elimino la reserva con éxito.',
          'success'
        )
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title:'Cancelado',
           text:'No se elimino la reserva',
           icon: 'error',
           timer: 1500
        } 
        )
      }
    })
  }
  ngAfterViewInit(): void {
    this.dtTrigger.subscribe(() => {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.columns().every(function () {
          const that = this;
          $('input', this.footer()).on('keyup change', function () {
            const inputValue = (<HTMLInputElement>this).value;
            if (that.search() !== inputValue) {
              that
                .search(inputValue) // Filtra según el valor del input
                .draw(); // Actualiza la tabla con los datos filtrados
            }
          });
        });
      });
    });
  }
  
  rerender(): void {
    this.preloader=true;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.fetchData()
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate()+1
    const month = date.getMonth() + 1
    const year = date.getFullYear(); 
    return `${day}-${month}-${year}`;
  }
  formatDateCreate(dateString: string): number {
    const date = new Date(dateString);
    const day = date.getDate()
    const month = date.getMonth() + 1 
    const year = date.getFullYear(); 
    const formattedDate = Number(`${day}${month}${year}`);
    return formattedDate;
  }
  formatDateMax(dateString: string): number {
    const date = new Date(dateString);
    let day = date.getDate();
    day=(day>=29)?day+2:day;
    const month=date.getMonth() + 1;
    const year = date.getFullYear(); 
    const formattedDate = Number(`${day}${month}${year}`);
    return formattedDate;
  }
  formatHour(hour:any) {
    return (hour > 11 ? ((hour - 12)==0?12:hour-12)  +":00pm" : hour +":00am");
  }
  download(){
    const fecha1 = new Date(this.date1);
    const fecha2 = new Date(this.date2);
    if(this.validateDate()){
      const data={
        'module':3,
        'date1':fecha1,
        'date2':fecha2,
      }
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      this.http.post(`${SERVER}/report/excel`, data, {
        headers: headers,
        responseType: 'blob' // Asegúrate de que la respuesta sea tratada como un blob
      }).subscribe(
        (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'campos.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);
        },error => {
          console.error('Download error:', error);
          this.showError('No se pudo realizar la descarga');
        }
      )
    }
  }
  downloadVoucher(operation:number){
    const option:number=2; //Abrir en nueva pestaña
    const data={
      'paymentId':operation,
      'option': option
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    this.http.post(`${SERVER}/report/voucher`, data, {
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
  showSuccess(message:string){
    this.toastr.success(message,'CORRECTO!');
  }
  showError(message:string) {
    this.toastr.error(message,'ERROR!',{closeButton:true, positionClass:'toast-top-right'});
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
  imports: [EditarCampoDeportivoComponent,MatDialogModule,MatButtonModule,FormsModule,ReactiveFormsModule,RouterLink,AngularSvgIconModule,ButtonComponent,NgClass,NgIf,NgFor,MatFormFieldModule,
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
  submitted:boolean= true;
  textScheduleLabel:string;
  voucherId!:number;
  sizeCharter!:number;
  category!:number;
  shift!:number;
  quantitySchedule!:number;
  optionSchedule:any;
  scheduleId:any=[];
  dataField:any;dataSchedule:any[]=[];currentDate:any; selectSchedule:any;
  dataHolidays: any[]=[]; nextDate:any;
  secondFormGroup = this._formBuilder.group({
    fieldCtrl: [null, Validators.required],
    dateCtrl: [null, Validators.required],
    scheduleCtrl: [{ value:null, disabled: true }, Validators.required],
  },{ validators: this.checkFieldsNotEmptySecondGroup });
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private readonly _formBuilder: FormBuilder, private readonly _router: Router, private http: HttpClient,public dialog: MatDialog, private toastr: ToastrService) {
    this.textScheduleLabel='Horarios Disponibles';
    this.http.get(`${SERVER}/calendars/reservation/${data.field_id}/${data.id}`).subscribe(
      (response:any)=>{
        this.quantitySchedule=response.data.length;
        this.category=response.data[0].category_id;
        const field_id=response.data[0].field_id;
        this.shift=response.data[0].shift_id;
        response.data.map((value:any)=>{
          this.scheduleId.push(value.schedule_id)
        })
        
        this.http.get(`${SERVER}/fields/${this.category}`).subscribe(
          (value:any) => {
            if(value.code===200){
              this.secondFormGroup?.get('fieldCtrl')?.setValue(field_id);
              this.dataField= value.data;
              this.optionSchedule=false;
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
    this.currentDate= new Date();
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
    let list = this.http.get(`${SERVER}/${route}`);
    if (data) {
        const values = data.join('/');
        list = this.http.get(`${SERVER}/${route}/${values}`);
    }
    return list;
  }
  getField(){
    this.secondFormGroup.get('dateCtrl')?.reset();
    this.secondFormGroup.get('scheduleCtrl')?.reset();
    this.dataSchedule=[];
    this.optionSchedule=[];
    this.submitted=true;
  }
  getDateReservation(){
    this.secondFormGroup.get('scheduleCtrl')?.reset();
    const dataSchedules:any=[];
    this.optionSchedule=[];
    this.submitted=true;
    const field= this.validateSecondFormGroup().field;
    const date= this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;
    if(field?.value&&date?.value){
      // console.log(this.currentDate);
      // console.log(date.value.getDate());
      const dateFormat= this.formatDate(date.value);
        schedule?.enable();
        const url = `${SERVER}/schedule?category=${this.category}&fields=${field.value}&shift=${this.shift}&date=${dateFormat}`;
        this.http.get<any>(`${url}`).subscribe(
          (response)=>{
            response.data.map(
              (value:any)=>{    
                const hourActual=this.currentDate.getHours();
                const fechaActual=`${this.currentDate.getDate()}/${this.currentDate.getMonth()}/${this.currentDate.getFullYear()}`;
                const fechaSeleccionado=`${date.value.getDate()}/${date.value.getMonth()}/${date.value.getFullYear()}`;
                if(fechaActual === fechaSeleccionado){
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
      const selectSchedule:any=(schedule.value)?schedule.value.length:null;
      const dataSchedule:any=[]
      if(this.quantitySchedule == selectSchedule){
        this.dataSchedule.map((value:any)=>{
          dataSchedule.push(value.id)
        })
        this.optionSchedule = dataSchedule.filter((element:any) => !schedule.value.includes(element));
        this.submitted=false;
      }else{
        this.submitted=true;
        this.optionSchedule = dataSchedule.filter((element:any) => !schedule.value.includes(element));
      }
    }
  }
  isOptionDisabled(optionId: number): boolean {
    if(this.optionSchedule.length>0){
      return this.optionSchedule.includes(optionId);
    }else{
      return false;
    }
  }
  showSuccess(message:string){
    this.toastr.success(message,'CORRECTO!');
  }
  showError(message:string) {
    this.toastr.error(message,'ERROR!',{closeButton:true, positionClass:'toast-top-right'});
  }
  onSubmit(){
    const field= this.secondFormGroup?.get('fieldCtrl');
    const date= this.secondFormGroup?.get('dateCtrl');
    const schedule= this.secondFormGroup?.get('scheduleCtrl');
    
    if(field && date && schedule){
      const url = `${SERVER}/calendars/reservation/update?user=${this.data.user_id}&user_code=${this.data.user_code}&field=${this.data.field_id}&fieldNew=${field.value}&date=${this.formatDate(date.value)}&schedule=${this.scheduleId}&scheduleNew=${schedule.value}&payment=${this.data.id}`;
      this.http.get<any>(`${url}`).subscribe(
        (value:any)=>{
          if(value.code !==500){
            this.showSuccess(value.message)
          }
        },error=>{
          this.showError(error.error.message)
        }
      )
    }
    this.dialog.closeAll();
    
    // dialogRef.beforeClosed().subscribe()
  }
}