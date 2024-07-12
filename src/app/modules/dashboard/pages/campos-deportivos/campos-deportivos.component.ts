import { Component,Renderer2,ElementRef, OnInit, ViewChild } from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
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



const HOME= environment.HOME;
const OPTION_DOCUMENT=environment.API_DOCUMENT;
const DASHBOARD_DOCUMENT=environment.API_DASHBOARD_DOCUMENT;
const RESERVATION=environment.SERVER;
const RESERVATION2= environment.SERVER2;
const HOLIDAYS=environment.API_HOLIDAY;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    // console.log(control && control.invalid && (control.dirty || control.touched || isSubmitted));
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
  ],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})
export class CamposDeportivosComponent implements OnInit {   
  positionOption: TooltipPosition='above';
   authenticate!:boolean;
   stepp!:number;
   voucher!:number;
   payment!:number;
   textScheduleLabel:string;
   styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;
   dataHolidays: any[]=[]; currentDate:any; nextDate:any;
   dataDocument:any; dataCategory:any; dataField:any; dataTypeReservation:any; dataShift:any; dataSchedule:any[]=[]; selectSchedule:any;
   dataTypePayments:any=[]; dataOptionPayments:any=[];
   dataVoucher:any=[];
   isLinear = true;isEditable=true;
   totalPrice:any;
   person:any={
    typeDocument:'',
    document:'',
    name:'',
    lastName:'',
    email:'',
    phone:''
   };
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
   typeReservationShift:any;
   matcher = new MyErrorStateMatcher();
  // Validador de formularios
   firstFormGroup = this._formBuilder.group({
    documentOptionCtrl:[ '', Validators.required],
    documentCtrl:[{ value:'', disabled: true }, [Validators.required , Validators.minLength(this.sizeCharter), Validators.maxLength(this.sizeCharter)]],
    nameCtrl: [{ value:'', disabled: true }, Validators.required],
    lastNameCtrl: [{ value:'', disabled: true }, Validators.required],
    fullNameCtrl: [{ value:'', disabled: true }, Validators.required],
    emailCtrl: [{ value:'', disabled: true }, [Validators.required, Validators.email]],
    phoneCtrl: [{ value:'', disabled: true }],
  },{ validators: this.checkFieldsNotEmptyFirstGroup });

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
  
