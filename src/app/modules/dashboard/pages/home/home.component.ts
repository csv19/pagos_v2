import { Component } from '@angular/core';
import { CardModuleComponent } from '../../components/home/card-module/card-module.component';
import { NgFor } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

const MODULE_URL= environment.API_MODULE;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
      NgFor,
      CardModuleComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  public modules:any;
  
  constructor(
    private http: HttpClient,
  ){
    this.http.get(MODULE_URL).subscribe(
      (response)=>{
        this.modules=response;
      }
    )
  }
}
