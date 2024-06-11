import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CardModuleComponent } from '../dashboard/components/home/card-module/card-module.component';
import { NgFor } from '@angular/common';
const MODULE_URL= environment.API_MODULE;
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [AngularSvgIconModule, RouterOutlet, NgFor,
    CardModuleComponent,],
})
export class HomeComponent implements OnInit {
  public modules:any;
  constructor(    private http: HttpClient,
  ){
    this.http.get(MODULE_URL).subscribe(
      (response)=>{
        this.modules=response;
      }
    )
  }
  ngOnInit(): void {}
}
