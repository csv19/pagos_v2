import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const URL=environment.SERVER2;
@Injectable({
  providedIn: 'root'
})

export class AuthService {  
  
  constructor(private http: HttpClient, private readonly _router: Router) { }
  login(email:string, password:string){
    const data={
      email: email,
      password: password
    };
    this.http.post<any>(`${URL}/login`,data).subscribe(
      response=>{
        console.log(response);
        localStorage.setItem('token',response.token);
        this.validateToken(response.token);
      },error=>{
        console.error(error);
      }
    );
  }
  validateToken(token:string){
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    this.http.get(`${URL}/profile`, { headers: headers }).subscribe(
      (response:any)=>{
        localStorage.setItem('profileData', JSON.stringify(response));
        this.redirectHome();
      },error=>{
        console.error(error.error.message)
      }
    )   
  }
  logout(){
    const token= localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    
    this.http.get(`${URL}/logout`, { headers: headers }).subscribe(
      response=>{
        localStorage.removeItem('profileData');
        localStorage.removeItem('token');
        this.redirectLogin();
        
      },error=>{
        localStorage.removeItem('profileData');
        localStorage.removeItem('token');
        this.redirectLogin();
        
      }
    )
  }
  redirectLogin() {
    this._router.navigateByUrl('admin/login');
  }

  redirectHome() {
    this._router.navigateByUrl('admin');
  }
  isLoggedIn():boolean{
    const token= localStorage.getItem('token');
    return !!token;        
  }
 
}
