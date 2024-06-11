import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl,FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { environment } from 'src/environments/environment';
import { NgFor, NgStyle } from '@angular/common';
import { NumberOnlyDirective } from 'src/app/number-only.directive';

const OPTION_DOCUMENT=environment.API_DOCUMENT;
const DASHBOARD_DOCUMENT=environment.API_DASHBOARD_DOCUMENT;
const PIDE_DNI=environment.API_DNI;
const PIDE_CE=environment.API_CARNET;
const PIDE_RUC=environment.API_RUC;
const OPTION_CATEGORY=environment.SERVER;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-campos-deportivos',
  standalone: true,
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
    NumberOnlyDirective
  ],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})
export class CamposDeportivosComponent implements OnInit {   
   authenticate:boolean | undefined;
   styleBlockDocument:string='block'; styleBlockRuc:string='none'; sizeCharter!:number;
   dataDocument:any; dataCategory:any;
   isLinear = true; person_id!:number;
   person:any={
    typeDocument:'',
    document:'',
    name:'',
    lastName:'',
   }
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
  },{ validators: this.checkFieldsNotEmpty });

  secondFormGroup = this._formBuilder.group({
    categoryCtrl: ['', Validators.required],
  });
  
  constructor(private route: ActivatedRoute, private _formBuilder: FormBuilder, private http: HttpClient,){
    this.http.get(OPTION_DOCUMENT).subscribe(
      (response) => {
        this.dataDocument = response;
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.http.get(`${OPTION_CATEGORY}/campus/1`).subscribe(
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
  checkFieldsNotEmpty(group: FormGroup) {
    const document = group.get('documentCtrl')?.value;
    const fullName = group.get('fullName')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastName')?.value;
    const email = group.get('emailCtrl')?.value;

    return (document !== '' && fullName !=='' && name !== '' && lastName !== '' && email !== '') ? null : { fieldsEmpty: true };
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

    return{name,lastName,email,phone};
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
    let PIDE:string='';
    const document = {
      document: nro_document,
    };
    this.resetValidateFirstFormGroup();

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
            this.person_id=response.data.id;
            email?.setValue(response.data.email);
            email?.disable();
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
                console.log(response);
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
    if(this.person_id == null){
      this.person.typeDocument=this.validateFirstFormGroup().option_document?.value;
      this.person.document=this.validateFirstFormGroup().document?.value;
      this.person.name=this.validateFirstFormGroup().name?.value;
      this.person.lastName=this.validateFirstFormGroup().lastName?.value;
      console.log(this.person);
    }
    
  }
  //SECOND GROUP
  getCategory(){}

}
