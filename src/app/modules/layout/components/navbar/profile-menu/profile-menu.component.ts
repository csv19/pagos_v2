import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ThemeService } from '../../../../../core/services/theme.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
const SERVER= environment.SERVER;
@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  standalone: true,
  imports: [ClickOutsideDirective, NgClass, RouterLink, AngularSvgIconModule],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class ProfileMenuComponent implements OnInit {
  public isOpen = false;
  public profileMenu = [
    {
      title: 'Perfil',
      icon: './assets/icons/heroicons/outline/user-circle.svg',
    },
    {
      title: 'Configuración',
      icon: './assets/icons/heroicons/outline/cog-6-tooth.svg',
    },
    {
      title: 'Cerrar Session',
      icon: './assets/icons/heroicons/outline/logout.svg',
      action: this.onLogout.bind(this), // Pasamos la función onLogout() como acción
    },
  ];

  public themeColors = [
    {
      name: 'base',
      code: '#000',
    },
    {
      name: 'yellow',
      code: '#f59e0b',
    },
    {
      name: 'green',
      code: '#22c55e',
    },
    {
      name: 'blue',
      code: '#3b82f6',
    },
    {
      name: 'orange',
      code: '#ea580c',
    },
    {
      name: 'red',
      code: '#cc0022',
    },
    {
      name: 'violet',
      code: '#6d28d9',
    },
  ];

  public themeMode = ['dark','light'];
  public profileData:any={};
  constructor(public themeService: ThemeService, private http: HttpClient, private authService: AuthService) {
    // console.log(localStorage.getItem('profileData'));
  }

  ngOnInit(): void {
    const profileData=localStorage.getItem('profileData');
    if(profileData){
      this.profileData=JSON.parse(profileData);
      console.log(profileData);
    }
    
  }

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  toggleThemeMode() {
    this.themeService.theme.update((theme) => {
      const mode = !this.themeService.isDark ? 'dark' : 'light';
      return { ...theme, mode: mode };
    });
  }

  toggleThemeColor(color: string) {  
    this.themeService.theme.update((theme) => {
      return { ...theme, color: color };
    });
  }
  onLogout(){
    console.log("CERRAR SESSION");
    this.authService.logout();
  }
}
