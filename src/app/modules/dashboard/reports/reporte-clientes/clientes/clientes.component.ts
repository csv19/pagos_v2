import { Component, OnInit} from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';  
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

const SERVER= environment.SERVER;
interface Column {
  field: string;
  header: string;
}
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [TableModule, TagModule, IconFieldModule, InputTextModule, InputIconModule, MultiSelectModule, SelectModule, HttpClientModule, CommonModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ReportesClientesComponent implements OnInit  {

  clients:any=[];
  cols!: Column[];
  first = 0;rows = 10;
  statuses!: any[];
  dt2: any; // Asegúrate de inicializar esto correctamente

  searchValue: string | undefined;

  loading: boolean = true;

  constructor(private http: HttpClient){}
   ngOnInit() {
    this.http.get(`${SERVER}/list/clients`).subscribe(
      (response:any)=>{
        console.log(response);
        this.clients=response.data;
        this.loading = false;
        this.clients.forEach((client:any) => (client.date = new Date(<Date>client.date)));

      },error=>{console.log(error);
      }
    )
    // this.cols = [
    //   { field: 'nro_document', header: 'N° Documento' },
    //   { field: 'name', header: 'Nombre' },
    //   { field: 'lastName', header: 'Apellidos' },
    //   { field: 'phone', header: 'Celular' }
    // ];
    
   }
   handleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;  // Realiza el casting aquí
    this.dt2.filterGlobal(inputElement.value, 'contains');
  }
   onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;  // Cast a HTMLInputElement
    console.log(inputElement.value);  // Ahora puedes acceder a `value` sin errores
  }
  
   clear(table: Table) {
    table.clear();
    this.searchValue = ''

  }
   next() {
    this.first = this.first + this.rows;
    }

    prev() {
        this.first = this.first - this.rows;
    }

    reset() {
        this.first = 0;
    }

    pageChange(event:any) {
        this.first = event.first;
        this.rows = event.rows;
    }

    isLastPage(): boolean {
        return this.clients ? this.first + this.rows >= this.clients.length : true;
    }
    isFirstPage(): boolean {
      return this.clients ? this.first === 0 : true;
  }

}
