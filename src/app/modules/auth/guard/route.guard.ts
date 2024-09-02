import { inject } from '@angular/core';
import {CanActivateFn, CanMatchFn, Router, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
export const routeGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const router = inject(Router);
  const roleRoute = route.data['roles'];
  const role=localStorage.getItem('role');
  if(role === roleRoute){
    return true;  
  }else{
    router.navigateByUrl('/admin/home');
    return false;
  }
  
};
