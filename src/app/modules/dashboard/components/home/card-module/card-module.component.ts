import { Component, Input } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


@Component({
  selector: 'app-card-module',
  standalone: true,
  templateUrl: './card-module.component.html',
  styleUrl: './card-module.component.scss',
})

export class CardModuleComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() image: string = '';
  @Input() url: string = '';

  
}
