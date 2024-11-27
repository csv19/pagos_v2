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
import { NgClass, NgIf, NgFor,NgStyle } from '@angular/common';
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
const USERCODE=environment.USER_CODE;
@Component({
  selector: 'app-atm',
  standalone: true,
  imports: [FormsModule,DataTablesModule,MatProgressSpinnerModule, NgClass,MatDialogModule,MatFormFieldModule, MatInputModule, MatDatepickerModule,MatTooltipModule],
  templateUrl: './atm.component.html',
  styleUrl: './atm.component.scss'
})
export class ReportesCamposDeportivosAtmComponent implements OnDestroy, OnInit{
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
        { title: 'Nro Recibo', data: 'nro_voucher' },
        { title: 'Nro Documento', data: 'nro_document' },
        { title: 'Nombres y Apellidos', data: 'name' },
        { title: 'Precio', data: 'total' },
        { title: 'Tipo de Pago', data: 'typePayment' },
        { title: 'Fecha Pago', data: 'created_at' },  
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).off('click');
        $('td', row).on('click', () => {
          console.log(data);
        });
        return row;
      },
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
      this.http.get(`${SERVER}/calendars/reservations/atm/${date1}/${date2}`).subscribe(
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
    
    this.http.get(`${SERVER}/calendars/reservations/atm/${date1}/${date2}`).subscribe(
      (response:any)=>{
        this.reserva=response.data; 
        this.rerender();
      },error=>{console.log(error);
      }
    )
    
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
  //Extornar
  ext(field_id:number,id:number){
    const data={
      id: id,
      field_id: field_id,
      user_id: this.user,
    }
    Swal.fire({
      title: 'Estas seguro de solicitar extornar esta reserva?',
      text: 'Enviar solicitud al Administrador!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, solicitar!',
      cancelButtonText: 'No, ahora',
      customClass:{
        confirmButton: 'bg-blue-500',
        cancelButton: 'bg-red-500',
        denyButton: 'bg-red-500',
      }
    }).then((result) => {
      if (result.value) {
        console.log(data);
        
        // this.http.post(`${SERVER}/calendars/reservation/ext`, data).subscribe(
        //   response=>{
        //     this.rerender();
        //   },error=>{
        //     console.log(error);
        //   }
        // )
        Swal.fire(
          'Enviado!',
          'Se envio la solicitud con éxito.',
          'success'
        )
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title:'Cancelado',
           text:'No se envió la solicitud',
           icon: 'error',
           timer: 1500
        } 
        )
      }
    })
  }
  //Cobrar
  charge(id:number,name:string,lastName:string,total:string,type_reservation_id:number){
    console.log([id,name,lastName,total,type_reservation_id]);
    const data={
      id: id,
      name:name,
      lastName:lastName,
      total:total,
      type_reservation_id:type_reservation_id,
      user_id: this.user,
      user_code: this.user_code
    }
    const dialogRef= this.dialog.open(ReportCampoDeportivoAtmComponent,{
      data: data
    });
    dialogRef.beforeClosed().subscribe(result => {
      if(result){
        this.rerender()
      }
    });
    
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
}

@Component({
  selector: 'app-report-campo-deportivo-atm',
  standalone: true,
  imports: [ReportCampoDeportivoAtmComponent,MatDialogModule,MatButtonModule,FormsModule,ReactiveFormsModule,RouterLink,AngularSvgIconModule,ButtonComponent,NgClass,NgIf,NgFor,NgStyle,MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,],
  templateUrl: '../../../components/report-campo-deportivo-atm/report-campo-deportivo-atm.component.html',
})
export class ReportCampoDeportivoAtmComponent {
  codeId:number;
  styleBlockOption='none';
  dataTypePayments:any=[]; dataOptionPayments:any=[];
  name!:string;lastName!:string;total!:string;
  firstFormGroup = this._formBuilder.group({
    typePaymentCtrl: [null, localStorage.getItem('token')?Validators.required:null],
    optionPaymentCtrl: null,
    observationPaymentCtrl: null,
  },{ validators: this.checkFieldsNotEmpty });

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private readonly _formBuilder: FormBuilder, private readonly _router: Router, private http: HttpClient,public dialog: MatDialog, private toastr: ToastrService){
    const atm:any=localStorage.getItem('profileData');
    this.codeId=(atm)?JSON.parse(atm).data.code:USERCODE;
    this.name=data.name;
    this.lastName=data.lastName;
    this.total=data.total;
    this.http.get(`${SERVER}/type-payments/${data.type_reservation_id}/${this.codeId}`).subscribe(
      (response:any) => {
        if(response.code===200){
          this.dataTypePayments= response.data;
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );

  }
  checkFieldsNotEmpty(group: FormGroup){
    const typePayment= group.get('typePaymentCtrl')?.value;
      return (typePayment !== null ) ? null : { fieldsEmpty: true };
  }
  validatefirstFormGroup(){
    const typePayment= this.firstFormGroup?.get('typePaymentCtrl');
    const optionPayment= this.firstFormGroup?.get('optionPaymentCtrl');
    const observationPayment= this.firstFormGroup?.get('observationPaymentCtrl');
    return {typePayment, optionPayment, observationPayment};
  }
  
  getSelectFirstFormGroup(route: string, data: any) {
    let list = this.http.get(`${SERVER}/${route}`);
    if (data) {
        const values = data.join('/');
        list = this.http.get(`${SERVER}/${route}/${values}`);
    }
    return list;
  }
  async getTypePayments(){
    const typePayment= this.validatefirstFormGroup().typePayment;
    //Código de Administrador y Master no genera nro de voucher
    if(typePayment && (this.codeId!==0 && this.codeId!==2)){
      const data= [typePayment.value];
      const route='options-payments';
      if(typePayment.value==2 || typePayment.value==3 || typePayment.value==4){
        this.styleBlockOption='block';
        const dataOptionPayments:any= await this.getSelectFirstFormGroup(route,data).toPromise();
        if(dataOptionPayments.code ===200){
          this.dataOptionPayments=dataOptionPayments.data;
        }
      }else{
        this.styleBlockOption='none';
      }
      // this.resetSecondFormGroup(6);
    }
  }
  save(){
    const data={
      'id':this.data.type_reservation_id,
      'user_id':this.data.user_id,
      'user_code':this.data.user_code,
      'type_payment':this.firstFormGroup.get('typePaymentCtrl')?.value,
      'option_payment':this.firstFormGroup.get('optionPaymentCtrl')?.value,
      'observation_payment':this.firstFormGroup.get('observationPaymentCtrl')?.value,
    };  
    if(data.type_payment){
      this.http.post<any>(`${SERVER}/calendars/reservation/payment`,data).subscribe(
        (response:any)=>{
          console.log(response);
        },error=>{console.log(error);
        }
      )
    }
    
    
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
