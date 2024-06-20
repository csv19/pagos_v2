import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, Route, UrlSegment,  } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const inLogin= localStorage.getItem('token');
  if(inLogin !== null){
    return true;
  }else{
    return false;
  }
};
export const authGuardMatch: CanMatchFn=(route: Route, segments: UrlSegment[]) => {
  const inLogin= localStorage.getItem('token');
  if(inLogin !== null){
    return true;
  }else{
    return false;
  }
  
}  

