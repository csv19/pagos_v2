import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionPersonaComponent } from './informacion-persona.component';

describe('InformacionPersonaComponent', () => {
  let component: InformacionPersonaComponent;
  let fixture: ComponentFixture<InformacionPersonaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionPersonaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InformacionPersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
