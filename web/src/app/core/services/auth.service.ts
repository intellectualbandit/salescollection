import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from '../models/tracker.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(null);
  private userSignal = signal<AuthUser | null>(null);
  private loadingSignal = signal(true);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(private router: Router) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const saved = localStorage.getItem('reamt_token');
    if (saved) {
      try {
        const payload = JSON.parse(atob(saved.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          this.tokenSignal.set(saved);
          this.userSignal.set({
            firstName: payload.firstName || payload.given_name || '',
            lastName: payload.lastName || payload.family_name || '',
            employeeId: payload.employeeId || payload.sub || '',
          });
        } else {
          localStorage.removeItem('reamt_token');
        }
      } catch {
        localStorage.removeItem('reamt_token');
      }
    }
    this.loadingSignal.set(false);
  }

  async login(username: string, password: string): Promise<void> {
    const res = await fetch(`${environment.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('Invalid username or password');
      throw new Error('Login failed. Please try again.');
    }

    const data = await res.json();
    const token = data.token;
    localStorage.setItem('reamt_token', token);

    const payload = JSON.parse(atob(token.split('.')[1]));
    this.tokenSignal.set(token);
    this.userSignal.set({
      firstName: payload.firstName || payload.given_name || '',
      lastName: payload.lastName || payload.family_name || '',
      employeeId: payload.employeeId || payload.sub || '',
    });
  }

  logout(): void {
    localStorage.removeItem('reamt_token');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
