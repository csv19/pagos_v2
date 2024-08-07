import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, Output } from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataTablesModule } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import Swal from 'sweetalert2';

const RESERVATION2= environment.SERVER2;
@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [DataTablesModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss'
})
export class ListaUsuariosComponent implements OnInit {
  iconoPencil = 'assets/icons/heroicons/outline/pencil.svg';
  iconoTrash = 'assets/icons/heroicons/outline/trash.svg';
  usersList:any;
  user!:number;
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>();

  constructor(private http: HttpClient){}
  ngOnInit(): void {
    this.loadUsers();
    this.dtOptions={
      pagingType:'simple_numbers',
      language: LanguageApp.spanish_datatables

    }
    const profile:any=localStorage.getItem('profileData');
    this.user=JSON.parse(profile).data.id;
  }
  update(id:number) {
    console.log(id);
    
  }
  delete(id:number){
    const data={
      id: id
    }
    Swal.fire({
      title: 'Estas Seguro de querer eliminar este usuario?',
      text: 'No se podrá revertir!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminalo!',
      cancelButtonText: 'No, ahora'
    }).then((result) => {
      if (result.value) {
        this.http.post(`${RESERVATION2}/delete`,data).subscribe(
          response=>{
            console.log(response);
            this.loadUsers();
          },error=>{
            console.log(error);
            
            
          }
        )
        Swal.fire(
          'Deleted!',
          'Your imaginary file has been deleted.',
          'success'
        )
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      // race condition fails unit tests if dtOptions isn't sent with dtTrigger
      this.dtTrigger.next(this.dtOptions);
    }, 200);
  }
  loadUsers(){
    this.getUsers().subscribe(
      (response:any)=>{
        console.log(response);
        this.usersList=response.data;        
      },error=>{
        console.error(error);
      }
    )
  }
  getUsers():Observable<any[]>{
    return this.http.get<any[]>(`${RESERVATION2}/users`);
  }
  
  
}
export class LanguageApp {
  public static spanish_datatables = {
    processing: "Procesando...",
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ elementos",
    info: "Mostrando desde _START_ al _END_ de _TOTAL_ elementos",
    infoEmpty: "No hay ningún elemento.",
    infoFiltered: "(filtrado _MAX_ elementos total)",
    infoPostFix: "",
    loadingRecords: "Cargando registros...",
    zeroRecords: "No se encontraron registros",
    emptyTable: "No hay datos disponibles en la tabla",
    paginate: {
      first: "Primero",
      previous: "Anterior",
      next: "Siguiente",
      last: "Último"
    },
    aria: {
      sortAscending: ": Activar para ordenar la tabla en orden ascendente",
      sortDescending: ": Activar para ordenar la tabla en orden descendente"
    }
  }
}
