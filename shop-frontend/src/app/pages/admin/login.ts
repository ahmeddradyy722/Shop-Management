import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errMsg } from '../../core/models';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="container" style="max-width:380px">
      <form class="card" (ngSubmit)="submit()">
        <p class="eyebrow">{{ lang.t('privateAccess') }}</p>
        <h2>Manager Login</h2>
        <p class="muted">{{ lang.t('signIn') }}</p>
        <label for="email">{{ lang.t('email') }}</label><input id="email" [(ngModel)]="email" name="email" type="email" autocomplete="username" required />
        <label for="password">{{ lang.t('password') }}</label><input id="password" [(ngModel)]="password" name="password" type="password" autocomplete="current-password" required />
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button class="primary" type="submit" [disabled]="busy()">{{ busy() ? lang.t('signingIn') : lang.t('login') }}</button>
      </form>
    </div>`,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = '';
  error = signal('');
  busy = signal(false);
  lang = inject(LanguageService);

  submit() {
    if (!this.email.trim() || !this.password.trim()) {
      this.error.set('Enter your email and password');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.busy.set(false); this.router.navigate(['/admin']); },
      error: e => { this.busy.set(false); this.error.set(errMsg(e)); },
    });
  }
}
