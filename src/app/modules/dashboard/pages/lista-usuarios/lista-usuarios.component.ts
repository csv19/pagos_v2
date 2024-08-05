import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, Output } from "@angular/core";
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataTablesModule } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';


const RESERVATION2= environment.SERVER2;
@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [DataTablesModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss'
})
export class ListaUsuariosComponent implements OnInit {
  usersList:any;
  dtOptions:ADTSettings={};
  dtTrigger = new Subject<ADTSettings>();

  constructor(private http: HttpClient){
    
  }
  ngOnInit(): void {
    this.getUsers();
    this.dtOptions={
      pagingType:'full_numbers'
    }
  }
  update() {
    console.log(this.usersList);
    
  }
  ngAfterViewInit() {
    setTimeout(() => {
      // race condition fails unit tests if dtOptions isn't sent with dtTrigger
      this.dtTrigger.next(this.dtOptions);
    }, 200);
  }
  getUsers(){
    this.http.get(`${RESERVATION2}/users`).subscribe(
      (response:any)=>{
        console.log(response);
        this.usersList=response.data;        
      },error=>{
        console.error(error);
      }
    )
  }
}
