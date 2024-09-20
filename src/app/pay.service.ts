import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const MERCHANT= environment.MERCHANT;
const URLSESSION= environment.URLSESSION;
const AUTHSECURITY= btoa(`${environment.USER}:${environment.PWD}`);
const URLTOKEN= environment.URLTOKEN;

@Injectable({
  providedIn: 'root'
})


export class PayService {
  private headersSecurity:HttpHeaders;
  private headersToken:HttpHeaders;
  private headersSessionToken:any;
  private bodyToken:any={};
  private sessionToken:any=[];
  
  total:any;
  purchaseNumber:any;
  responseToken:any=[];
  constructor(private http: HttpClient) { 
    this.headersSecurity = new HttpHeaders({
      'Authorization': 'Basic'+' '+AUTHSECURITY
    });
    this.headersToken=new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.sessionToken
    })
    console.log(this.headersSecurity);
    
    // console.log(this.sessionToken);
  }
getMount(total:string){
    this.bodyToken={
      "amount": total,
      "antifraud": {
          "clientIp": "24.252.107.29",
          "merchantDefineData": {
              "MDD15": "Valor MDD 15",
              "MDD20": "Valor MDD 20",
              "MDD33": "Valor MDD 33"
          }
      },
      "channel": "web",
      "recurrenceMaxAmount": 500
    }
   
}

getSessionToken():Observable<any>{
  return this.http.post(URLSESSION, {}, { headers: this.headersSecurity });
}
getToken(value:string):Observable<any>{
  this.headersToken=new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': value
})
 return this.http.post(URLTOKEN+MERCHANT, this.bodyToken, { headers: this.headersToken });
}
getVisa(value:string,total:string,purchaseNumber:string,url:string){
  return `
    VisanetCheckout.configure({
      sessiontoken:'${value}',
      channel:'web',
      merchantid: ${MERCHANT},
      purchasenumber:${purchaseNumber},
      amount: ${total},
      expirationminutes:'5',
      timeouturl:'${url}',
      merchantlogo:'https://tasasonline.munimagdalena.gob.pe/assets/images/logo_niubiz.png',
      formbuttoncolor:'#000000',
      action: '${url}',
      complete: function(params) {
        alert(JSON.stringify(params));
      }
    });
    VisanetCheckout.open();
  `;
}   
// getAuthorizate(transactionToken:any):Observable<any>{
//   this.http.post(URLSESSION, {}, { headers: this.headersSecurity }).subscribe(
//     response=>{
//       console.log(response)
//     },error=>{
//       this.headersSessionToken= error.error.text;
//       return this.headersSessionToken;
//     }
//   );
//   const data={
//     "channel": "web",
//     "captureType": "manual",
//     "countable": true,
//       "order" : {
//       "tokenId": transactionToken,
//       "purchaseNumber": this.purchaseNumber,
//       "amount": 110,
//       "currency": "PEN"
//       }
//     }
//     console.log("NUMERO 2"+this.purchaseNumber);
    
//   return this.http.post(URLAUTORIZATE+MERCHANT,data, { headers: this.headersSessionToken });
// }
}
