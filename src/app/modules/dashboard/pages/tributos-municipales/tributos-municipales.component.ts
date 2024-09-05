import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { NgFor, NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder,Validators, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatSelectModule} from '@angular/material/select';
import {MatStepperModule,MatStepper} from '@angular/material/stepper';
import { PayService } from 'src/app/pay.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { AuthTaxeService } from 'src/app/modules/auth/services/auth-taxe.service';
import { NumberOnlyDirective } from 'src/app/number-only.directive';


const RESERVATION2= environment.SERVER2;
@Component({
  selector: 'app-tributos-municipales',
  standalone: true,
  imports: [
    NgFor,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule, 
    NumberOnlyDirective
  ],
  templateUrl: './tributos-municipales.component.html',
  styleUrl: './tributos-municipales.component.scss'
})
export class TributosMunicipalesComponent {
  url:string=RESERVATION2; 
  stepp!:number;
  taxe:any={};
  benefit!:number;user!:number;codePred!:number;codeTrib!:number;$yearTrib!:number;
  login:boolean=true;
  isLinear = true;isEditable=true;
  dataTaxe:any=[];
  dataBenefit:any[]=[];
  dataBenefitDatail:any[]=[];
  dataAdress:any[]=[];
  dataYear:any[]=[];
  sizeCharter!:number;
  totalPrice:any;
  firstFormGroup = this._formBuilder.group({
    codeCtrl: ['', Validators.required],
    passwordCtrl: ['', Validators.required],
  },{ validators: this.checkFieldsNotEmptyFirstGroup });
  secondFormGroup = this._formBuilder.group({
    benefitCtrl: [null, Validators.required],
    detailCtrl: [{ value:null, disabled: true }, Validators.required],
    adressCtrl: [{ value:null, disabled: true }, Validators.required],
    yearCtrl: [{ value:null, disabled: true }, Validators.required],
  },{ validators: this.checkFieldsNotEmptySecondGroup });
  constructor(private route: ActivatedRoute, private router: Router, private _formBuilder: FormBuilder, private http: HttpClient, private payService: PayService, private renderer: Renderer2, private el: ElementRef,private toastr: ToastrService,private authTaxeService: AuthTaxeService){
    this.getBenefit();
  }
  @ViewChild('stepper') stepper!: MatStepper;
  checkFieldsNotEmptyFirstGroup(group: FormGroup) {
    const code = group.get('codeCtrl')?.value;
    const password = group.get('passwordCtrl')?.value;
    return (code !== null && password !== null);
  }
  checkFieldsNotEmptySecondGroup(group: FormGroup){
    const benefit= group.get('benefitCtrl')?.value;
    const detail= group.get('detailCtrl')?.value;
    return (benefit !== null && detail !==null);
  }
  inLogin(){
    this.login=true;
    const user=this.firstFormGroup?.get('codeCtrl')?.value;
    const password=this.firstFormGroup?.get('passwordCtrl')?.value;
    this.authTaxeService.login(user, password).subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.login=false;
        this.isEditable=false;
        this.isLinear=false;
        this.getInfoTaxe();
      }
    });
  }
  logout(){
    localStorage.removeItem('taxe');
    this.login=true;
    this.stepper.reset();
  }
  getBenefit(){
    this.http.get(`${RESERVATION2}/taxes/benefit`).subscribe(
      (response:any)=>{   
        response.data.map((value:any)=>{
          if(value.codtri==0 || value.codtri==1){
            this.dataBenefit.push({'codtri':value.codtri,'texto':value.texto})
          }
        }
      );  
        console.log(this.dataBenefit);
      },error=>{console.log(error);
      }
    )
  }
  getInfoTaxe(){
    const taxe=localStorage.getItem('taxe');
    if(taxe){
      this.taxe=JSON.parse(taxe);
    }
  }
  getDetail(){
    const user=this.firstFormGroup?.get('codeCtrl');
    const benefit = this.secondFormGroup.get('benefitCtrl');
    const detail= this.secondFormGroup.get('detailCtrl');
    const adress= this.secondFormGroup.get('adressCtrl');
    this.dataBenefitDatail=[];
    if(user && benefit){
      detail?.reset();
      detail?.enable();
      adress?.reset();
      adress?.disable();
      this.benefit=benefit.value;
      this.http.get(`${RESERVATION2}/taxes/benefit/detail/${user.value}/${benefit.value}`).subscribe(
        (response:any)=>{
        //   this.dataBenefitDatail=response.data.map((item:any)=>({
        //     id:item['1'],
        //     text:item.texto
        //   })
        // )
        if(response.code==200){
          this.dataBenefitDatail=response.data
        }
        },error=>{console.log(error);
        }
      )
    }
  }
  getAdress(){
    const user=this.firstFormGroup?.get('codeCtrl');
    const benefit = this.secondFormGroup.get('benefitCtrl');
    const detail= this.secondFormGroup.get('detailCtrl');
    const adress= this.secondFormGroup.get('adressCtrl');
    const year= this.secondFormGroup.get('yearCtrl');
    this.dataAdress=[];
    if(user && benefit && detail){
      adress?.reset();
      adress?.enable();  
      year?.reset();
      year?.disable();    
      this.user=user.value; 
      this.codeTrib=detail.value;
      if((this.benefit==0 && this.codeTrib!=1) || (this.benefit==1 && (this.codeTrib==2))){
        this.http.get(`${RESERVATION2}/taxes/benefit/adress/${user.value}/${detail.value}`).subscribe(
          (response:any)=>{
            console.log(response);
            if(response.code !==404){
              this.dataAdress=response.data
            }
          },error=>{console.log(error);
          }
        )
      }else{
        this.http.get(`${RESERVATION2}/taxes/benefit/prices/${user.value}/${benefit.value}/${detail.value}`).subscribe(
          (response:any)=>{
            console.log(response);
          }
        )
      }
    }
  }
  getYear(){
    //Cunando es anteriores deberia salir esta opcion
    const user=this.firstFormGroup?.get('codeCtrl');
    const detail= this.secondFormGroup.get('detailCtrl');
    const adress= this.secondFormGroup.get('adressCtrl');
    const year= this.secondFormGroup.get('yearCtrl');
    if(user && detail && adress){
      year?.reset();
      year?.enable();    
      if((this.benefit!=0 && this.codeTrib==2)){
        this.http.get(`${RESERVATION2}/taxes/benefit/years/${user.value}/${adress.value}/${detail.value}`).subscribe(
          (response:any)=>{
            this.dataYear=response.data;
          },error=>{
            console.log(error)
          }
        )
      }else{
        const yearNow= new Date().getFullYear();
        this.http.get(`${RESERVATION2}/taxes/benefit/prices/${user.value}/${adress.value}/${detail.value}/${yearNow}`).subscribe(
          (response:any)=>{
            console.log(response);
          }
        )
      }
    }
  }
  getTaxesPrice(){
    const user=this.firstFormGroup?.get('codeCtrl');
    const detail= this.secondFormGroup.get('detailCtrl');
    const adress= this.secondFormGroup.get('adressCtrl');
    const year= this.secondFormGroup.get('yearCtrl');
    if(user && detail && adress && year){
    this.http.get(`${RESERVATION2}/taxes/benefit/prices/${user.value}/${adress.value}/${detail.value}/${year.value}`).subscribe(
      (response:any)=>{
        console.log(response);
      }
    )
    }
  }
  save(){

  }
}
