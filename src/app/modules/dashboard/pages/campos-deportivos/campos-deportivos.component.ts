import { Component,Renderer2,ElementRef, OnInit, ViewChild } from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams,HttpHeaders } from '@angular/common/http';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl,FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule,MatStepper} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import { environment } from 'src/environments/environment';
import { NgFor, NgStyle } from '@angular/common';
import { NumberOnlyDirective } from 'src/app/number-only.directive';
import { PayService } from 'src/app/pay.service';
import { InformacionPersonaComponent } from '../../components/informacion-persona/informacion-persona.component';
import { ReniecService } from 'src/app/reniec.service';
import { ToastrService } from 'ngx-toastr';


const USERCODE=environment.USER_CODE;
const SERVER= environment.SERVER;
const HOLIDAYS=environment.API_HOLIDAY;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-campos-deportivos',
  standalone: true,
  providers:[provideNativeDateAdapter()],
  imports: [
    MatButtonModule,
    MatStepperModule,
    NgFor,
    NgStyle,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    NumberOnlyDirective,
    MatTooltipModule,
    InformacionPersonaComponent
],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})

export class CamposDeportivosComponent implements OnInit { 
  url:string=SERVER; 
  positionOption: TooltipPosition='above';
   authenticate!:boolean;
   niubiz!:number;
   stepp!:number;
   voucher!:number;
   payment!:number;
   people!:number;
   codeId:number;
   textScheduleLabel:string;
   styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;
   dataHolidays: any[]=[]; currentDate:any; nextDate:any;
   dataDocument:any; dataCategory:any; dataField:any; dataTypeReservation:any; dataShift:any; dataSchedule:any[]=[]; selectSchedule:any;
   dataTypePayments:any=[]; dataOptionPayments:any=[];
   dataPayment:any=[];
   isLinear = true;isEditable=true;
   totalPrice:any;
   price:any;
   calendar:any={
    purchaseNumber:'',
    sessionToken:'',
    people:'',
    category:'',
    field:'',
    reservation_shift:'',
    date:'',
    schedule:[],
    price:'',
   };
   reserva:any={
    calendarId:'',
    paymentId:'',
    purchaseNumber:'',
    sessionToken:'',
    total:'',
    observation:''
   };
   typeReservationShift:any;
   matcher = new MyErrorStateMatcher();
   firstFormGroup = this._formBuilder.group({
    personData: ['', Validators.required],
  });
 

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
  
