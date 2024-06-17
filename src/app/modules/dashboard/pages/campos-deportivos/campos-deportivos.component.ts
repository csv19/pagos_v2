import { Component,Renderer2,ElementRef, OnInit } from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl,FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { environment } from 'src/environments/environment';
import { NgFor, NgStyle } from '@angular/common';
import { NumberOnlyDirective } from 'src/app/number-only.directive';
import { PayService } from 'src/app/pay.service';

const OPTION_DOCUMENT=environment.API_DOCUMENT;
const DASHBOARD_DOCUMENT=environment.API_DASHBOARD_DOCUMENT;
const PIDE_DNI=environment.API_DNI;
const PIDE_CE=environment.API_CARNET;
const PIDE_RUC=environment.API_RUC;
const RESERVATION=environment.SERVER;
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
    NumberOnlyDirective
  ],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})
export class CamposDeportivosComponent implements OnInit {   
   authenticate:boolean | undefined;
   styleBlockDocument:string='block'; styleBlockRuc:string='none'; sizeCharter!:number;
   dataHolidays: any[]=[]; currentDate:any; nextDate:any;
   dataDocument:any; dataCategory:any; dataField:any; dataTypeReservation:any; dataShift:any; dataSchedule:any[]=[]; selectSchedule:any;
   isLinear = true;
   person:any={
    typeDocument:'',
    document:'',
    name:'',
    lastName:'',
    email:'',
    phone:''
   };
   calendar:any={
    purchasenumber:'',
    people_id:'',
    category:'',
    field:'',
    reservation_shift:'',
    typeReservation:'',
    shift:'',
    date:'',
    schedule:[],
    price:''
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
    categoryCtrl: ['', Validators.required],
    fieldCtrl: [{ value:'', disabled: true }, Validators.required],
    typeReservationCtrl: [{ value:'', disabled: true }, Validators.required],
    shiftCtrl: [{ value:'', disabled: true }, Validators.required],
    dateCtrl: [{ value:'', disabled: true }, Validators.required],
    scheduleCtrl: [{ value:'', disabled: true }, Validators.required],
  },{ validators: this.checkFieldsNotEmptySecondGroup });
  
  constructor(private route: ActivatedRoute, private _formBuilder: FormBuilder, private http: HttpClient, private payService: PayService,     private renderer: Renderer2,    private el: ElementRef,

  ){
    this.getCalendar();
    this.http.get(OPTION_DOCUMENT).subscribe(
      (response) => {
        this.dataDocument = response;
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.http.get(`${RESERVATION}/campus/1`).subscribe(
      (response) => {
        this.dataCategory= response;
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.route.data.subscribe();
    
  }
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.authenticate = data['authenticate'];
    });
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
    return (document !== '' && fullName !=='' && name !== '' && lastName !== '' && email !== '') ? null : { fieldsEmpty: true };
  }
  checkFieldsNotEmptySecondGroup(group: FormGroup){
    const category= group.get('categoryCtrl')?.value;
    const field= group.get('fieldCtrl')?.value;
    const typeReservation= group.get('typeReservationCtrl')?.value;
    const shift= group.get('categoryCtrl')?.value;
    const date= group.get('dateCtrl')?.value;
    const schedule= group.get('scheduleCtrl')?.value;
    return (category !== '' && field !=='' && typeReservation !== '' && shift !== '' && date !== '' && schedule !== '') ? null : { fieldsEmpty: true };

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
  validateSecondFormGroup(){
    const category= this.secondFormGroup?.get('categoryCtrl');
    const field= this.secondFormGroup?.get('fieldCtrl');
    const typeReservation= this.secondFormGroup?.get('typeReservationCtrl');
    const shift= this.secondFormGroup?.get('shiftCtrl');
    const date= this.secondFormGroup?.get('dateCtrl');
    const schedule= this.secondFormGroup?.get('scheduleCtrl');
    return {category, field, typeReservation,shift,date, schedule};
  }
  resetValidateSecondFormGroup(value:number){
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const shift= this.validateSecondFormGroup().shift;
    const date= this.validateSecondFormGroup().date;
    const schedule= this.validateSecondFormGroup().schedule;
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
            break;
      case 3:
            shift?.enable();
            shift?.reset();
            date?.disable();
            schedule?.reset();
            schedule?.disable();
            this.calendar.price='';
            break;
      case 4:
            date?.enable();
            date?.reset();
            schedule?.disable();
            schedule?.reset();
            this.calendar.price='';
            break;
      case 5:
            schedule?.enable();
            schedule?.reset();
            this.calendar.price='';
            break;
      default:
            field?.reset();
            typeReservation?.reset();
            shift?.reset();
            date?.reset();
            schedule?.reset();
            this.calendar.price='';
    }
  }
  convertText(value: any): string {
    const firstString = value.substring(0, 3);
    const hiddenString = '*'.repeat(value.length - 3);
    return firstString + hiddenString;
  }
  makeDocument(option_document:any, nro_document:any){
    const email = this.validateFirstFormGroup().email;
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const phone = this.validateFirstFormGroup().phone;
    let PIDE:string='';
    const document = {
      document: nro_document,
    };
    this.resetValidateFirstFormGroup();
    this.resetValidateSecondFormGroup(1);

    switch (option_document){
      case 1: PIDE=PIDE_DNI; break
        case 2: PIDE=PIDE_CE; break
        case 3: PIDE=PIDE_RUC; break
        default: PIDE=PIDE_DNI;
    }
    if(nro_document.length === this.sizeCharter){
      this.http.post<any>(DASHBOARD_DOCUMENT,document).subscribe(
        (response) => {
          if(response.code === 200){
            this.calendar.people_id=response.data.id;
            email?.setValue(response.data.email);
            phone?.setValue(response.data.phone);
            email?.disable();
            phone?.disable();
            if(option_document !=3){
              name?.setValue(this.convertText(response.data.name));
              lastName?.setValue(this.convertText(response.data.lastName));
            }else{
              fullName?.setValue(response.data.name);
            }
          }
          if(response.code !== 200){
            this.http.post<any>(PIDE,document).subscribe(
              (response) => {
                if(response.code !='ERROR' ){
                  if(option_document !=3){
                    name?.setValue(this.convertText(response.data.names));
                    lastName?.setValue(this.convertText(`${response.data?.fathers_last_name ?? ''} ${response.data?.mothers_last_name ?? ''}`.trim())
                  );
                  }else{
                    fullName?.setValue(response.data.name);
                  }
                }else{
                  if(option_document !=3){
                  name?.enable();
                  lastName?.enable();
                  }else{
                    fullName?.enable();
                  }
                }
              },
              (error) => {
                console.error('Error en la solicitud:', error);
              }
            );
          }
        },
        (error) => {
          console.error('Error en la solicitud:', error);
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
  setPerson(){
    if(this.calendar.people_id == 0 || this.calendar.people_id==null){
      this.person={
        typeDocument:this.validateFirstFormGroup().option_document?.value,
        document:this.validateFirstFormGroup().document?.value,
        name:this.validateFirstFormGroup().name?.value,
        lastName:this.validateFirstFormGroup().lastName?.value,
        email:this.validateFirstFormGroup().email?.value,
        phone:this.validateFirstFormGroup().phone?.value
      }
    }
  }
  //SECOND GROUP
  getSelectSecondFormGroup(route: string, data: any) {
    let list = this.http.get(`${RESERVATION}/${route}`);
    if (data) {
        const values = data.join('/');
        list = this.http.get(`${RESERVATION}/${route}/${values}`);
    }
    return list;
  }
  async getCategory(){
    const category= this.validateSecondFormGroup().category;
    const route='field';
    if(category?.value){
      const data=[category.value];
      this.dataField = await this.getSelectSecondFormGroup(route,data).toPromise();
      console.log(this.dataField);
      
    }
    this.resetValidateSecondFormGroup(1);
  }
  async getField(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const route='fieldReservation';
    if(category?.value && field?.value){
      const data=[category.value,field.value];
      this.dataTypeReservation= await this.getSelectSecondFormGroup(route,data).toPromise();
      console.log(this.dataTypeReservation);
      
    }
    this.resetValidateSecondFormGroup(2);
  }
  async getTypeReservation(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    const route='shift';
    if(category?.value && field?.value && typeReservation?.value){
      const data=false;
      this.dataShift= await this.getSelectSecondFormGroup(route,data).toPromise();
      this.dataShift=this.dataShift.shift;
    }
    this.resetValidateSecondFormGroup(3);
  }
  async getShift(){
    const category= this.validateSecondFormGroup().category;
    const field= this.validateSecondFormGroup().field;
    const typeReservation= this.validateSecondFormGroup().typeReservation;
    if(category?.value && field?.value && typeReservation?.value){
      const route='reservation';
      const data=[category.value,field.value,typeReservation.value];
      this.calendar.reservation_shift=await this.getSelectSecondFormGroup(route,data).toPromise();
      console.log();
      
      this.calendar.reservation_shift= this.calendar.reservation_shift[0].id;
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
      this.http.get<any>(`${RESERVATION}/schedules/${category.value}/${field.value}/${shift.value}/${dateFormat}`).subscribe((response) => {
        response.map(
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
      });
    }
    this.resetValidateSecondFormGroup(5);
  }
  async getSchedule(){
    const shift= this.validateSecondFormGroup().shift;
    const schedule= this.validateSecondFormGroup().schedule;
    if(shift?.value && schedule?.value && this.calendar.reservation_shift){
      const route='shift';
      const data=[this.calendar.reservation_shift,shift.value];
      const quantity= schedule.value.length;
      const total:any = await this.getSelectSecondFormGroup(route,data).toPromise();
        this.calendar.price=  (total[0].price * quantity).toString();
        console.log(schedule.value);
        console.log(this.dataSchedule);
    }
  }
  save(){
    const route='schedules';
    if(this.calendar.people_id == 0 || this.calendar.people_id==null){      
      const route='person';
      this.http.post<any>(`${RESERVATION}/${route}`, this.person).subscribe(
        (response) => {
          if (response && response.message === 'success') {
            this.calendar.people_id = response.data.id;
            console.log(this.calendar.people_id);
          }
        },
        (error) => {
          console.error('Error en la solicitud:', error);
        }
      );    
    }
    this.calendar={
      purchasenumber: 1,
      people_id: this.calendar.people_id,
      category: this.validateSecondFormGroup().category?.value,
      field: this.validateSecondFormGroup().field?.value,
      reservation_shift: this.calendar.reservation_shift,
      typeReservation: this.validateSecondFormGroup().typeReservation?.value,
      shift: this.validateSecondFormGroup().shift?.value,
      date: this.formatDate(this.validateSecondFormGroup().date?.value),
      schedule: this.validateSecondFormGroup().schedule?.value,
      price: this.calendar.price,
    }  
    console.log(this.calendar);
      
    this.http.post<any>(`${RESERVATION}/${route}`, this.calendar).subscribe(
      (response) => {
        if (response && response.message === 'success') {
          this.pay(this.calendar.people_id,response.data.voucher_id, this.calendar.date)
        }
      }
    );

  }
  pay(person_id:number, voucher:string, date: string){
    const module_id=3;
    this.payService.getMount(this.calendar.price);
    this.payService.getSessionToken().subscribe(
      (response)=>{
        console.log(response);
      },
      (error)=>{
        const sessionToken=error.error.text;
        this.payService.getToken(sessionToken).subscribe((data) => {          
          const responseToken = data.sessionKey;
          const script = this.renderer.createElement('script');
          script.type = 'text/javascript';
          script.text = this.payService.getVisa(
            responseToken,
            this.calendar.price,
            this.calendar.purchaseNumber,
            RESERVATION+'/voucher'+'/'+module_id+'/'+this.calendar.price+'/'+person_id+'/'+voucher+'/'+date
          );
          this.renderer.appendChild(this.el.nativeElement, script);
        })        
      }
    )
  }
  
}
