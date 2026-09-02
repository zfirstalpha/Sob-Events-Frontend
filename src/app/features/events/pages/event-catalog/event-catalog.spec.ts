import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCatalog } from './event-catalog';

describe('EventCatalog', () => {
  let component: EventCatalog;
  let fixture: ComponentFixture<EventCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCatalog],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
