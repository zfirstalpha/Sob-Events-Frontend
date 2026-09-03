import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../core/stores/auth.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  errorMessage = signal<string | null>(null);
  selectedRole = signal<'Attendee' | 'Organizer'>('Attendee');

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  setRole(role: 'Attendee' | 'Organizer') {
    this.selectedRole.set(role);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);

    const payload = {
      ...this.registerForm.value,
      role: this.selectedRole()
    };

    this.authStore.register(
      payload,
      () => {},
      (err) => this.errorMessage.set(err)
    );
  }
}