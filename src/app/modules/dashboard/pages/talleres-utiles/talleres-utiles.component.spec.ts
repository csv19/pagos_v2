import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalleresUtilesComponent } from './talleres-utiles.component';

describe('TalleresUtilesComponent', () => {
  let component: TalleresUtilesComponent;
  let fixture: ComponentFixture<TalleresUtilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalleresUtilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TalleresUtilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