  constructor(private route: ActivatedRoute, private router: Router, private _formBuilder: FormBuilder, private http: HttpClient, private payService: PayService, private renderer: Renderer2, private el: ElementRef, private personService: ReniecService, private toastr: ToastrService){
    const atm:any=localStorage.getItem('profileData');
    this.codeId=(atm)?JSON.parse(atm).data.code:USERCODE;
    this.route.data.subscribe(data => {
      this.authenticate = data['authenticate'];
    });
    this.textScheduleLabel='Horarios Disponibles';
    this.getCalendar();
    this.http.get(`${SERVER}/categories`).subscribe(
      (response:any) => {
        if(response.code===200){
          this.dataCategory= response.data;
        }
      },
      (error:any) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.route.data.subscribe();
  }
  @ViewChild('stepper') stepper!: MatStepper;
  public atm:any={};
  ngOnInit(): void {
    this.route.url.subscribe((url:any)=>{
        const data:any=[];
        url.map((value:any)=>{data.push(value.path)})
        const route:string=(this.authenticate)?'admin/caja':'';
        this.stepp=data[2];
        this.payment=data[3];
        this.people=data[4];
        if(this.stepp !=2){
          this.router.navigate([`${route}/campos-deportivos`]);  
        }else{
          this.isEditable=false;
          this.getVoucher(this.payment,this.people);
        }
    })
  }
  receiveFormData(data: any) {
    this.firstFormGroup?.get('personData')?.setValue(data)
    this.stepper.next();
  }
  //SECOND GROUP
  getCalendar(){
    const today = new Date();
    const year = today.getFullYear();
    const month=('0' + (today.getMonth() + 1)).slice(-2);
    const proxday = ('0' + (today.getDate() + 14)).slice(-2);
    const tokenHoliday={token:'coworkingholiday'}
    this.nextDate = `${year}-${month}-${proxday}`;
    this.currentDate= today;
    this.http.post<any>(HOLIDAYS,tokenHoliday).subscribe(
      (response:any)=>{
        if(response.code === 200){
          this.dataHolidays=response.data;
        }
      },
      (error:any)=>{
        console.error('Not found');
      }
    )
  }
  formatDate(date:any){
    const fecha = new Date(Date.parse(date));
    const year = fecha.getFullYear();
    const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const day = ('0' + fecha.getDate()).slice(-2);
    const dateFormat = `${day}-${month}-${year}`;
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
  resetSecondFormGroup(option:number){
    const category= this.validateSecondFormGroup().category;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const field= this.validateSecondFormGroup().field;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;
    const typePayment= this.validateSecondFormGroup().typePayment;
    const optionPayment=this.validateSecondFormGroup().optionPayment;
    const observationPayment=this.validateSecondFormGroup().observationPayment;
    if(option){
      let data=[category,typeReservation,field,shift,date,schedule,typePayment,optionPayment,observationPayment];
      data.splice(0,option);
      data.map((item:any)=>{
        if(item.value){
          item.reset()
          item.setValue(null)              
        }
      })
    }
  }
  getSelectSecondFormGroup(route: string, data: any) {
    let list = this.http.get(`${SERVER}/${route}`);
    if (data) {
        const values = data.join('/');
        list = this.http.get(`${SERVER}/${route}/${values}`);
    }
    return list;
  }
  async getCategory(){
    const category= this.validateSecondFormGroup().category;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const route='typeReservations';
    typeReservation?.disable();
    if(category?.value){
      typeReservation?.enable()
      const data=[
        category.value,this.codeId
      ];
      const dataTypeReservation:any= await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataTypeReservation.code ===200){
        this.dataTypeReservation=dataTypeReservation.data;
      }
    }
    this.resetSecondFormGroup(1);
  }
  async getTypeReservation(){
    const category= this.validateSecondFormGroup().category;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const field= this.validateSecondFormGroup().field;
    const date= this.validateSecondFormGroup().date;
    date?.disable()
    const route='fields';
    field?.disable()
    if(category?.value && typeReservation?.value){
      field?.enable()
      const data=[typeReservation.value];
      const dataField:any= await this.getSelectSecondFormGroup(route,data).toPromise();
      this.http.get(`${SERVER}/type-payments/${typeReservation.value}/${this.codeId}`).subscribe(
        (response:any) => {
          if(response.code===200){
            this.dataTypePayments= response.data;
          }
        },
        (error:any) => {
          console.error('Error en la solicitud:', error);
        }
      );
      if(dataField.code ===200){
        this.dataField=dataField.data;
      }
    }
    this.resetSecondFormGroup(2);
  }
  async getShift(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    date?.disable()
    shift?.disable()
    if(category?.value && typeReservation?.value && field?.value){
      shift?.enable()
      const route='shifts';
      const data=[category.value,typeReservation.value,field.value];
      console.log(data);
      
      const dataShift:any=await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataShift.code ===200){
        this.dataShift= dataShift.data;
      } 
    }
    this.resetSecondFormGroup(3);
  }
  async getDateReservation(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    date?.disable()
    if(category && typeReservation && field && shift){
      date?.enable()
    }
    this.resetSecondFormGroup(4);
  }
  getSchedules(){
    const dataSchedules:any=[];
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;

    schedule?.disable()
    if(category?.value&&field?.value&&shift?.value&&date?.value){
      schedule?.enable()
      const dateFormat= this.formatDate(date.value);
        let params;
        if(this.authenticate){
          params = field.value.map((value:any) => `${value}`).join(',');
        }else{
          params = field.value;
        }
        const url = `${SERVER}/schedules?fields=${params}&category=${category.value}&shift=${shift.value}&date=${dateFormat}`;
        this.http.get<any>(`${url}`).subscribe(
          (response:any)=>{
            response.data.map(
              (value:any)=>{  
                const dateSystem=`${this.currentDate.getDate()}-${this.currentDate.getMonth()}-${this.currentDate.getYear()}`;
                const dataReservation=`${date.value.getDate()}-${date.value.getMonth()}-${date.value.getYear()}`;
                if(dateSystem === dataReservation){
                  if(Number(value.hour_start) >=this.currentDate.getHours() ){
                    dataSchedules.push(value)
                  }
                }else{
                  dataSchedules.push(value)
                }            
              }
            )
            this.dataSchedule=dataSchedules;
            this.textScheduleLabel=(this.dataSchedule.length>0)?'Horarios Disponibles':'No hay horarios disponibles';
          }
        )
    }
    // this.resetSecondFormGroup(4);
  }
  async getTotal(){
    const category= this.validateSecondFormGroup().category;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const field= this.validateSecondFormGroup().field;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;
    
    if( category?.value&& typeReservation?.value && field?.value&& shift?.value && date?.value && schedule?.value){
      const categoryReservation:any=[];
      const fieldData=field.value.length===undefined?field.value:field.value[0]
      this.dataField.map((value:any)=>{
        if(value.id === fieldData){
          categoryReservation.push(value)
        }
      })
      const route='detailShifts';
      const data=[categoryReservation[0].category_field_id,shift.value];
      const quantity= schedule.value.length;
      const fields= (this.authenticate)?field?.value.length:1;
      const total:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      try{
        if(total.code ===200){
          this.price=(total.data[0].price).toString();
          this.totalPrice=  (total.data[0].price * quantity * fields).toString();
        }
      }catch(error){
        console.log(error);
        
      }
    }
  }
  async setPerson(){
    const person:any=this.firstFormGroup.get('personData');
    let personId
    if(person){
      if(person.value.id === 0){
        const response=await this.personService.savePerson(person.value).toPromise()
        personId=response.data[0].inserted_id;
      }else{
        personId=person.value.id
      }
    }
    return personId;
  }
  async getTypePayments(){
    const typePayment= this.validateSecondFormGroup().typePayment;
    //Código de Administrador y Master no genera nro de voucher
    if(typePayment && (this.codeId!==0 && this.codeId!==2)){
      const data= [typePayment.value];
      const route='options-payments';
      if(typePayment.value==2 || typePayment.value==3 || typePayment.value==4){
        this.styleBlockOption='block';
        const dataOptionPayments:any= await this.getSelectSecondFormGroup(route,data).toPromise();
        if(dataOptionPayments.code ===200){
          this.dataOptionPayments=dataOptionPayments.data;
        }
      }else{
        this.styleBlockOption='none';
      }
      // this.resetSecondFormGroup(6);
    }
  }
  paymentUser(personId:number){
    this.http.get(`${SERVER}/niubiz/purchaseNumber`).subscribe(
      (response:any)=>{        
         this.niubiz=response.data[0].purchaseNumber
      }
    )
    this.payService.getMount(this.totalPrice);
      this.payService.getSessionToken().subscribe(
        (response)=>{
        },
        (error)=>{
          const sessionToken=error.error.text;
          this.calendar={
            purchaseNumber: this.niubiz,
            sessionToken: sessionToken,
            people: personId,
            category: this.validateSecondFormGroup().category?.value,
            typeReservation:this.validateSecondFormGroup().typeReservation?.value,
            field: this.validateSecondFormGroup().field?.value,
            shift:this.validateSecondFormGroup().shift?.value,
            date: this.formatDate(this.validateSecondFormGroup().date?.value),
            schedule: this.validateSecondFormGroup().schedule?.value,
            price: this.price,
            total: this.totalPrice,
          } 
          const route='calendars/niubiz';
          this.http.post<any>(`${SERVER}/${route}`, this.calendar).subscribe(
            (response:any) => {
              if (response && response.code === 200) {   
                this.reserva.calendarId=response.data.calendar_id;
                this.reserva.paymentId=response.data.payment_id;
                this.reserva.purchaseNumber=response.data.purchaseNumber;
                this.reserva.sessionToken=response.data.token_session;
                this.reserva.total=this.totalPrice;
                this.pay(this.reserva.calendarId,this.reserva.paymentId,this.reserva.total,this.reserva.purchaseNumber,this.reserva.sessionToken) 
              }
            },(error:any)=>{
              this.showError(error.error.message);
              
            }
          );
        }
      )
  }
  paymentAdmin(personId:number,atmId:number ,atmCode:number){
    this.calendar={
      people: personId,
      field: this.validateSecondFormGroup().field?.value,
      category: this.validateSecondFormGroup().category?.value,
      typeReservation:this.validateSecondFormGroup().typeReservation?.value,
      date: this.formatDate(this.validateSecondFormGroup().date?.value),
      schedule: this.validateSecondFormGroup().schedule?.value,
      price: this.price,
      total: this.totalPrice,
      userId: atmId,
      userCode: atmCode,
      //Codigo 0 para el Administrador || Código 2 para el Master
      statePay: (this.codeId==0 || this.codeId==2)?0:1,
      module: this.validateSecondFormGroup().typePayment?.value,
      option: this.validateSecondFormGroup().optionPayment?.value,
      observation: this.validateSecondFormGroup().observationPayment?.value,
    } 
    const route='calendars/atm';
    this.http.post<any>(`${SERVER}/${route}`, this.calendar).subscribe(
      (response:any) => {
        if (response && response.code === 200) {   
          console.log(response);
          this.isEditable=false;
          const payment=response.data.payment_id;
          const people=response.data.people_id;
          this.getVoucher(payment,people);
          this.stepper.next();
          // this.print(payment);
        }
      },(error:any)=>{
        console.error(error.error.message)
        this.showError(error.error.message);
      }
    );
  }
  async save(){
    const personId= await this.setPerson()
    if(this.authenticate){
      const atm:any=localStorage.getItem('profileData');
      const userId=JSON.parse(atm).data.id;
      console.log(userId);
      
      this.paymentAdmin(personId,userId,this.codeId);
    }else{
      this.paymentUser(personId);
    }    
  }
  pay(calendar_id:number,payment_id:number,total:string,purchaseNumber:string,sessionToken:string){
    console.log(sessionToken);    
    const module_id=3;  
    this.payService.getToken(sessionToken).subscribe((data) => {
      const responseToken = data.sessionKey;
      const script = this.renderer.createElement('script');
      const url=`${SERVER}/payment/${module_id}/${calendar_id}/${payment_id}/${total}`;
      script.type = 'text/javascript';
      script.text = this.payService.getVisa(
        responseToken,
        total,
        purchaseNumber,
        url
      );
      this.renderer.appendChild(this.el.nativeElement, script);
    })
  }
  
  //THIRD GROUP
  getVoucher(paymentId:number,peopleId:number){
    const module=3;//CAMPOS DEPORTIVOS
    this.http.get(`${SERVER}/voucher/${module}/${paymentId}/${peopleId}`).subscribe(
      (response:any)=>{
        console.log(response);
        
        this.dataPayment=response.data;        
        let total=0;
        response.data.map((value:any)=>
        total +=value.price_reservation)
        this.totalPrice=total;
        this.reserva.calendarId=this.dataPayment[0].calendar_id;
        this.reserva.paymentId=this.dataPayment[0].payment_id;
        this.reserva.total=this.totalPrice;
        this.reserva.purchaseNumber=this.dataPayment[0].purchaseNumber;
        this.reserva.sessionToken=this.dataPayment[0].sessionToken;
        this.reserva.observation=this.dataPayment[0].observation;
      },(error:any)=>{
        this.showError('Error al mostrar recibo');
      }


    )
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
  reset(){
    window.location.reload();
  }
}
