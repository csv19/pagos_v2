import { HttpClient } from '@angular/common/http';
import { Component,Inject, OnInit,OnDestroy, ViewChild } from "@angular/core";
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataTablesModule } from 'angular-datatables';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {map, startWith} from 'rxjs/operators';
import { NumberOnlyDirective } from 'src/app/number-only.directive';
import { DataTableDirective } from 'angular-datatables';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';

const SERVER= environment.SERVER;
@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [DataTablesModule,MatDialogModule,MatProgressSpinnerModule,NgClass],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss'
})
export class ListaUsuariosComponent implements OnInit {
  iconoPencil = 'assets/icons/heroicons/outline/pencil.svg';
  iconoTrash = 'assets/icons/heroicons/outline/trash.svg';
  usersList:any=[];
  preloader:boolean=true;
  user!:number;
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>();

  constructor(private http: HttpClient,public dialog: MatDialog){}
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;

  ngOnInit(): void {
    this.dtOptions={
      pagingType:'simple_numbers',
      language: LanguageApp.spanish_datatables
    }
    this.loadUsers();
    const profile:any=localStorage.getItem('profileData');
    this.user=JSON.parse(profile).data.id;
  }
  loadUsers(){
    setTimeout(()=>{
      this.getUsers().subscribe(
        (response:any)=>{
          console.log(response);
          this.usersList=response.data;     
          this.dtTrigger.next(this.dtOptions);   
        },error=>{
          console.error(error);
        }
      )
      this.preloader=false;
    },1000)
  }
  getUsers():Observable<any[]>{
    return this.http.get<any[]>(`${SERVER}/users`);
  }
  update(id:number) {
    const data={
      id: id
    }
    const dialogRef=this.dialog.open(EditarUsuarioComponent,{
      data: data
    });
    dialogRef.beforeClosed().subscribe(result => {
      if(result){
        this.rerender()
      }
      });
  }
  delete(id:number){
    const data={
      id: id
    }
    Swal.fire({
      title: 'Estas seguro de querer eliminar este usuario?',
      text: 'No se podrá revertir!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminalo!',
      cancelButtonText: 'No, ahora',
      customClass:{
        confirmButton: 'bg-blue-500',
        cancelButton: 'bg-red-500',
        denyButton: 'bg-red-500',
      }
    }).then((result) => {
      if (result.value) {
        this.http.post(`${SERVER}/delete`,data).subscribe(
          response=>{
            this.rerender();
          },error=>{
            console.log(error);
          }
        )
        Swal.fire(
          'Eliminado!',
          'Se elimino el usuario con éxito.',
          'success'
        )
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title:'Cancelado',
           text:'No se elimino el usuario',
           icon: 'error',
           timer: 1500
        } 
        )
      }
    })
  }
  ngAfterViewInit(): void {
    this.dtTrigger.subscribe(() => {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.columns().every(function () {
          const that = this;
              that
                .draw(); // Actualiza la tabla con los datos filtrados
        });
      });
    });;
  }
  rerender(): void {
    this.preloader=true;
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.loadUsers();
      });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
export interface Area {
  name: string;
}
@Component({
  selector: 'editar-usuario.component',
  standalone: true,
  imports: [EditarUsuarioComponent, FormsModule,MatButtonModule,MatDialogModule, ReactiveFormsModule,RouterLink,AngularSvgIconModule,MatAutocompleteModule,ButtonComponent,NgClass,NgIf,AsyncPipe,NumberOnlyDirective],
  templateUrl: '../../components/editar-usuario/editar-usuario.component.html',
})

export class EditarUsuarioComponent implements OnInit{
  form!: FormGroup;
  login:any;
  passwordTextType!: boolean;
  passwordColor!: boolean;
  submitted = false;
  areas:Area[] = [];
  filteredOptions: Observable<Area[]> | undefined;
  userId!:number;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private readonly _formBuilder: FormBuilder, private readonly _router: Router, private http: HttpClient, private authService: AuthService,public dialog: MatDialog) {
    this.http.get(`${SERVER}/areas`).subscribe(
      (value:any) => {
        this.areas = value.data;
        this.http.get(`${SERVER}/edit/${data.id}`).subscribe(
          (response:any)=>{
              const area_id:number=response.data[0].area_id;
              this.userId=data.id;
              this.form.get('name')?.setValue(response.data[0].name);
              this.form.get('user')?.setValue(response.data[0].user);
              this.form.get('code')?.setValue(response.data[0].code);
              this.form.get('email')?.setValue(response.data[0].email);
              this.form.get('area')?.setValue(this.areas[area_id -1]);
              // this.user.area=this.areas[area_id -1].name;
          },error=>{console.log(error);
          }
        )
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
    
    
  }
  ngOnInit(): void {
  this.form = this._formBuilder.group({
    user: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.email]],
    area: ['', [Validators.required, Validators.email]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  this.filteredOptions = this.form.get('area')?.valueChanges.pipe(
    startWith(''),
    map((value:any) => {
      const name = typeof value === 'string' ? value : value?.name;
      return name ? this._filter(name as string) : this.areas.slice();
    }),
  );
}
  get f() {
    return this.form.controls;
  }
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
  displayFn(area: Area): string {
      return area && area.name ? area.name : '';    
  }
  private _filter(name: string): Area[] {
    const filterValue = name.toLowerCase();

    return this.areas.filter(option => option.name.toLowerCase().includes(filterValue));
  }
  sizePassword(){
    const password= this.form.get('password')?.value;
    this.passwordColor=(password.length>8)?true:false;
  }
  get colorPassword(){
    return this.passwordColor === undefined ? 'bg-slate-300' : (this.passwordColor ? 'bg-green-500' : 'bg-red-500');
  }
  onSubmit(){
    const user=this.form.get('user');
    const code=this.form.get('code');
    const name=this.form.get('name');
    const email=this.form.get('email');
    const area=this.form.get('area');
    const password=this.form.get('password');
    
    if(user && code && name && email && area && password && this.passwordColor){
      const people={
        id: this.userId,
        user:user.value,
        code: code.value,
        name: name.value,
        email: email.value,
        area_id: area.value.id,
        password: password.value
      } 
      this.authService.update(people);
      this.dialog.closeAll()
    }
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
