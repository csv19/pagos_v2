import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  imports: [HomeRoutingModule, HttpClientModule, AngularSvgIconModule.forRoot()],
})
export class HomeModule {}