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
import { NgFor } from '@angular/common';

const OPTION_DOCUMENT=environment.API_DOCUMENT;
const PIDE_DNI=environment.API_DNI;
const DASHBOARD_DNI=environment.API_DASHBOARD_DNI;
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
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})
export class CamposDeportivosComponent implements OnInit {   
   authenticate:boolean | undefined;
   dataDocument:any;
   isLinear = false;
   matcher = new MyErrorStateMatcher();

  // Validador de formularios
   firstFormGroup = this._formBuilder.group({
    documentOptionCtrl:[ '', Validators.required],
    documentCtrl:[{ value:'', disabled: true }, Validators.required],
    nameCtrl: [{ value:'', disabled: true }, Validators.required],
    lastNameCtrl: [{ value:'', disabled: true }, Validators.required],
    emailCtrl: [{ value:'', disabled: true }, Validators.required, Validators.email],
    phoneCtrl: [{ value:'', disabled: true }],
  },{ validators: this.checkFieldsNotEmpty }); //REVISAR EL INPUT EMAIL

  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
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
    this.route.data.subscribe(data => {
      console.log(data);
    });
    
  }
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.authenticate = data['authenticate'];
    });
  }
  checkFieldsNotEmpty(group: FormGroup) {
    const document = group.get('documentCtrl')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastName')?.value;
    const email = group.get('emailCtrl')?.value;

    return (document !== '' && name !== '' && lastName !== '' && email !== '') ? null : { fieldsEmpty: true };
  }
  validateFirstFormGroup(){
    const option_document= this.firstFormGroup?.get('documentOptionCtrl');
    const document= this.firstFormGroup?.get('documentCtrl');
    const name= this.firstFormGroup?.get('nameCtrl');
    const lastName= this.firstFormGroup?.get('lastNameCtrl');
    const email= this.firstFormGroup?.get('emailCtrl');
    const phone= this.firstFormGroup?.get('phoneCtrl');
    return {
      option_document,document,name,lastName,email,phone
    };
  }
  resetValidateFirstFormGroup(){
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const email=this.validateFirstFormGroup().email;
    const phone=this.validateFirstFormGroup().phone;
    name?.disable();
    lastName?.disable();
    name?.reset();
    lastName?.reset();
    email?.disable();
    phone?.disable();
    email?.reset();
    phone?.reset();

    return{name,lastName,email,phone};
  }
  makeDocument(option_document:any, nro_document:any){
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const document = {
      document: nro_document,
    };
    this.resetValidateFirstFormGroup();
    if(option_document=== 1 && nro_document.length === 8){
      console.log("DNI");
      this.http.post<any>(DASHBOARD_DNI,document).subscribe(
        (response) => {
          if(response.code === 200){
            name?.setValue(response.data.name);
            lastName?.setValue(response.data.lastName);
          }
          if(response.code !== 200){
            this.http.post<any>(PIDE_DNI,document).subscribe(
              (response) => {
                if(response.code !=='ERROR' ){
                  name?.setValue(response.data.names);
                  lastName?.setValue(
                    `${response.data?.fathers_last_name ?? ''} ${response.data?.mothers_last_name ?? ''}`.trim()
                  );
                }else{
                  name?.enable();
                  lastName?.enable();
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
    if(option_document=== 2 && nro_document.length === 9){
      console.log("CE");
    }
    if(option_document=== 3 && nro_document.length === 11){
      console.log("RUC");
    }
  }
  getDocumentOption(){
    const {option_document, document}=this.validateFirstFormGroup();
    if(option_document){
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
  getEmailPhone(){
    const email:any=this.validateFirstFormGroup().email;
    const phone:any=this.validateFirstFormGroup().phone;
    if(email.value !=='' && phone.value !==''){
      console.log("DATA CON VALUE");
      
    }
  }

}
