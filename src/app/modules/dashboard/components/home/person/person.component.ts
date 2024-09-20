import { Component,Renderer2,ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl,FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { environment } from 'src/environments/environment';
import { NgFor, NgStyle } from '@angular/common';
import { NumberOnlyDirective } from 'src/app/number-only.directive';

const SERVER=environment.SERVER;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-person',
  standalone: true,
  imports: [
    MatButtonModule,
    NgFor,
    NgStyle,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    NumberOnlyDirective,
  ],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss'
})
export class PersonComponent implements OnInit{
  url:string=SERVER; 
   authenticate!:boolean;
   styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;
   dataDocument:any;
   isLinear:boolean = false;isEditable:boolean=false;
   person:any={
    id:'',
    typeDocument:'',
    document:'',
    name:'',
    lastName:'',
    email:'',
    phone:''
   };
   typeReservationShift:any;
   matcher = new MyErrorStateMatcher();
  // Validador de formularios
   firstFormGroup = this._formBuilder.group({
    documentOptionCtrl:[ null, Validators.required],
    documentCtrl:[{ value:null, disabled: true }, [Validators.required , Validators.minLength(this.sizeCharter), Validators.maxLength(this.sizeCharter)]],
    nameCtrl: [{ value:null, disabled: true }, Validators.required],
    lastNameCtrl: [{ value:null, disabled: true }, Validators.required],
    fullNameCtrl: [{ value:null, disabled: true }, Validators.required],
    emailCtrl: [{ value:null, disabled: true }, [Validators.required, Validators.email]],
    phoneCtrl: [{ value:null, disabled: true }],
  },{ validators: this.checkFieldsNotEmptyFirstGroup });
  constructor(private route: ActivatedRoute, private _formBuilder: FormBuilder, private http: HttpClient){
    this.route.data.subscribe(data => {
      this.authenticate = data['authenticate'];
    });
    this.http.get(`${SERVER}/documents`).subscribe(
      (response:any) => {
        this.dataDocument = response.data;
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  ngOnInit(): void {}
  checkFieldsNotEmptyFirstGroup(group: FormGroup) {
    const document = group.get('documentCtrl')?.value;
    const fullName = group.get('fullName')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastName')?.value;
    const email = group.get('emailCtrl')?.value;
    return (document !== null && fullName !==null && name !== null && lastName !== null && email !== null) ? null : { fieldsEmpty: true };
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
    this.person.id=0;
    return{name,lastName,email,phone};
  }
  savePerson(route: string, data: any) {
    const  list = this.http.post<any>(`${SERVER}/${route}`, data);
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
      this.http.get<any>(`${SERVER}/search/person/${nro_document}/${option_document}`).subscribe(
        (response: any) => {
          if (response.code === 200) {
            const data = response.data[0] ? response.data[0] : response.data;
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
    if(this.person.id == 0 || this.person.id==null){
      this.person={
        typeDocument:this.validateFirstFormGroup().option_document?.value,
        document:this.validateFirstFormGroup().document?.value,
        name:this.person.name?this.person.name:this.validateFirstFormGroup().name?.value,
        lastName:this.person.lastName?this.person.lastName:this.validateFirstFormGroup().lastName?.value,
        email:this.validateFirstFormGroup().email?.value,
        phone:this.validateFirstFormGroup().phone?.value
      }
      const route='person';
      const data=this.person;
      const person:any=await this.savePerson(route,data).toPromise();
      this.person.id=person.data[0].inserted_id;      
    }
  }
}
