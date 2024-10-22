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
import { ToastrService } from 'ngx-toastr';



const HOME= environment.HOME;
const OPTION_DOCUMENT=environment.API_DOCUMENT;
const DASHBOARD_DOCUMENT=environment.API_DASHBOARD_DOCUMENT;
const RESERVATION=environment.SERVER;
const RESERVATION2= environment.SERVER2;
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
  ],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})
export class CamposDeportivosComponent implements OnInit { 
  url:string=RESERVATION2; 
  positionOption: TooltipPosition='above';
   authenticate!:boolean;
   stepp!:number;
   voucher!:number;
   payment!:number;
   isButtonDisabled = false;
   textScheduleLabel:string;
   arrow = 'assets/icons/heroicons/solid/arrow.svg';
   styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;
   dataHolidays: any[]=[]; currentDate:any; nextDate:any;
   dataDocument:any; dataCategory:any=[]; dataField:any=[]; dataTypeReservation:any=[]; dataShift:any; dataSchedule:any[]=[]; selectSchedule:any;
   dataTypePayments:any=[]; dataOptionPayments:any=[];selectedIds:any=[];
   dataVoucher:any=[];
   isLinear = true;isEditable=true;
   totalPrice:any;
   niubiz!:number;
   date:any;
   price:number=0;
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
    people_id:0,
    campus:'',
    category:'',
    field:'',
    reservation:'',
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
    dateCtrl: [{ value:new Date(), disabled: true }, Validators.required],
    scheduleCtrl: [{ value:null, disabled: true }, Validators.required],
    typePaymentCtrl: [null, localStorage.getItem('token')?Validators.required:null],
    optionPaymentCtrl: null,
    observationPaymentCtrl: null,
  },{ validators: this.checkFieldsNotEmptySecondGroup });
  
  constructor(private route: ActivatedRoute, private router: Router, private _formBuilder: FormBuilder, private http: HttpClient, private payService: PayService, private renderer: Renderer2, private el: ElementRef,private toastr: ToastrService){
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
          response.data.map((value:any)=>{
            if(value.tbl == 'categoria'){
              this.dataCategory.push(value);
            }
          })
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
    const day=(Number(proxday)>=30)?30:proxday;
    this.nextDate = `${year}-${month}-${day}`;
    this.currentDate= today;
    this.http.get<any>(HOLIDAYS).subscribe(
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
     return !restrinctDays;
  }; 
  checkFieldsNotEmptyFirstGroup(group: FormGroup) {
    const option_document = group.get('documentOptionCtrl')?.value;
    const document = group.get('documentCtrl')?.value;
    const fullName = group.get('fullName')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastName')?.value;
    const email = group.get('emailCtrl')?.value;
    if(option_document !==3){
      return (document !== null && name !== null && lastName !== null && email !== null) ? null : { fieldsEmpty: true };
    }else{
      return (document !== null && fullName !==null && email !== null) ? null : { fieldsEmpty: true };
    }
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
    const  list = this.http.post<any>(`${RESERVATION2}/${route}`, data);
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
            this.person.name='';
            this.person.lastName='';
            this.totalPrice='';
            break;
      case 2: 
            typeReservation?.enable();
            typeReservation?.reset();
            this.calendar.price='';
            this.totalPrice='';
            break;
      case 3:
            date?.reset();
            schedule?.disable();
            schedule?.reset();
            this.calendar.price='';
            this.totalPrice='';
            break;
      case 4:
            schedule?.enable();
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
      this.person.document=nro_document;
      this.person.typeDocument=option_document;
      this.http.get<any>(`${DASHBOARD_DOCUMENT}/${nro_document}/${option_document}`).subscribe(
        (response: any) => {
          if (response.code === 200) {
            const data = response.data[0] ? response.data[0] : response.data;
            if(data.id){
              this.calendar.people_id = data.id;
              this.person.name = (option_document !== 3)?data.name:data.fullName;
              this.person.lastName = (option_document !== 3)?data.lastName:'';
              this.person.email=data.email;
              email?.setValue(data.email);
              email?.disable();
              const dataPhone = data.phone ?? null;
              phone?.setValue(dataPhone);
              phone?.disable();
            }else{
              this.person.name = (option_document !== 3)?data.name:data.fullName;
              this.person.lastName = (option_document != 3)?data.lastName:'';
              email?.enable();
            }
            const setNameAndLastName = (nameValue: string, lastNameValue: string) => {
              if(option_document !== 3){
                lastName?.setValue(this.authenticate ?lastNameValue: this.convertText(lastNameValue, 1) , 1);
                name?.setValue(this.authenticate ?nameValue: this.convertText(nameValue, 1), 1);
              }else{
                fullName?.setValue(data.name);
              }
            };
            setNameAndLastName(data.name, data.lastName);
          }
        },(error) => {
          if (error.error.code === 404) {
            if(option_document !== 3){
              name?.enable()
              lastName?.enable()
            }else{
              fullName?.enable()
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
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const email = this.validateFirstFormGroup().email;
    const phone = this.validateFirstFormGroup().phone;
    if(this.calendar.people_id == 0){
      this.person.name = this.person.name || (this.person.typeDocument !== 3 ? name?.value : fullName?.value);
      this.person.lastName = this.person.lastName || lastName?.value;
      this.person.email = email?.value;
      this.person.phone = phone?.value;
      const route='person';
      const person:any=await this.savePerson(route,this.person).toPromise();
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
    this.dataField=[];
    if(category){
      const data=[category.value];
      const dataField:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataField.code ===200){
        dataField.data.map((value:any)=>{
          if(value.tbl=='campo'){this.dataField.push(value)}
        })
      }
    }
    this.resetValidateSecondFormGroup(1);
  }
  async getField(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const route='typeReservations';
    this.dataTypeReservation=[];
    if(category?.value && field?.value){
      const data=[category.value,field.value];
      const dataTypeReservation:any= await this.getSelectSecondFormGroup(route,data).toPromise();
      const dataReserva=Object.values(dataTypeReservation.data)
      if(dataTypeReservation.code ===200){
        dataReserva.map((value:any)=>{
          if(value.tbl=='reserva'){this.dataTypeReservation.push(value)}
        })
      }
    }
    this.resetValidateSecondFormGroup(2);
  }
  async getTypeReservation(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    if(category?.value &&field?.value &&typeReservation?.value){
      const route='dates';
      const data=[category.value,field.value, typeReservation.value];
      const dataList:any= await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataList.code ===200){
        dataList.data.map((value:any)=>{
          if(value.tbl=='sede'){
           this.calendar.campus=value.ID
          }
        })
      }
    }
    this.resetValidateSecondFormGroup(3);
  }
  async getDateReservation(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const date=this.validateSecondFormGroup().date;
    this.dataSchedule=[];
    if(category?.value&&field?.value&&typeReservation?.value&&date?.value){
      const fecha = new Date(date.value);
      this.date = fecha.toISOString().slice(0, 10).replace(/-/g, '').slice(0, 8);
      const data=[this.calendar.campus,category.value,field.value,typeReservation.value,this.date];
      const route='schedules';
      const dataSchedules:any= await this.getSelectSecondFormGroup(route,data).toPromise();
      if(dataSchedules.code == 200){
        this.textScheduleLabel = dataSchedules.data.length < 1 ? "No Hay Horarios Disponibles": "Horarios Disponibles";
        dataSchedules.data.map((value:any)=>{
          this.dataSchedule.push(value)
        })
      }
    }
    this.resetValidateSecondFormGroup(4);
  }
  
  async getSchedule(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const date=this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;
    if(category?.value&&field?.value&&typeReservation?.value&&date?.value && schedule?.value){
      this.price = schedule.value.reduce((accum:any, selectedId:any) => {
        const selectedItem = this.dataSchedule.find(item => item.id === selectedId.toString());
        return selectedItem ? accum + parseFloat(selectedItem.VALOR) : accum;
      }, 0);
      this.totalPrice=(this.price).toString();
    }
  }
  async save(){
    this.isButtonDisabled = true;
    this.setPerson();
    this.payService.getMount(this.totalPrice);
    this.http.get(`${RESERVATION2}/niubiz/purchaseNumber`).subscribe(
      (response:any)=>{        
        this.niubiz=response.data[0].purchaseNumber
      }
      )
    this.payService.getSessionToken().subscribe(
        (response)=>{},
        (error)=>{
          const sessionToken=error.error.text;
          this.calendar={
            purchaseNumber: this.niubiz,
            sessionToken: sessionToken,
            people_id: this.calendar.people_id,
            campus: this.calendar.campus,
            category: this.validateSecondFormGroup().category?.value,
            field: this.validateSecondFormGroup().field?.value,
            reservation: this.validateSecondFormGroup().typeReservation?.value,
            date: this.date,
            schedule: this.validateSecondFormGroup().schedule?.value,
            price: this.price,
            total:this.totalPrice
          } 
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
              this.showError(error.error.message);
            }
          );
        }
      )
    
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
    const module=3;
    this.http.get(`${RESERVATION2}/payment/voucher/${module}/${voucherId}/${paymentId}`).subscribe(
      (response:any)=>{
        this.dataVoucher=response.data;
        let total=0;
        response.data.map((value:any)=>
          total += parseInt(value.total)
        )
        this.totalPrice=total;
      },error=>{console.error(error)}
    )
  }
  print(voucherId:number,paymentId:number) {
    const url = `${RESERVATION2}/fields/voucher/${voucherId}/${paymentId}/2`; 
    window.open(url, '_blank');
  }
  showError(message:string) {
    this.toastr.error(message,'ERROR!',{closeButton:true, positionClass:'toast-top-right'});
  }
}

