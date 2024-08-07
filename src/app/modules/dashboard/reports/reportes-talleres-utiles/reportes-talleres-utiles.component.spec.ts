import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesTalleresUtilesComponent } from './reportes-talleres-utiles.component';

describe('ReportesTalleresUtilesComponent', () => {
  let component: ReportesTalleresUtilesComponent;
  let fixture: ComponentFixture<ReportesTalleresUtilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesTalleresUtilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportesTalleresUtilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
