import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SERVER= environment.SERVER;
@Injectable({
  providedIn: 'root'
})
export class ReniecService {
  private person = {
    id: '',
    typeDocument: '',
    document: '',
    name: '',
    lastName: '',
    email: '',
    phone: ''
  };
  constructor(private http: HttpClient) { }
  
  getPerson(document: any, optionDocument: any): Observable<any> {
    const sizeCharter = this.sizeDocument(optionDocument);
    if (document.length === sizeCharter) {
      return this.http.get<any>(`${SERVER}/search/person/${document}/${optionDocument}`).pipe(
        map((response: any) => {
          this.person.id = response.data?.[0]?.id ?? 0;
          this.person.typeDocument = optionDocument;
          this.person.document = document;
          this.person.name = response.data?.[0]?.name ?? response.data.name;
          this.person.lastName = (optionDocument !== 3 ? (response.data?.[0]?.lastName ?? response.data?.lastName) : '');
          this.person.email = response.data?.[0]?.email ?? '';
          this.person.phone = response.data?.[0]?.phone ?? '';
          return this.person;
        })
      );
    }
    return new Observable(observer => observer.next(this.person));
  }

  private sizeDocument(optionDocument:number){
    let sizeCharter!:number;
      switch (optionDocument){
        case 1: return sizeCharter=8; break
        case 2: return sizeCharter=9; break
        case 3: return sizeCharter=11; break
        default: return sizeCharter=8;
      }
  }
}
