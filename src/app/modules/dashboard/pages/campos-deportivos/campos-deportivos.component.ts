import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
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
  // Validador de formularios
   firstFormGroup = this._formBuilder.group({
    documentOptionCtrl:[ '', Validators.required],
    documentCtrl:[{ value:'', disabled: true }, Validators.required],
    nameCtrl: [{ value:'', disabled: true }, Validators.required],
    lastNameCtrl: [{ value:'', disabled: true }, Validators.required],
    emailCtrl: [{ value:'', disabled: true }, Validators.required],
    phoneCtrl: [{ value:'', disabled: true }, Validators.required],
  });
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
  validateFirstFormGroup(){
    const option_document= this.firstFormGroup?.get('documentOptionCtrl');
    const document= this.firstFormGroup?.get('documentCtrl');
    const name= this.firstFormGroup?.get('nameCtrl');
    const lastName= this.firstFormGroup?.get('lastNameCtrl');
    return {
      option_document,document,name,lastName
    };
  }
  resetValidateFirstFormGroup(){
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    name?.disable();
    lastName?.disable();
    name?.reset();
    lastName?.reset();
    return{name,lastName};
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
            this.http.get<any>(PIDE_DNI).subscribe(
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
  documentOption(){
    const {option_document, document}=this.validateFirstFormGroup();
    if(option_document){
      document?.enable();
      document?.reset();
      this.resetValidateFirstFormGroup();
    }
  }
  document(){
    const option_document:any=this.validateFirstFormGroup().option_document;
    const document:any=this.validateFirstFormGroup().document;
    if(document){
      this.makeDocument(option_document.value,document.value)
    }
  }
}
