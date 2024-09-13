import {SelectionModel} from '@angular/cdk/collections';
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
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';


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
    NumberOnlyDirective,
    MatTableModule, 
    MatCheckboxModule
  ],
  templateUrl: './tributos-municipales.component.html',
  styleUrl: './tributos-municipales.component.scss'
})
export class TributosMunicipalesComponent {
  //TABLE
  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  //fin

  url:string=RESERVATION2; 
  stepp!:number;
  taxe:any={};
  yearSystem:any;
  benefit!:number;user!:number;codePred!:number;codeTrib!:string;$yearTrib!:number;
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
    this.yearSystem= new Date().getFullYear();
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
      this.totalPrice=0;
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
      this.user=user.value; 
      this.codeTrib=detail.value; 
      console.log('-------------');
      console.log(this.benefit);
      console.log(this.codeTrib);
      if(this.benefit==0 && this.codeTrib=='2'){
        adress?.enable();
        adress?.reset();
        console.log(this.benefit);
        console.log(this.codeTrib);
        console.log("DIRECCION 1");
        this.http.get(`${RESERVATION2}/taxes/benefit/adress/${user.value}/${detail.value}`).subscribe(
          (response:any)=>{
            console.log(response);
            this.dataAdress=response.data;
          }
        )
      }
      if(this.benefit==1 && (this.codeTrib=='1'||this.codeTrib=='2')){
        year?.enable();
        year?.reset();
        console.log(this.benefit);
        console.log(this.codeTrib);
        console.log("AÑO 1");
        this.http.get(`${RESERVATION2}/taxes/benefit/years/${user.value}/0/${this.codeTrib}`).subscribe(
          (response:any)=>{
            console.log(response);
            this.dataYear=response.data;
          }
        )
      }
    }
  }
  getYear(){
    //Cunando es anteriores deberia salir esta opcion
    const user=this.firstFormGroup?.get('codeCtrl');
    const benefit = this.secondFormGroup.get('benefitCtrl');
    const detail= this.secondFormGroup.get('detailCtrl');
    const adress= this.secondFormGroup.get('adressCtrl');
    const year= this.secondFormGroup.get('yearCtrl');
    if(user && benefit && detail && year){
      this.totalPrice=0;
      let total:number=0;
      this.http.get(`${RESERVATION2}/taxes/benefit/prices/${user.value}/0/${detail.value}/${year.value}`).subscribe(
        (response:any)=>{
          response.data.map((value:any)=>{
            total+= parseFloat(value.CTAC_TOTAL);
          })
          this.totalPrice=total.toFixed(2);  
        }
      )
    }
  }
  getTotal(){
    const user=this.firstFormGroup?.get('codeCtrl');
    const detail= this.secondFormGroup.get('detailCtrl');
    const adress= this.secondFormGroup.get('adressCtrl');
    if(adress){
      let total:number=0;
        this.http.get(`${RESERVATION2}/taxes/benefit/prices/${user?.value}/${adress.value}/${detail?.value}/${this.yearSystem}`).subscribe(
          (response:any)=>{
            response.data.map((value:any)=>{
              total+= parseFloat(value.CTAC_TOTAL);
            })
          this.totalPrice=total.toFixed(2);  
          }
        )
    }else{
      this.http.get(`${RESERVATION2}/taxes/benefit/prices/${user?.value}/0/${detail?.value}`).subscribe(
        (response:any)=>{
          console.log('GET YEAR 2'+response.data);
        }
      )
    }
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: TableTaxe): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  // }
  save(){

  }
}
