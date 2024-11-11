import { Component,Inject, OnInit,OnDestroy, ViewChild } from "@angular/core";
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { interval, Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { NgClass, NgIf, NgFor } from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';






const SERVER= environment.SERVER;

@Component({
  selector: 'app-campos-deportivos',
  standalone: true,
  imports: [NgClass,DataTablesModule,MatProgressSpinnerModule,MatTooltipModule,MatDialogModule,RouterLink],
  templateUrl: './campos-deportivos.component.html',
  styleUrl: './campos-deportivos.component.scss'
})
export class ConfigCamposDeportivosComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  iconoPencil = 'assets/icons/heroicons/outline/pencil.svg';
  iconoTrash = 'assets/icons/heroicons/outline/trash.svg';
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>(); 
  data:any=[];
  preloader:boolean=true;
  positionOption: TooltipPosition='above';
  constructor(private http: HttpClient,public dialog: MatDialog){}
  ngOnInit(): void {
    const profile:any=localStorage.getItem('profileData');
    this.dtOptions = {
      pagingType: 'simple_numbers',
      language: LanguageApp.spanish_datatables,
      responsive: true,
      processing:true,
      columns: [
        { title: 'Categoría', data: 'category' },
        { title: 'Tipo de Reserva', data: 'reservation' },
        { title: 'Campo', data: 'field' },
        { title: 'Turno', data: 'shift' },
        { title: 'Precio', data: 'price' },
      ],
    }
    this.fetchData();
  }
  update(id:number){
    console.log(id);
    const data={
      id: id
    }
    const dialogRef=this.dialog.open(ConfigCampoDeportivoComponent,{
      data: data
    });
    dialogRef.beforeClosed().subscribe(result => {
      if(result){
        this.rerender()
      }
      });
    
  }
  fetchData():void{
    setTimeout(()=>{
      this.http.get(`${SERVER}/config/calendar`).subscribe(
        (response:any)=>{
          console.log(response);
          this.data=response.data; 
          this.dtTrigger.next(this.dtOptions);
        },error=>{console.log(error);
        }
      )
      this.preloader=false;
    },1000)
  }

  ngAfterViewInit(): void {
    this.dtTrigger.subscribe(() => {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.columns().every(function () {
          const that = this;
          $('input', this.footer()).on('keyup change', function () {
            const inputValue = (<HTMLInputElement>this).value;
            if (that.search() !== inputValue) {
              that
                .search(inputValue) // Filtra según el valor del input
                .draw(); // Actualiza la tabla con los datos filtrados
            }
          });
        });
      });
    });
  }
  rerender(): void {
    this.preloader=true;
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.fetchData();
      });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}

@Component({
  selector: 'app-config-campo-deportivo',
  standalone: true,
  imports: [ConfigCampoDeportivoComponent,FormsModule,MatDialogModule,ReactiveFormsModule,NgClass],
  templateUrl: '../../../components/config-campo-deportivo/config-campo-deportivo.component.html',
})
export class ConfigCampoDeportivoComponent implements OnInit {
  form!: FormGroup;
  submitted = false;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private readonly _formBuilder: FormBuilder, private readonly _router: Router, private http: HttpClient,public dialog: MatDialog){
    this.http.get(`${SERVER}/areas`).subscribe(
      (value:any) => {
        this.http.get(`${SERVER}/config/calendar/edit/${data.id}`).subscribe(
          (response:any)=>{
              this.form.get('category')?.setValue(response.data[0].category);
              this.form.get('reservation')?.setValue(response.data[0].reservation);
              this.form.get('field')?.setValue(response.data[0].field);
              this.form.get('shift')?.setValue(response.data[0].shift);
              this.form.get('price')?.setValue(response.data[0].email);
          },error=>{console.log(error);
          }
        )
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  ngOnInit(): void {}
  onSubmit(){}
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