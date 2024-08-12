import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CardModuleComponent } from '../dashboard/components/home/card-module/card-module.component';
import { NgFor, NgClass } from '@angular/common';
import { FooterComponent } from '../layout/components/footer/footer.component';
const MODULE_URL= environment.API_MODULE;
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [AngularSvgIconModule, RouterOutlet,RouterLink, RouterLinkActive, NgFor,NgClass,
    CardModuleComponent,FooterComponent],
})
export class HomeComponent implements OnInit {
  modules:any;
  active:string='';
  esRutaRaiz: boolean = false;
  iconoHome = 'assets/icons/home.png';
  constructor(private http: HttpClient,private router: Router
  ){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.esRutaRaiz=(this.router.url==='/')?true:false;
        this.active=(this.router.url === '/')?'active':'';
      }
    });
    
    this.http.get(MODULE_URL).subscribe(
      (response:any)=>{
        this.modules=response.data;
      }
    )
  }
  ngOnInit(): void {}
}
