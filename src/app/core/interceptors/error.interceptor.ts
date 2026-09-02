import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

// MODULE 10 SESSION 3: Global Functional Error Interceptor
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred.';

      // MODULE 6 & 10: Standardized HTTP Status Code Mapping
      if (error.status === 401) {
        errorMessage = 'Authentication required. Please sign in to perform this action.';
      } else if (error.status === 403) {
        errorMessage = 'Access Denied: You do not have the required role for this action.';
      } else if (error.status === 404) {
        errorMessage = error.error?.detail || 'The requested resource was not found.';
      } else if (error.status === 409) {
        // Business Rule / Concurrency conflict (e.g. capacity reached or no tickets)
        errorMessage = error.error?.detail || error.error?.title || 'A business conflict occurred.';
      } else if (error.status === 429) {
        // Rate Limiter triggered!
        errorMessage = 'Rate limit exceeded. You are clicking too quickly. Please wait a moment.';
      } else if (error.status >= 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      }

      // Automatically surface the error to the user in an Angular Material SnackBar!
      snackBar.open(errorMessage, 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });

      // Forward the error so stores know the request completed with failure
      return throwError(() => error);
    })
  );
};