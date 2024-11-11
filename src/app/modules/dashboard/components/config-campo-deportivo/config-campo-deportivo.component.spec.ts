import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigCampoDeportivoComponent } from './config-campo-deportivo.component';

describe('ConfigCampoDeportivoComponent', () => {
  let component: ConfigCampoDeportivoComponent;
  let fixture: ComponentFixture<ConfigCampoDeportivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigCampoDeportivoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigCampoDeportivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
