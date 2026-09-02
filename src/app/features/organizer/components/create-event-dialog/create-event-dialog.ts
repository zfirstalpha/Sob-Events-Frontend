import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventStore } from '../../../../core/stores/event.store';
import { CreateEventRequest } from '../../../../core/models';

@Component({
  selector: 'app-create-event-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './create-event-dialog.html',
  styleUrl: './create-event-dialog.scss'
})
export class CreateEventDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateEventDialogComponent>);
  private eventStore = inject(EventStore);
  private snackBar = inject(MatSnackBar);

  isSubmitting = signal<boolean>(false);

  // MODULE 8 SESSION 3: Reactive Forms with strict client-side validation
  eventForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    location: ['', [Validators.required, Validators.maxLength(200)]],
    imageUrl: ['']
  });

  onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formVal = this.eventForm.value;

    // Cross-field date check
    if (new Date(formVal.endDate) <= new Date(formVal.startDate)) {
      this.snackBar.open('End date must be after Start date.', 'Dismiss', { duration: 4000 });
      return;
    }

    this.isSubmitting.set(true);

    const request: CreateEventRequest = {
      name: formVal.name,
      description: formVal.description,
      startDate: new Date(formVal.startDate).toISOString(),
      endDate: new Date(formVal.endDate).toISOString(),
      location: formVal.location,
      imageUrl: formVal.imageUrl || undefined
    };

    // Dispatch to global EventStore
    this.eventStore.createEvent({
      request,
      onSuccess: () => {
        this.isSubmitting.set(false);
        this.snackBar.open('Draft event created successfully!', 'Dismiss', { duration: 3000 });
        this.dialogRef.close(true);
      },onError: (errorMsg) => {
        
        this.isSubmitting.set(false);
        this.snackBar.open(errorMsg, 'Dismiss', { duration: 5000 });
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}