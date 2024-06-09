import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamposDeportivosComponent } from './campos-deportivos.component';

describe('CamposDeportivosComponent', () => {
  let component: CamposDeportivosComponent;
  let fixture: ComponentFixture<CamposDeportivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CamposDeportivosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CamposDeportivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
