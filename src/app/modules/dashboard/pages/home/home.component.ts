import { Component,AfterViewInit} from '@angular/core';
import { CardModuleComponent } from '../../components/home/card-module/card-module.component';
import { NgFor } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import ApexCharts from 'apexcharts'

const SERVER= environment.SERVER;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
      NgFor,
      CardModuleComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  public modules:any;
  public total:number;
  
  ngAfterViewInit() {
    this.pieGrafic()
    this.lineGrafic()
    this.priceGrafic()
    this.useGrafic()
    this.totalGrafic()
  }
  priceGrafic(){
    //LINEA GRAFICA DE INGRESOS SEMANALES
    const options = {
      series: [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69]
    }],
      chart: {
      height: 150,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    xaxis: {
      categories: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    }
    };

    var price = new ApexCharts(document.querySelector("#price"), options);
    price.render();
  }
  lineGrafic(){
    //LINEA GRAFICA DE LOS INGRESOS MENSUALES
    const options = {
      series: [{
      name: 'Inflation',
      data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2]
    }],
      chart: {
      height: 350,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val:any) {
        return val + "%";
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      position: 'top',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          }
        }
      },
      tooltip: {
        enabled: true,
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        formatter: function (val:any) {
          return val + "%";
        }
      }
    
    },
    title: {
      text: 'Rango de Ingresos por Mes',
      floating: true,
      offsetY: 330,
      align: 'center',
      style: {
        color: '#444'
      }
    }
    };


    const line = new ApexCharts(document.querySelector("#line"), options);
    line.render();
  }
  pieGrafic(){
    //CAMPO CON MAYOR DEMANDA
    const options = {
      series: [44, 55, 41, 17, 15],
      chart: {
      width: 490,
      type: 'donut',
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270
      }
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      type: 'gradient',
    },
    legend: {
      formatter: function(val:any, opts:any) {
        return val + " - " + opts.w.globals.series[opts.seriesIndex]
      }
    },
    title: {
      text: 'Campos de Mayor Demanda'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
    };
  
    const pie = new ApexCharts(document.querySelector('#pie'), options)    
    pie.render()
  }
  useGrafic(){
    //CANTIDAD DE USUARIOS REGISTRADOS POR MES
    const options = {
      series: [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69]
    }],
      chart: {
      height: 150,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abri', 'May', 'Jun', 'Jul','Ago','Sep','Oct','Nom','Dic'],
    }
    };

    var user = new ApexCharts(document.querySelector("#user"), options);
    user.render();
  }
  totalGrafic(){
    //PORCENTAJE DE LO RECAUDADO CON RESPECTO A LO QUE SE DEBE LLEGAR
    const options = {
      series: [75],
      chart: {
      height: 150,
      type: 'radialBar',
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
         hollow: {
          margin: 0,
          size: '70%',
          background: '#fff',
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: 'front',
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24
          }
        },
        track: {
          background: '#fff',
          strokeWidth: '67%',
          margin: 0, // margin is in pixels
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35
          }
        },
    
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: '#888',
            fontSize: '17px'
          },
          value: {
            formatter: function(val:any) {
              return parseInt(val);
            },
            color: '#111',
            fontSize: '36px',
            show: true,
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#ABE5A1'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['%'],
    };

    var total = new ApexCharts(document.querySelector("#total"), options);
    total.render();
  }
  constructor(
    private http: HttpClient,
  ){
    this.total=0;
    this.http.get(`${SERVER}/modules`).subscribe(
      (response:any)=>{
        console.log(response);
        this.modules=response.data;
      }
    )
  }
  
}
