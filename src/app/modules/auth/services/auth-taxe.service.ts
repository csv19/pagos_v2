import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';


const URL=environment.SERVER2;
@Injectable({
  providedIn: 'root'
})

export class AuthTaxeService {
  private loginStatus = new Subject<boolean>();
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  login(user: number, password: string): Subject<boolean> {
    const data = {
      user: user,
      password: password
    };

    this.http.post<any>(`${URL}/taxes/login`, data).subscribe(
      (response: any) => {
        console.log(response);
        
        if (response.status !== true) {
          this.showError();
          this.loginStatus.next(false);
        } else {
          localStorage.setItem('taxe',response.data);     
          this.validateTaxe();
          this.loginStatus.next(true);
        }
      },
      (error) => {
        console.log(error);
        
        this.showError();
        this.loginStatus.next(false);
      }
    );
    return this.loginStatus;
  }
  
  validateTaxe() {
    this.toastr.success('Usuario Correcto', 'Bienvenido!');
  }

  showError() {
    this.toastr.error('Usuario Incorrecto', 'ERROR!');
  }
}
