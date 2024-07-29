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
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import { environment } from 'src/environments/environment';
import { NgFor, NgStyle } from '@angular/common';
import { NumberOnlyDirective } from 'src/app/number-only.directive';
import { PayService } from 'src/app/pay.service';
import { PersonComponent } from '../../components/home/person/person.component';

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
  name: string;
}
@Component({
  selector: 'app-talleres-utiles',
  standalone: true,
  imports: [MatButtonModule,
    MatStepperModule,
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
  
  isLinear = true;isEditable=true;
  authenticate!:boolean;stepp!:number;
  dataDocument:any; dataWorkshorp:Workshop[] = [];
  styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;sizeCharterStudent!:number;
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
  });
  filteredOptions: Observable<Workshop[]> | undefined;
  constructor(private route: ActivatedRoute, private router: Router, private _formBuilder: FormBuilder, private http: HttpClient, private payService: PayService, private renderer: Renderer2, private el: ElementRef) {
    this.route.data.subscribe(data => {
      this.authenticate = data['authenticate'];
    });
    this.http.get(OPTION_DOCUMENT).subscribe(
      (response:any) => {
        this.dataDocument = response.data;
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.http.get(WORKSHORP).subscribe(
      (response:any) => {
        this.dataWorkshorp = response.data;
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
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.dataWorkshorp.slice();
      }),
    );
  }
  @ViewChild(PersonComponent) personComponent!: PersonComponent;
  displayFn(workshop: Workshop): string {
    return workshop && workshop.name ? workshop.name : '';
  }

  private _filter(name: string): Workshop[] {
    const filterValue = name.toLowerCase();

    return this.dataWorkshorp.filter(option => option.name.toLowerCase().includes(filterValue));
  }
  //FIRST GROUP
  checkFieldsNotEmptyFirstGroup(group: FormGroup) {
    const document = group.get('documentCtrl')?.value;
    const fullName = group.get('fullName')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastName')?.value;
    const email = group.get('emailCtrl')?.value;
    const studentDocument = group.get('studentDocumentCtrl')?.value;
    return (document !== null && fullName !==null && name !== null && lastName !== null && email !== null && studentDocument !==null) ? null : { fieldsEmpty: true };
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
  savePerson(route: string, data: any) {
    const  list = this.http.post<any>(`${RESERVATION2}/${route}`, this.person);
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
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const phone = this.validateFirstFormGroup().phone;
    this.resetValidateFirstFormGroup();
      if(nro_document.length === this.sizeCharter){
        this.http.get<any>(`${DASHBOARD_DOCUMENT}/${nro_document}/${option_document}`).subscribe(
          (response: any) => {
            if (response.code === 200) {
              const data = response.data[0] ? response.data[0] : response.data;
              console.log(data);
              if (option_document != 3) {
                if(data.id){
                  this.person.id = data.id;
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
                email?.setValue(data.email);
                email?.disable();
                const dataPhone = data.phone ?? null;
                phone?.setValue(dataPhone);
                phone?.disable();
              }
              this.person.name=data.name;
              this.person.lastName=data.lastName;
            }
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
  makeDocumenStudent(option_document:any, nro_document:any){
    const studentName = this.validateFirstFormGroup().studentName;
    const studentLastName = this.validateFirstFormGroup().studentLastName;
    this.resetValidateFirstFormGroupStudent();
      console.log("ESTUDIANTE");
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
              if (option_document != 3) {
                studentName?.enable();
                studentLastName?.enable();
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
    if(this.person.id == 0 || this.person.id==null){
      if(option_document !==3){
        this.person={
          typeDocument:option_document,
          document:this.validateFirstFormGroup().document?.value,
          name:this.person.name?this.person.name:this.validateFirstFormGroup().name?.value,
          lastName:this.person.lastName?this.person.lastName:this.validateFirstFormGroup().lastName?.value,
          email:this.validateFirstFormGroup().email?.value,
          phone:this.validateFirstFormGroup().phone?.value
        }
      }else{
        this.person={
          typeDocument:option_document,
          document:this.validateFirstFormGroup().document?.value,
          name:this.person.name?this.person.name:this.validateFirstFormGroup().fullName?.value,
          lastName:'',
          email:this.validateFirstFormGroup().email?.value,
          phone:this.validateFirstFormGroup().phone?.value
        }
      }
      const route='person';
      const data=this.person;
      console.log(data);
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
      console.log(data);
      const student:any=await this.savePerson(route,data).toPromise();
      this.student.id=student.data[0].inserted_id;
    }
  }
  setInformation(){
    this.setPerson();
    this.setStudent();
  }
  //SECOND GROUP
  getWorkshop(){
    const workshop=this.secondFormGroup.get('workshopCtrl')?.value;
    if(workshop){
      
    }
  }
}
