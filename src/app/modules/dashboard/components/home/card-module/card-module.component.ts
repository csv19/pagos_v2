import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';


@Component({
  selector: 'app-card-module',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './card-module.component.html',
  styleUrl: './card-module.component.scss',
})

export class CardModuleComponent {
  constructor(private router: Router){
  }
  @Input() size: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() image: string = '';
  @Input() url: string = '';
  @Input() link: string = '';
  
  goToPage(value :string){
    console.log(value);
    
    this.router.navigate([value]);
  }
}
