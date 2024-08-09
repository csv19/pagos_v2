import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCampoDeportivoComponent } from './editar-campo-deportivo.component';

describe('EditarCampoDeportivoComponent', () => {
  let component: EditarCampoDeportivoComponent;
  let fixture: ComponentFixture<EditarCampoDeportivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCampoDeportivoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarCampoDeportivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
