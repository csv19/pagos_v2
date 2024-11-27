import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCampoDeportivoAtmComponent } from './report-campo-deportivo-atm.component';

describe('ReportCampoDeportivoAtmComponent', () => {
  let component: ReportCampoDeportivoAtmComponent;
  let fixture: ComponentFixture<ReportCampoDeportivoAtmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCampoDeportivoAtmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCampoDeportivoAtmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
