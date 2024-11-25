import { HttpClient } from '@angular/common/http';
import { MenuItem } from '../models/menu.model';
import { environment } from 'src/environments/environment';
const SERVER= environment.SERVER;
export class Menu {

  public static pages: MenuItem[] = [
    {
      
      group: 'Inicio',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Inicio',
          route: '/admin/home',
        },
      ],
    },
    {
      
      group: 'Caja',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Caja',
          route: '/admin/caja',
          children: [
            { label: 'Tributos Municipales', route: '/admin/caja/tributos-municipales' },
            { label: 'Tramites y Servicios', route: '/admin/caja/tramites-servicios' },
            { label: 'Multas', route: '/admin/caja/multas' },
            { label: 'Campos Deportivos', route: '/admin/caja/campos-deportivos' },
            { label: 'Talleres Utiles', route: '/admin/caja/talleres-utiles' },
          ],
        },
      ],
    },
    {
      group: 'Reportes',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/folder.svg',
          label: 'Reportes',
          route: '/admin/reporte',
          children:[
            { label: 'Tributos Municipales', route: '/admin/reporte/tributos-municipales', children:[{route: '/admin/reporte/tributos-municipales/admin', label: 'Administrador' },{route: '/admin/reporte/tributos-municipales/atm', label: 'Cajero' },] },
            { label: 'Tramites y Servicios', route: '/admin/reporte/tramites-servicios', children:[{route: '/admin/reporte/tramites-servicios/admin', label: 'Administrador' },{route: '/admin/reporte/tramites-servicios/atm', label: 'Cajero' },] },
            { label: 'Multas', route: '/admin/reporte/multas', children:[{route: '/admin/reporte/multas/admin', label: 'Administrador' },{route: '/admin/reporte/multas/atm', label: 'Cajero' },] },
            { label: 'Campos Deportivos', route: '/admin/reporte/campos-deportivos', 
              children:[{route: '/admin/reporte/campos-deportivos/administrador', label: 'Administrador' },
                        {route: '/admin/reporte/campos-deportivos/cajero', label: 'Cajero' }]
            },
            { label: 'Talleres Utiles', route: '/admin/reporte/talleres-utiles', children:[{route: '/admin/reporte/talleres-utiles', label: 'Administrador' },{route: '/admin/reporte/talleres-utiles/atm', label: 'Cajero' },] },
            { label: 'Clientes', route: '/admin/reporte/clientes' },

          ]
        },
      ],
    },
    {
      group: 'Administrador',
      separator: true,
      items:[
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Administrador',
          route: '/admin/configuracion',
          children: [
            {
              label:'Usuarios',children:[{ label: 'Registro de Usuarios', route: '/admin/configuracion/usuario/registro-usuario' },
                { label: 'Lista de Usuarios', route: '/admin/configuracion/usuario/lista-usuario' }]
            },
            { label: 'Campos Deportivos', route: '/admin/configuracion/campos-deportivos' },
            { label: 'Talleres Utiles', route: '/admin/configuracion/talleres-deportivos' },
            // { label: 'Forgot Password', route: '/admin/forgot-password' },
            // { label: 'New Password', route: '/admin/new-password' },
            // { label: 'Two Steps', route: '/admin/two-steps' },
          ],
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
      ]
    },
    {
      group: 'Configuración',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Configuración',
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
