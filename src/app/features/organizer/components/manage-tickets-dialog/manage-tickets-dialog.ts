import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TicketService } from '../../../../core/services/ticket';
import { Event, TicketType, CreateTicketTypeRequest } from '../../../../core/models';

@Component({
  selector: 'app-manage-tickets-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, CurrencyPipe, MatDialogModule],
  templateUrl: './manage-tickets-dialog.html',
  styleUrl: './manage-tickets-dialog.scss'
})
export class ManageTicketsDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ManageTicketsDialogComponent>);
  public data: { event: Event } = inject(MAT_DIALOG_DATA);
  private ticketService = inject(TicketService);
  private snackBar = inject(MatSnackBar);

  tickets = signal<TicketType[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  showAddForm = signal<boolean>(false);

  // Reactive Form for Adding a Ticket Tier
  ticketForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    price: [25, [Validators.required, Validators.min(0)]],
    quantity: [100, [Validators.required, Validators.min(1)]],
    startDate: [new Date().toISOString().slice(0, 16), [Validators.required]],
    endDate: ['', [Validators.required]]
  });

  ngOnInit() {
    // Default EndDate to Event Start Date
    if (this.data.event.startDate) {
      this.ticketForm.patchValue({
        endDate: new Date(this.data.event.startDate).toISOString().slice(0, 16)
      });
    }
    this.loadTickets();
  }

  loadTickets() {
    this.isLoading.set(true);
    this.ticketService.getTicketTypesByEvent(this.data.event.id).subscribe({
      next: (res) => {
        this.tickets.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleAddForm() {
    this.showAddForm.update(val => !val);
  }

  onAddTicket() {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const formVal = this.ticketForm.value;

    if (new Date(formVal.endDate) <= new Date(formVal.startDate)) {
      this.snackBar.open('Ticket sales End Date must be after Start Date.', 'Dismiss', { duration: 4000 });
      return;
    }

    this.isSubmitting.set(true);

    const request: CreateTicketTypeRequest = {
      name: formVal.name,
      price: formVal.price,
      quantity: formVal.quantity,
      startDate: new Date(formVal.startDate).toISOString(),
      endDate: new Date(formVal.endDate).toISOString()
    };

    this.ticketService.createTicketType(this.data.event.id, request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open('Ticket tier added successfully!', 'Dismiss', { duration: 3000 });
        this.ticketForm.reset({ price: 25, quantity: 100 });
        this.showAddForm.set(false);
        this.loadTickets(); // Refresh list!
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.snackBar.open(err.error?.detail || 'Failed to add ticket tier.', 'Dismiss', { duration: 5000 });
      }
    });
  }

  onDeleteTicket(id: number) {
    if (!confirm('Are you sure you want to delete/deactivate this ticket tier?')) return;

    this.ticketService.deleteTicketType(this.data.event.id, id).subscribe({
      next: () => {
        this.snackBar.open('Ticket tier removed/deactivated.', 'Dismiss', { duration: 3000 });
        this.loadTickets();
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Failed to delete ticket tier.', 'Dismiss', { duration: 5000 });
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}