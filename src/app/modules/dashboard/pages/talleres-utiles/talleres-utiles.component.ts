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
import {interval, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import { environment } from 'src/environments/environment';
import { NgClass, NgFor, NgStyle } from '@angular/common';
import { NumberOnlyDirective } from 'src/app/number-only.directive';
import { PayService } from 'src/app/pay.service';
import { PersonComponent } from '../../components/home/person/person.component';
import { ToastrService } from 'ngx-toastr';

const RESERVATION2= environment.SERVER2;
const OPTION_DOCUMENT=environment.API_DOCUMENT;
const DASHBOARD_DOCUMENT=environment.API_DASHBOARD_DOCUMENT;
const WORKSHORP=environment.API_WORKSHORP;
const DASHBOARD_DOCUMENT_STUDENT=environment.API_DASHBOARD_DOCUMENT_STUDENT;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
export interface Workshop {
  DESCRIPCION: string;
}
@Component({
  selector: 'app-talleres-utiles',
  standalone: true,
  imports: [MatButtonModule,
    MatStepperModule,
    NgClass,
    NgFor,
    NgStyle,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    NumberOnlyDirective,
    MatTooltipModule,
    PersonComponent,
    AsyncPipe,
  ],
  templateUrl: './talleres-utiles.component.html',
  styleUrl: './talleres-utiles.component.scss'
})
export class TalleresUtilesComponent implements OnInit{
  url:string=RESERVATION2; 
  positionOption: TooltipPosition='above';
  isLinear = true;isEditable=true;isButtonDisabled = false;
  authenticate!:boolean;stepp!:number;voucher!:number;
  payment!:number;
  niubiz!:number;
  tempBlocked:boolean=false;
  msgBlocked!:string;
  vacationDay!:number; vacationHour!:number; workshop!:number;
  dataDocument:any=[]; dataWorkshop:Workshop[] = [];dataWorkshopAge:any=[]; dataWorkshopDate:any=[]; dataWorkshopHour:any=[];
  styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;sizeCharterStudent!:number;
  dataTypePayments:any=[]; dataOptionPayments:any=[];
  totalPrice:any; season:string='';shift:any;campus:any;
  dataVoucher:any=[];
  arrow = 'assets/icons/heroicons/solid/arrow.svg';
  person:any={
    id:'',
    typeDocument:'',
    document:'',
    name:'',
    lastName:'',
    email:'',
    phone:''
   };
   student:any={
    id:'',
    typeDocument:'',
    document:'',
    name:'',
    lastName:'',
   };
   reservation:any={
    purchaseNumber:'',
    sessionToken:'',
    people_id:'',
    client_id:'',
    temp:'',
    season:'',
    workshop:'',
    workshopHour:'',
    date:'',
    workshopShift:'',
    price:'',
   }
  matcher = new MyErrorStateMatcher();
  firstFormGroup = this._formBuilder.group({
    documentOptionCtrl:[ '', Validators.required],
    documentCtrl:[{ value:'', disabled: true }, [Validators.required , Validators.minLength(this.sizeCharter), Validators.maxLength(this.sizeCharter)]],
    nameCtrl: [{ value:'', disabled: true }, Validators.required],
    lastNameCtrl: [{ value:'', disabled: true }, Validators.required],
    fullNameCtrl: [{ value:'', disabled: true }, Validators.required],
    emailCtrl: [{ value:'', disabled: true }, [Validators.required, Validators.email]],
    phoneCtrl: [{ value:'', disabled: true }],
    studentDocumentOptionCtrl:[ '', Validators.required],
    studentDocumentCtrl:[{ value:'', disabled: true }, [Validators.required , Validators.minLength(this.sizeCharterStudent), Validators.maxLength(this.sizeCharterStudent)]],
    studentNameCtrl: [{ value:'', disabled: true }, Validators.required],
    studentLastNameCtrl: [{ value:'', disabled: true }, Validators.required],
    },{ validators: this.checkFieldsNotEmptyFirstGroup });
  secondFormGroup = this._formBuilder.group({
    workshopCtrl: ['', Validators.required],
    workshopAgeCtrl: [{ value:null, disabled: true }, Validators.required],
    workshopDateCtrl: [{ value:null, disabled: true }, Validators.required],
    workshopHourCtrl: [{ value:null, disabled: true }, Validators.required],
    typePaymentCtrl: [null, localStorage.getItem('token')?Validators.required:null],
    optionPaymentCtrl: null,
    observationPaymentCtrl: null,
  },{ validators: this.checkFieldsNotEmptySecondGroup });
  filteredOptions: Observable<Workshop[]> | undefined;
  constructor(private route: ActivatedRoute, private router: Router, private _formBuilder: FormBuilder, private http: HttpClient, private payService: PayService, private renderer: Renderer2, private el: ElementRef, private toastr: ToastrService) {
    this.route.data.subscribe(data => {
      this.authenticate = data['authenticate'];
    });
    this.http.get(OPTION_DOCUMENT).subscribe(
      (response:any) => {
        response.data.map((value:any)=>{
          if(value.type_doc !== 'RUC'){
            this.dataDocument.push(value);
          }
        })
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.http.get(WORKSHORP).subscribe(
      (response:any) => {  
      response.data.map(
          (value:any)=>{
            //BLOQUEO POR TIEMPO DE MATRICULA
            if(value.tbl=="Mensaje"){
              if(value.DESCRIPCION!=''){
                this.msgBlocked=value.DESCRIPCION
                this.tempBlocked=true;
                this.firstFormGroup.get('documentOptionCtrl')?.setValue('')
                this.firstFormGroup.get('documentOptionCtrl')?.disable()
                this.firstFormGroup.get('studentDocumentOptionCtrl')?.setValue('')
                this.firstFormGroup.get('studentDocumentOptionCtrl')?.disable()
              }
            }
            if(value.tbl == "taller"){
              this.dataWorkshop.push(value)
            }
          }
        )
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  ngOnInit() {
    this.filteredOptions = this.secondFormGroup.get('workshopCtrl')?.valueChanges.pipe(
      startWith(''),
      map((value:any) => {
        const descripcion = typeof value === 'string' ? value : value?.descripcion;
        return descripcion ? this._filter(descripcion as string) : this.dataWorkshop.slice();
      }),
    );
    this.route.url.subscribe(url=>{
      const data:any=[];
      url.map((value:any)=>{data.push(value.path)})
      const route:string=(this.authenticate)?'admin':'';
      this.stepp=data[2];
      this.voucher=data[3];
      this.payment=data[4];
      if(this.stepp !=2){
        this.router.navigate([`${route}/talleres-utiles`]);  
      }else{
        this.isEditable=false;
        this.getVoucher(this.voucher, this.payment);
      }
    })
  }
  @ViewChild(PersonComponent) personComponent!: PersonComponent;
  @ViewChild('stepper') stepper!: MatStepper;
  public atm:any={};
  displayFn(workshop: Workshop): string {
    return workshop && workshop.DESCRIPCION ? workshop.DESCRIPCION : '';
  }

  private _filter(DESCRIPCION: string): Workshop[] {
    const filterValue = DESCRIPCION.toLowerCase();

    return this.dataWorkshop.filter(option => option.DESCRIPCION.toLowerCase().includes(filterValue));
  }
  //FIRST GROUP
  checkFieldsNotEmptyFirstGroup(group: FormGroup) {
    const documentOption = group.get('documentOptionCtrl')?.value;
    const document = group.get('documentCtrl')?.value;
    const fullName = group.get('fullName')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastName')?.value;
    const email = group.get('emailCtrl')?.value;
    const studentDocumentOption = group.get('studentDocumentOptionCtrl')?.value;
    const studentDocument = group.get('studentDocumentCtrl')?.value;
    return (documentOption !== null && document !== null && fullName !==null && name !== null && lastName !== null && email !== null && studentDocumentOption !==null && studentDocument !==null) ? null : { fieldsEmpty: true };
  }
  checkFieldsNotEmptySecondGroup(group: FormGroup){
    const workshop= group.get('workshopCtrl')?.value;
    const workshopAge= group.get('workshopAgeCtrl')?.value;
    const workshopDate= group.get('workshopDateCtrl')?.value;
    const workshopHour= group.get('workshopHourCtrl')?.value;
    const typePayment= group.get('typePaymentCtrl')?.value;
    if(localStorage.getItem('token')){
      return (workshop !== null && workshopAge !== null && workshopDate !== null && workshopHour !== null &&  typePayment !== null ) ? null : { fieldsEmpty: true };
    }else{
      return (workshop !== null && workshopAge !== null && workshopDate !== null && workshopHour !== null ) ? null : { fieldsEmpty: true };
    }
  }
  validateFirstFormGroup(){
    const option_document= this.firstFormGroup?.get('documentOptionCtrl');
    const document= this.firstFormGroup?.get('documentCtrl');
    const name= this.firstFormGroup?.get('nameCtrl');
    const lastName= this.firstFormGroup?.get('lastNameCtrl');
    const fullName= this.firstFormGroup?.get('fullNameCtrl');
    const email= this.firstFormGroup?.get('emailCtrl');
    const phone= this.firstFormGroup?.get('phoneCtrl');
    const option_student_document= this.firstFormGroup?.get('studentDocumentOptionCtrl');
    const student_document= this.firstFormGroup?.get('studentDocumentCtrl');
    const studentName= this.firstFormGroup?.get('studentNameCtrl');
    const studentLastName= this.firstFormGroup?.get('studentLastNameCtrl');
    return {
      option_document,document,fullName,name,lastName,email,phone,option_student_document,student_document,studentName,studentLastName
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
    this.person.id=0;
    return{name,lastName,email,phone};
  }
  resetValidateFirstFormGroupStudent(){
    const studentName = this.validateFirstFormGroup().studentName;
    const studentLastName = this.validateFirstFormGroup().studentLastName;
    studentName?.disable();
    studentLastName?.disable();
    studentName?.reset();
    studentLastName?.reset();
    this.student.id=0;
    return{studentName,studentLastName};
  }
  validateSecondFormGroup(){
    const workshop= this.secondFormGroup?.get('workshopCtrl');
    const workshopAge= this.secondFormGroup?.get('workshopAgeCtrl');
    const workshopDate= this.secondFormGroup?.get('workshopDateCtrl');
    const workshopHour= this.secondFormGroup?.get('workshopHourCtrl');
    const typePayment= this.secondFormGroup?.get('typePaymentCtrl');
    const optionPayment= this.secondFormGroup?.get('optionPaymentCtrl');
    const observationPayment= this.secondFormGroup?.get('observationPaymentCtrl');
    return {
      workshop,workshopAge,workshopDate,workshopHour,typePayment, optionPayment, observationPayment
    };
  }
  resetValidateSecondFormGroup(){
    const workshopAge = this.validateSecondFormGroup().workshopAge;
    const workshopDate = this.validateSecondFormGroup().workshopDate;
    const workshopHour = this.validateSecondFormGroup().workshopHour;
    workshopHour?.disable();
    workshopAge?.disable();
    workshopDate?.disable();
    workshopHour?.reset();
    workshopDate?.reset();
    this.totalPrice='';
    this.person.name='';
    this.person.lastName='';
    return{workshopAge,workshopDate,workshopHour};
  }

  savePerson(route: string, data: any) {
    const  list = this.http.post<any>(`${RESERVATION2}/${route}`, data);
    return list;
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
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const phone = this.validateFirstFormGroup().phone;
    this.resetValidateFirstFormGroup();
    
      if(nro_document.length === this.sizeCharter){
        this.http.get<any>(`${DASHBOARD_DOCUMENT}/${nro_document}/${option_document}`).subscribe(
          (response: any) => {
            if (response.code === 200) {
              const data = response.data[0] ? response.data[0] : response.data;
                if(data.id){
                  this.person.id = data.id;
                  email?.setValue(data.email);
                  email?.disable();
                  const dataPhone = data.phone ?? null;
                  phone?.setValue(dataPhone);
                  phone?.disable();
                }
                const setNameAndLastName = (nameValue: string, lastNameValue: string) => {
                  this.person.name=nameValue;
                  this.person.lastName=lastNameValue;
                  name?.setValue(this.authenticate ?nameValue: this.convertText(nameValue, 1), 1);
                  lastName?.setValue(this.authenticate ?lastNameValue: this.convertText(lastNameValue, 1) , 1);
                };
                setNameAndLastName(data.name, data.lastName);
            }
          },
          (error) => {
            console.error('Error en la solicitud:', error);
            if (error.error.code === 404) {
                name?.enable();
                lastName?.enable();
            }
          }
        );
      }
    
  }
  makeDocumenStudent(option_document:any, nro_document:any){
    const studentName = this.validateFirstFormGroup().studentName;
    const studentLastName = this.validateFirstFormGroup().studentLastName;
    this.resetValidateFirstFormGroupStudent();
      if(nro_document.length === this.sizeCharterStudent){
        this.http.get<any>(`${DASHBOARD_DOCUMENT_STUDENT}/${nro_document}/${option_document}`).subscribe(
          (response: any) => {
            if (response.code === 200) {
              const data = response.data[0] ? response.data[0] : response.data;
                if(data.id){
                  this.student.id = data.id;
                }
                const setNameAndLastName = (nameValue: string, lastNameValue: string) => {
                  studentName?.setValue(this.authenticate ?nameValue: this.convertText(nameValue, 1), 1);
                  studentLastName?.setValue(this.authenticate ?lastNameValue: this.convertText(lastNameValue, 1) , 1);
                };
                setNameAndLastName(data.name, data.lastName);
            }
          },
          (error) => {
            console.error('Error en la solicitud:', error);
            if (error.error.code === 404) {
                studentName?.enable();
                studentLastName?.enable();
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
  getStudentDocumentOption(){
    const {option_student_document, student_document}=this.validateFirstFormGroup();
    if(option_student_document){
      switch (option_student_document.value){
        case 1: this.sizeCharterStudent=8;break
        case 2: this.sizeCharterStudent=9;break
        default: this.sizeCharterStudent=8;
      }
      student_document?.enable();
      student_document?.reset();
      this.resetValidateFirstFormGroupStudent();
    }
  }
  getStudentDocument(){
    const option_student_document:any=this.validateFirstFormGroup().option_student_document;
    const student_document:any=this.validateFirstFormGroup().student_document;
    if(student_document){
      this.makeDocumenStudent(option_student_document.value,student_document.value);
    }
  }
  async setPerson(){
    const option_document=this.validateFirstFormGroup().option_document?.value;
    if(this.person.name===''){
      this.person.name=this.validateFirstFormGroup().name?.value
    }
    if(this.person.lastName===''){
      this.person.lastName=this.validateFirstFormGroup().lastName?.value
    }
    
    if(this.person.id == 0 || this.person.id==null){
        this.person={
          typeDocument:option_document,
          document:this.validateFirstFormGroup().document?.value,
          name:this.person.name,
          lastName:this.person.lastName,
          email:this.validateFirstFormGroup().email?.value,
          phone:this.validateFirstFormGroup().phone?.value
        }
      const route='person';
      const data=this.person;
      const person:any=await this.savePerson(route,data).toPromise();
      this.person.id=person.data[0].inserted_id;
      
    }
  }
  async setStudent(){
    if(this.student.id == 0 || this.student.id==null){
      this.student={
        typeDocument:this.validateFirstFormGroup().option_student_document?.value,
        document:this.validateFirstFormGroup().student_document?.value,
        name:this.validateFirstFormGroup().studentName?.value,
        lastName:this.validateFirstFormGroup().studentLastName?.value,
      }
      const route='student';
      const data=this.student;
      const student:any=await this.savePerson(route,data).toPromise();
      this.student.id=student.data[0].inserted_id;
    }
  }
  setInformation(){
    this.setPerson();
    this.setStudent();
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
  async getWorkshop(){
    const workshop:any=this.validateSecondFormGroup().workshop?.value;
    const workshopAge:any=this.validateSecondFormGroup().workshopAge;
    this.resetValidateSecondFormGroup();
    this.season='';
    this.dataWorkshopAge=[];
    if(workshop.ID){
      this.workshop=workshop.ID;
      workshopAge?.enable();
      this.isButtonDisabled = true;
      const data=[workshop.ID];
      const route='workshops/ages';
      const dataWorkshopAge:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      dataWorkshopAge.data.map(
        (value:any)=>{
          if(value.tbl == "edad"){
            this.dataWorkshopAge.push(value)
          }
        }
      )
    }
  }
  async getWorkshopAge(){
    const workshop:any=this.validateSecondFormGroup().workshop?.value;
    const workshopAge:any=this.validateSecondFormGroup().workshopAge?.value;
    const workshopDate:any=this.validateSecondFormGroup().workshopDate;
    workshopDate?.reset();
    this.dataWorkshopDate=[];
    if(workshop && workshopAge){
      const data=[workshop.ID, workshopAge];
      workshopDate?.enable();
      const route='workshops/dates';
      const dataWorkshopDate:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      dataWorkshopDate.data.map(
        (value:any)=>{
          if(value.tbl == "Dia"){
            this.dataWorkshopDate.push(value)
          }
        }
      )
    }
  }
  async getWorkshopDate(){
    const workshop:any=this.validateSecondFormGroup().workshop?.value;
    const workshopAge:any=this.validateSecondFormGroup().workshopAge?.value;
    const workshopDate:any=this.validateSecondFormGroup().workshopDate?.value;
    const workshopHour:any=this.validateSecondFormGroup().workshopHour;
    workshopHour?.reset();
    this.dataWorkshopHour=[];
    if(workshop && workshopAge && workshopDate){
      workshopHour?.enable();
      const data=[workshop.ID,workshopAge,workshopDate];
      const route='workshops/hours';
      const dataWorkshopHour:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      dataWorkshopHour.data.map(
        (value:any)=>{
          if(value.tbl == "Hora"){
            this.dataWorkshopHour.push(value)
          }
        }
      )
    }
  }
  async getWorkshopHour(){
    const workshop:any=this.validateSecondFormGroup().workshop?.value;
    const workshopAge:any=this.validateSecondFormGroup().workshopAge?.value;
    const workshopDate:any=this.validateSecondFormGroup().workshopDate?.value;
    const workshopHour:any=this.validateSecondFormGroup().workshopHour?.value;
    if(workshop && workshopAge && workshopDate &&workshopHour){
      const data=[workshop.ID,workshopAge,workshopDate,workshopHour];
      const route='workshops/shifts';
      const dataWorkshopShift:any = await this.getSelectSecondFormGroup(route,data).toPromise();
      const vacationHour:any=[];
      dataWorkshopShift.data.map(
        (value:any)=>{
          if(value.tbl=="tasa"){
            this.totalPrice=value.DESCRIPCION;
          }
          if(value.tbl=="Temporada"){
            this.season=value.ID;
          }
          if(value.tbl=="Sede"){
            this.campus=value.ID;
          }
          if(value.tbl=='Turno'){
            this.shift=value.ID
          }
          if(value.tbl=='Sede'){
            this.campus=value.ID
          }
        }
      )
      // this.vacationHour =vacationHour[0].vacation_hour_id;
    }
  }
  async getTypePayments(){
    const typePayment= this.validateSecondFormGroup().typePayment;
    if(typePayment){
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
    this.isButtonDisabled = true;
    const atm:any=localStorage.getItem('profileData');
    this.atm=JSON.parse(atm);
    this.setPerson();
    this.setStudent()
    if(this.totalPrice==='0.00'){
        this.reservation={
          codeReservation: `${this.person.id}-${this.student.id}-${this.season}-${this.campus}-${this.workshop}-${this.validateSecondFormGroup().workshopAge?.value}-${this.validateSecondFormGroup().workshopHour?.value}-${this.shift}`,
          date: this.validateSecondFormGroup().workshopDate?.value,
          total: this.totalPrice,
        } 
          const route='workshops/satmun/free';
          this.http.post<any>(`${RESERVATION2}/${route}`, this.reservation).subscribe(
            (response) => {                
              this.router.navigateByUrl(`/talleres-utiles/recibo/2/${response.data.voucher}/${response.data.payment}`);
            },error=>{
              this.showError('El alumno ya esta registrado en este taller');
            }
          )
    }else{
      this.payService.getMount(this.totalPrice);
      this.http.get(`${RESERVATION2}/niubiz/purchaseNumber`).subscribe(
        (response:any)=>{        
           this.niubiz=response.data[0].purchaseNumber
        }
      )
      this.payService.getSessionToken().subscribe(
        (response)=>{
        },
        (error)=>{
          const sessionToken=error.error.text;
          this.reservation={
            purchaseNumber: this.niubiz,
            sessionToken: sessionToken,
            people_id: this.person.id,
            client_id: this.student.id,
            campus:this.campus,
            season: this.season,
            workshop: this.workshop,
            age:this.validateSecondFormGroup().workshopAge?.value,
            workshopHour:this.validateSecondFormGroup().workshopHour?.value,
            date: this.validateSecondFormGroup().workshopDate?.value,
            workshopShift: this.shift,
            total: this.totalPrice,
          } 
          const route='workshops/niubiz';
          this.http.post<any>(`${RESERVATION2}/${route}`, this.reservation).subscribe(
            (response) => {
              if (response && response.code === 200) {   
                const reservationId=response.data.reservation_id;
                const voucherId=response.data.voucher_id;
                const paymentId=response.data.payment_id;
                const total=parseInt(response.data.total);
                this.pay(reservationId,voucherId,paymentId,total,sessionToken);
              }
            },(error)=>{
              this.showError(error.error.message);
            }
          );
        }
      )
      }
  }
  pay(reservation_id:number, voucher_id:number,payment_id:number,total:any,sessionToken:string){
    const module_id=4;  
    this.payService.getToken(sessionToken).subscribe((data) => {
      const responseToken = data.sessionKey;
      const script = this.renderer.createElement('script');
      const url=`${RESERVATION2}/voucher/${module_id}/${reservation_id}/${voucher_id}/${payment_id}/${total}`;
      script.type = 'text/javascript';
      script.text = this.payService.getVisa(
        responseToken,
        total,
        this.reservation.purchaseNumber,
        url
      );
      this.renderer.appendChild(this.el.nativeElement, script);
    })
  }
  //THIRD GROUP
  getVoucher(voucherId:number,paymentId:number){
    const module=4;
    this.http.get(`${RESERVATION2}/payment/voucher/${module}/${voucherId}/${paymentId}`).subscribe(
      (response:any)=>{
        this.dataVoucher=response.data;
      },error=>{console.error(error)}
    )
  }
  print(voucherId:number,paymentId:number) {
    const url = `${RESERVATION2}/workshops/voucher/${voucherId}/${paymentId}/2`; 
    window.open(url, '_blank');
  }
  showError(message:string) {
    this.toastr.error(message,'ERROR!',{closeButton:true, positionClass:'toast-top-right'});
  }
}

