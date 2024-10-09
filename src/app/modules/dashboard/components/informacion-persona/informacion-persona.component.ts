import {Component,OnInit,Renderer2,ElementRef,EventEmitter, Output } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import {HttpClient } from '@angular/common/http';
import {FormBuilder,Validators, FormsModule,FormControl,FormGroupDirective,NgForm, ReactiveFormsModule, FormGroup } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule,MatStepper} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgFor, NgStyle } from '@angular/common';
import {NumberOnlyDirective } from 'src/app/number-only.directive';
import {PayService } from 'src/app/pay.service';
import {ReniecService } from 'src/app/reniec.service';
import { environment } from 'src/environments/environment';
const SERVER= environment.SERVER;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-informacion-persona',
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
    MatDatepickerModule,
    NumberOnlyDirective,
    MatTooltipModule,
  ],
  templateUrl: './informacion-persona.component.html',
  styleUrl: './informacion-persona.component.scss'
})
export class InformacionPersonaComponent implements OnInit {
  url:string=SERVER; 
  styleBlockDocument:string='block'; styleBlockRuc:string='none'; styleBlockOption='none'; sizeCharter!:number;
  firstFormGroup: FormGroup;
  dataHolidays: any[]=[]; currentDate:any; nextDate:any;
  dataDocument:any; dataCategory:any; dataField:any; dataTypeReservation:any; dataShift:any; dataSchedule:any[]=[]; selectSchedule:any;
  person:any={};
  matcher = new MyErrorStateMatcher();
  @Output() formDataEmitter = new EventEmitter<any>();  
  constructor(private route: ActivatedRoute, private _formBuilder: FormBuilder, private http: HttpClient,private personService: ReniecService){
    this.http.get(`${SERVER}/documents`).subscribe(
      (response:any) => {
        this.dataDocument = response.data;
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    this.firstFormGroup = this._formBuilder.group({
      documentOptionCtrl:[ null, Validators.required],
      documentCtrl:[{ value:null, disabled: true }, [Validators.required]],
      nameCtrl: [{ value:null, disabled: true }],
      lastNameCtrl: [{ value:null, disabled: true }],
      fullNameCtrl: [{ value:null, disabled: true }],
      emailCtrl: [{ value:null, disabled: true }, [Validators.required, Validators.email]],
      phoneCtrl: [{ value:null, disabled: true }, Validators.required, , Validators.minLength(9), Validators.maxLength(9)],
    }, {validators:this.checkFieldsNotEmptyFirstGroup});
  }
  ngOnInit(): void {}
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
  checkFieldsNotEmptyFirstGroup(group: FormGroup) {
    const option_document = group.get('documentOptionCtrl')?.value;
    const document = group.get('documentCtrl')?.value;
    const fullName = group.get('fullNameCtrl')?.value;
    const name = group.get('nameCtrl')?.value;
    const lastName = group.get('lastNameCtrl')?.value;
    const email = group.get('emailCtrl')?.value;
    const phone = group.get('phoneCtrl')?.value;
    if(option_document !==3){
      group.get('fullNameCtrl')?.clearValidators()
      return (document !== null && name !== null && lastName !== null && email !== null && phone !== null) ? null : { fieldsEmpty: true };
    }else{
      group.get('nameCtrl')?.clearValidators()
      group.get('lastNameCtrl')?.clearValidators()
      return (document !== null && fullName !==null && email !== null && phone !== null) ? null : { fieldsEmpty: true };
    }
  }
  
  resetForm(selectOption:number){
    const option_document = this.validateFirstFormGroup().option_document;
    const document = this.validateFirstFormGroup().document;
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const email = this.validateFirstFormGroup().email;
    const phone = this.validateFirstFormGroup().phone;
    if(selectOption){
      let data=[option_document,document,fullName,name,lastName,email,phone];
      data.splice(0,selectOption);
      data.map((item:any)=>{
        if(item.value){
          item.reset()
          item.setValue(null)
        }
      })
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
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const email = this.validateFirstFormGroup().email;
    const phone = this.validateFirstFormGroup().phone;
    this.personService.getPerson(nro_document, option_document).subscribe(data => {
      this.person = data;
      (this.person.typeDocument!==3?name?.setValue(this.convertText(this.person.name,1)):fullName?.setValue(this.convertText(this.person.name,1)));
      (this.person.typeDocument!==3?lastName?.setValue(this.convertText(this.person.lastName,1)):lastName?.setValue(''));
      if(this.person.id !==0){
        email?.disable()
        phone?.disable()
        email?.setValue(this.person.email,1)
        phone?.setValue(this.person.phone,1)
      }else{
        email?.enable()
        phone?.enable()
      }
    },(error:any)=>{
      if (error.error.code === 404) {
        if(option_document !== 3){
          name?.enable()
          lastName?.enable()
        }else{
          fullName?.enable()
        }
      }
    });
  }
  async setPerson(){    
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    const email = this.validateFirstFormGroup().email;
    const phone = this.validateFirstFormGroup().phone;
      if(this.person.id === 0){
        this.person.name = this.person.name || (this.person.typeDocument !== 3 ? name?.value : fullName?.value);
        this.person.lastName = this.person.lastName || lastName?.value;
        this.person.email = email?.value;
        this.person.phone = phone?.value;
        const person:any=await this.personService.savePerson(this.person).toPromise();
        this.person.id=person.data[0].inserted_id;
      }
    console.log(this.person.id);
  }


  getDocumentOption(){
    const {option_document, document}=this.validateFirstFormGroup();
    const fullName = this.validateFirstFormGroup().fullName;
    const name = this.validateFirstFormGroup().name;
    const lastName = this.validateFirstFormGroup().lastName;
    if(option_document){
      console.log(option_document.value);
      switch (option_document.value){
        case 1: 
              this.sizeCharter=8; this.styleBlockDocument='block'; 
              this.styleBlockRuc='none'; 
              name?.setValidators([Validators.required]);
              lastName?.setValidators([Validators.required]);
              break
        case 2: 
              this.sizeCharter=9; 
              this.styleBlockDocument='block'; 
              this.styleBlockRuc='none'; 
              name?.setValidators([Validators.required]);
              lastName?.setValidators([Validators.required]);
              break
        case 3: 
              this.sizeCharter=11;this.styleBlockDocument='none'; 
              this.styleBlockRuc='block'; 
              fullName?.setValidators([Validators.required]);
              break
        default: this.sizeCharter=8;
      }
      document?.enable();
      this.resetForm(1);
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
    this.resetForm(0);
  }
  submitForm() {
    if (this.firstFormGroup.valid) {
      this.setPerson();
      this.formDataEmitter.emit(this.person);
    }
  }

}


