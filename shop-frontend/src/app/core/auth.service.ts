import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from './config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private _token = signal<string | null>(localStorage.getItem('token'));
  readonly isLoggedIn = computed(() => !!this._token());

  get token() { return this._token(); }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${API}/auth/login`, { email, password }).pipe(
      tap(r => { localStorage.setItem('token', r.token); this._token.set(r.token); })
    );
  }
  logout() {
    localStorage.removeItem('token');
    this._token.set(null);
    this.router.navigate(['/admin/login']);
  }
}