  constructor(private route: ActivatedRoute, private router: Router, private _formBuilder: FormBuilder, private http: HttpClient, private payService: PayService, private renderer: Renderer2, private el: ElementRef,

  ){
    this.route.data.subscribe(data => {
      this.authenticate = data['authenticate'];
    });
    this.textScheduleLabel='Horarios Disponibles';
    this.getCalendar();
    this.http.get(OPTION_DOCUMENT).subscribe(
      (response:any) => {
        this.dataDocument = response.data;
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.http.get(`${RESERVATION2}/categories`).subscribe(
      (response:any) => {
        if(response.code===200){
          this.dataCategory= response.data;
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.http.get(`${RESERVATION2}/type-payments`).subscribe(
      (response:any) => {
        if(response.code===200){
          this.dataTypePayments= response.data;
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.route.data.subscribe();
  }
  @ViewChild('stepper') stepper!: MatStepper;
  public atm:any={};
  ngOnInit(): void {
    this.route.url.subscribe(url=>{
        const data:any=[];
        url.map((value:any)=>{data.push(value.path)})
        const route:string=(this.authenticate)?'admin':'';
        this.stepp=data[2];
        this.voucher=data[3];
        this.payment=data[4];
        if(this.stepp !=2){
          this.router.navigate([`${route}/campos-deportivos`]);  
        }else{
          this.isEditable=false;
          this.getVoucher(this.voucher, this.payment);
        }
    })
  }
  getCalendar(){
    const today = new Date();
    const year = today.getFullYear();
    const month=('0' + (today.getMonth() + 1)).slice(-2);
    const proxday = ('0' + (today.getDate() + 14)).slice(-2);
    const tokenHoliday={token:'coworkingholiday'}
    this.nextDate = `${year}-${month}-${proxday}`;
    this.currentDate= today;
    this.http.post<any>(HOLIDAYS,tokenHoliday).subscribe(
      (response)=>{
        if(response.code === 200){
          this.dataHolidays=response.data;
        }
      },
      (error)=>{
        console.error('Not found');
      }
    )
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
  checkFieldsNotEmptyFirstGroup(group: FormGroup) {
    const document = group.get('documentCtrl')?.value;
    const fullName = group.get('fullName')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastName')?.value;
    const email = group.get('emailCtrl')?.value;
    return (document !== null && fullName !==null && name !== null && lastName !== null && email !== null) ? null : { fieldsEmpty: true };
  }
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
  //FIRST GROUP
  validateFirstFormGroup(){
    const option_document= this.firstFormGroup?.get('documentOptionCtrl');
    const document= this.firstFormGroup?.get('documentCtrl');
    const name= this.firstFormGroup?.get('nameCtrl');
    const lastName= this.firstFormGroup?.get('lastNameCtrl');
    const fullName= this.firstFormGroup?.get('fullNameCtrl');
    const email= this.firstFormGroup?.get('emailCtrl');
    const phone= this.firstFormGroup?.get('phoneCtrl');
    return {
      option_document,document,fullName,name,lastName,email,phone
    };
  }
  resetValidateFirstFormGroup(){
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const email=this.validateFirstFormGroup().email;
    const phone=this.validateFirstFormGroup().phone;
    fullName?.disable();
    name?.disable();
    lastName?.disable();
    fullName?.reset();
    name?.reset();
    lastName?.reset();
    email?.disable();
    phone?.disable();
    email?.reset();
    phone?.reset();
    this.calendar.people_id=0;
    return{name,lastName,email,phone};
  }
  savePerson(route: string, data: any) {
    const  list = this.http.post<any>(`${RESERVATION2}/${route}`, this.person);
    return list;
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
  convertText(value: any, type: number): string {
    const text= value.toString();
    const size:number=(type==1)?3:4;
    const firstString = text.substring(0, size);
    const hiddenString = '*'.repeat(text.length - size);
    return firstString + hiddenString;
  }
  
  makeDocument(option_document:any, nro_document:any){
    const email = this.validateFirstFormGroup().email;
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const phone = this.validateFirstFormGroup().phone;
    this.resetValidateFirstFormGroup();
    this.resetValidateSecondFormGroup(1);

    if(nro_document.length === this.sizeCharter){
      this.http.get<any>(`${DASHBOARD_DOCUMENT}/${nro_document}/${option_document}`).subscribe(
        (response: any) => {
          if (response.code === 200) {
            const data = response.data[0] ? response.data[0] : response.data;
            console.log(data);
            if (option_document != 3) {
              if(data.id){
                this.calendar.people_id = data.id;
                email?.setValue(data.email);
                email?.disable();
                const dataPhone = data.phone ?? null;
                phone?.setValue(dataPhone);
                phone?.disable();
              }
              const setNameAndLastName = (nameValue: string, lastNameValue: string) => {
                name?.setValue(this.authenticate ?nameValue: this.convertText(nameValue, 1), 1);
                lastName?.setValue(this.authenticate ?lastNameValue: this.convertText(lastNameValue, 1) , 1);
              };
              setNameAndLastName(data.name, data.lastName);
            } else {
              fullName?.setValue(data.name);
            }
          }
          console.log(this.calendar);
          
        },
        (error) => {
          console.error('Error en la solicitud:', error);
          if (error.error.code === 404) {
            if (option_document != 3) {
              name?.enable();
              lastName?.enable();
            } else {
              fullName?.enable();
            }
          }
        }
      );
    }
    
  }
  getDocumentOption(){
    const {option_document, document}=this.validateFirstFormGroup();
    if(option_document){
      switch (option_document.value){
        case 1: this.sizeCharter=8; this.styleBlockDocument='block'; this.styleBlockRuc='none'; break
        case 2: this.sizeCharter=9; this.styleBlockDocument='block'; this.styleBlockRuc='none'; break
        case 3: this.sizeCharter=11;this.styleBlockDocument='none'; this.styleBlockRuc='block'; break
        default: this.sizeCharter=8;
      }
      document?.enable();
      document?.reset();
      this.resetValidateFirstFormGroup();
    }
  }
  getDocument(){
    const option_document:any=this.validateFirstFormGroup().option_document;
    const document:any=this.validateFirstFormGroup().document;
    const email=this.validateFirstFormGroup().email;
    const phone=this.validateFirstFormGroup().phone;
    if(document){
      this.makeDocument(option_document.value,document.value);
      email?.enable();
      phone?.enable();
    }
  }
 async setPerson(){
    if(this.calendar.people_id == 0 || this.calendar.people_id==null){
      this.person={
        typeDocument:this.validateFirstFormGroup().option_document?.value,
        document:this.validateFirstFormGroup().document?.value,
        name:this.validateFirstFormGroup().name?.value,
        lastName:this.validateFirstFormGroup().lastName?.value,
        email:this.validateFirstFormGroup().email?.value,
        phone:this.validateFirstFormGroup().phone?.value
      }
      const route='person';
      const data=this.person;
      const person:any=await this.savePerson(route,data).toPromise();
      this.calendar.people_id=person.data[0].inserted_id;
    }
  }
  //SECOND GROUP
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
  async getTypePayments(){
    const typePayment= this.validateSecondFormGroup().typePayment;
    if(typePayment){
      this.resetValidateSecondFormGroup(6);
      const data= [typePayment.value];
      const route='options-payments';
      const dataOptionPayments:any= await this.getSelectSecondFormGroup(route,data).toPromise();
        if(dataOptionPayments.code ===200){
          if(typePayment.value==2 || typePayment.value==3 || typePayment.value==4){
            this.styleBlockOption='block';
            this.dataOptionPayments=dataOptionPayments.data;
          }else{
            this.styleBlockOption='none';
          }
        }      
    }
  }
  async save(){
    const atm:any=localStorage.getItem('profileData');
    this.atm=JSON.parse(atm);
    this.setPerson()
    if(this.authenticate){
      this.calendar={
        people_id: this.calendar.people_id,
        field: this.validateSecondFormGroup().field?.value,
        category: this.validateSecondFormGroup().category?.value,
        reservation_shift: this.calendar.reservation_shift,
        date: this.formatDate(this.validateSecondFormGroup().date?.value),
        schedule: this.validateSecondFormGroup().schedule?.value,
        price: this.calendar.price,
        total: this.totalPrice,
        userId: this.atm.data.id,
        module: this.validateSecondFormGroup().typePayment?.value,
        option: this.validateSecondFormGroup().optionPayment?.value,
        observation: this.validateSecondFormGroup().observationPayment?.value,
      } 
      console.log("Pago por Admin");
      const route='calendars/atm';
      this.http.post<any>(`${RESERVATION2}/${route}`, this.calendar).subscribe(
        (response) => {
          if (response && response.code === 200) {   
            console.log(response);
            this.isEditable=false;
            const voucher=response.data.voucher_id;
            const payment=response.data.payment_id;
            this.stepper.next();
            this.getVoucher(voucher,payment);
            this.print(voucher,payment);
          }
        },(error)=>{
          console.error(error.error.message)
          alert(error.error.message)
        }
      );
      
      
    }else{
      this.payService.getMount(this.totalPrice);
      this.payService.getSessionToken().subscribe(
        (response)=>{
          console.log(response);
        },
        (error)=>{
          const sessionToken=error.error.text;
          this.calendar={
            purchaseNumber: 1001000,
            sessionToken: sessionToken,
            people_id: this.calendar.people_id,
            field: this.validateSecondFormGroup().field?.value,
            category: this.validateSecondFormGroup().category?.value,
            reservation_shift: this.calendar.reservation_shift,
            date: this.formatDate(this.validateSecondFormGroup().date?.value),
            schedule: this.validateSecondFormGroup().schedule?.value,
            price: this.calendar.price,
            total: this.totalPrice,
          } 
          console.log(this.calendar);
          const route='calendars/niubiz';
          this.http.post<any>(`${RESERVATION2}/${route}`, this.calendar).subscribe(
            (response) => {
              if (response && response.code === 200) {   
                const calendarId=response.data.calendar_id;
                const voucherId=response.data.voucher_id;
                const paymentId=response.data.payment_id;
                const total=response.data.total;
                this.pay(calendarId,voucherId,paymentId,total,sessionToken);
              }
            },(error)=>{
              console.error(error.error.message)
              alert(error.error.message)
            }
          );
        }
      )
    }
  }
  
  pay(calendar_id:number, voucher_id:number,payment_id:number,total:string,sessionToken:string){
    const module_id=3;  
    this.payService.getToken(sessionToken).subscribe((data) => {
      const responseToken = data.sessionKey;
      const script = this.renderer.createElement('script');
      const url=`${RESERVATION2}/voucher/${module_id}/${calendar_id}/${voucher_id}/${payment_id}/${total}`;
      script.type = 'text/javascript';
      script.text = this.payService.getVisa(
        responseToken,
        total,
        this.calendar.purchaseNumber,
        url
      );
      this.renderer.appendChild(this.el.nativeElement, script);
    })
  }
  //THIRD GROUP
  getVoucher(voucherId:number,paymentId:number){
    this.http.get(`${RESERVATION2}/payment/voucher/${voucherId}/${paymentId}`).subscribe(
      (response:any)=>{
        console.log(response);
        this.dataVoucher=response.data;
        let total=0;
        response.data.map((value:any)=>
          total +=value.price_reservation)
        this.totalPrice=total;
      },error=>{console.error(error)}
    )
  }
  print(voucherId:number,paymentId:number) {
    const url = `${RESERVATION2}/fields/voucher/${voucherId}/${paymentId}/2`; 
    window.open(url, '_blank');
  }
}
