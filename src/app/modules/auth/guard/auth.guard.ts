import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot,  } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService= inject(AuthService);
  const roleRoute = route.data['role'];
  const role=localStorage.getItem('role');
  if(authService.isLoggedIn()){
    if(role === roleRoute){
      return true;
    }
  return true;
  }else{
    router.navigateByUrl('/admin/login');
    return false;
  }
};
export const authGuardMatch: CanMatchFn=(route: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const authService= inject(AuthService);
  if(authService.isLoggedIn()){
    return true;
  }else{
    router.navigateByUrl('/admin/login');
    return false;
  }
  
}  

