import { HttpClient } from '@angular/common/http';
import { MenuItem } from '../models/menu.model';
import { environment } from 'src/environments/environment';
const RESERVATION2= environment.SERVER2;
export class Menu {

  public static pages: MenuItem[] = [
    {
      group: 'Reportes',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/folder.svg',
          label: 'Reportes',
          route: '/admin/reporte',
          children:[
            { label: 'Campos Deportivos', route: '/admin/reporte/campos-deportivos', children:[{route: '/admin/reporte/campos-deportivos', label: 'Administrador' }] },
            { label: 'Talleres Utiles', route: '/admin/reporte/talleres-utiles', children:[{route: '/admin/reporte/talleres-utiles', label: 'Administrador' }] },
            { label: 'Clientes', route: '/admin/reporte/clientes' },

          ]
        },
      ],
    },
    {
      group: 'Usuarios',
      separator: true,
      items:[
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Usuarios',
          route: '/admin/usuario',
          children: [
            { label: 'Registro de Usuarios', route: '/admin/usuario/registro-usuario' },
            { label: 'Lista de Usuarios', route: '/admin/usuario/lista-usuario' },
          ],
        },
      ]
    },
  ];
  
}
