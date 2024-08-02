import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
const RESERVATION2= environment.SERVER2;
export interface Area {
  name: string;
}
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule, RouterLink, AngularSvgIconModule,MatAutocompleteModule, ButtonComponent,NgClass,NgIf,AsyncPipe],
})
export class SignUpComponent implements OnInit {
  form!: FormGroup;
  login:any;
  passwordTextType!: boolean;
  passwordColor!: boolean;
  submitted = false;
  areas:Area[] = [];
  filteredOptions: Observable<Area[]> | undefined;
  constructor(private readonly _formBuilder: FormBuilder, private readonly _router: Router, private http: HttpClient, private authService: AuthService) {
    this.http.get(`${RESERVATION2}/areas`).subscribe(
      (response:any) => {
        this.areas = response.data;
        console.log(this.areas);
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  ngOnInit(): void {
      this.form = this._formBuilder.group({
      user: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.email]],
      area: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.filteredOptions = this.form.get('area')?.valueChanges.pipe(
      startWith(''),
      map((value:any) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.areas.slice();
      }),
    );
    console.log(this.passwordColor);
    
  }
  get f() {
    return this.form.controls;
  }
  
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
  displayFn(area: Area): string {
    return area && area.name ? area.name : '';
  }
  private _filter(name: string): Area[] {
    const filterValue = name.toLowerCase();

    return this.areas.filter(option => option.name.toLowerCase().includes(filterValue));
  }
  sizePassword(){
    const password= this.form.get('password')?.value;
    this.passwordColor=(password.length>8)?true:false;
  }
  get colorPassword(){
    return this.passwordColor === undefined ? 'bg-slate-300' : (this.passwordColor ? 'bg-green-500' : 'bg-red-500');
  }

  onSubmit() {
      const user=this.form.get('user');
      const code=this.form.get('code');
      const name=this.form.get('name');
      const email=this.form.get('email');
      const area=this.form.get('area');
      const password=this.form.get('password');

    if(user && code && name && email && area && password && this.passwordColor){
      const people={
        user:user.value,
        code: code.value,
        name: name.value,
        email: email.value,
        area_id: area.value.id,
        password: password.value
      } 
      this.authService.register(people);
      this.form.reset();
    }else{
      console.log('error');
      this.authService.showErrorPassword();
    }
    
    
  }
}
