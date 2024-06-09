import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TributosMunicipalesComponent } from './tributos-municipales.component';

describe('TributosMunicipalesComponent', () => {
  let component: TributosMunicipalesComponent;
  let fixture: ComponentFixture<TributosMunicipalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TributosMunicipalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TributosMunicipalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
