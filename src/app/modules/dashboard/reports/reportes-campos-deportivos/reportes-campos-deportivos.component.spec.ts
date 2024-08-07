import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesCamposDeportivosComponent } from './reportes-campos-deportivos.component';

describe('ReportesCamposDeportivosComponent', () => {
  let component: ReportesCamposDeportivosComponent;
  let fixture: ComponentFixture<ReportesCamposDeportivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesCamposDeportivosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportesCamposDeportivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
