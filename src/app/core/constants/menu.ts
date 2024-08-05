import { HttpClient } from '@angular/common/http';
import { MenuItem } from '../models/menu.model';
import { environment } from 'src/environments/environment';
const RESERVATION2= environment.SERVER2;
export class Menu {

  public static pages: MenuItem[] = [
    {
      group: 'Incio',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Módulos',
          route: '/admin',
          children: [
            { label: 'Tributos Municipales', route: '/admin/tributos-municipales' },
            { label: 'Tramites y Servicios', route: '/admin/tramites-servicios' },
            { label: 'Multas', route: '/admin/multas' },
            { label: 'Campos Deportivos', route: '/admin/campos-deportivos' },
            { label: 'Talleres Utiles', route: '/admin/talleres-utiles' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Usuarios',
          route: '/admin',
          children: [
            { label: 'Registro de Usuarios', route: '/admin/registro-usuario' },
            { label: 'Lista de Usuarios', route: '/admin/lista-usuario' },
            // { label: 'Sign in', route: '/admin/sign-in' },
            // { label: 'Forgot Password', route: '/admin/forgot-password' },
            // { label: 'New Password', route: '/admin/new-password' },
            // { label: 'Two Steps', route: '/admin/two-steps' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/folder.svg',
          label: 'Reportes',
          route: '/admin',
          children:[
            { label: 'Tributos Municipales', route: '/admin/tributos-municipales' },
            { label: 'Tramites y Servicios', route: '/admin/tramites-servicios' },
            { label: 'Multas', route: '/admin/multas' },
            { label: 'Campos Deportivos', route: '/admin/campos-deportivos' },
            { label: 'Talleres Utiles', route: '/admin/talleres-utiles' },
          ]
        },
        {
          icon: 'assets/icons/heroicons/outline/shield-exclamation.svg',
          label: 'Erros',
          route: '/errors',
          children: [
            { label: '404', route: '/errors/404' },
            { label: '500', route: '/errors/500' },
          ],
        },
      ],
    },
    {
      group: 'Reportes',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Módules',
          children:[
            { label: 'Tributos Municipales', route: '/admin/tributos-municipales' },
            { label: 'Tramites y Servicios', route: '/admin/tramites-servicios' },
            { label: 'Multas', route: '/admin/multas' },
            { label: 'Campos Deportivos', route: '/admin/campos-deportivos' },
            { label: 'Talleres Utiles', route: '/admin/talleres-utiles' },
            { label: 'Podcast', route: '/dashboard/podcast' },
          ]
        },
        {
          icon: 'assets/icons/heroicons/outline/gift.svg',
          label: 'Gift Card',
          route: '/gift',
        },
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Users',
          route: '/users',
        },
      ],
    },
    {
      group: 'Configuración',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Settings',
          route: '/settings',
        },
        {
          icon: 'assets/icons/heroicons/outline/bell.svg',
          label: 'Notifications',
          route: '/gift',
        },
        {
          icon: 'assets/icons/heroicons/outline/folder.svg',
          label: 'Folders',
          route: '/folders',
          children: [
            { label: 'Current Files', route: '/folders/current-files' },
            { label: 'Downloads', route: '/folders/download' },
            { label: 'Trash', route: '/folders/trash' },
          ],
        },
      ],
    },
  ];
}
