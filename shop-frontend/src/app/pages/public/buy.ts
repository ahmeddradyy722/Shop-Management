import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/cart.service';
import { CatalogService } from '../../core/catalog.service';
import { errMsg } from '../../core/models';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-buy',
  imports: [FormsModule, RouterLink, DecimalPipe],
  template: `
    <h1>{{ lang.t('buy') }}</h1>
    @if (done()) {
      <div class="card"><h2>{{ lang.t('thankYou') }}</h2>
        <p>{{ lang.t('orderReceived') }}</p>
        @if (emailNotice()) { <p class="muted">{{ emailNotice() }}</p> }
        <a routerLink="/">{{ lang.t('backHome') }}</a></div>
    } @else if (!cart.lines().length) {
      <p>{{ lang.t('emptyCart') }} <a routerLink="/">{{ lang.t('browseItems') }}</a></p>
    } @else {
      @if (paymentCancelled()) { <p class="error">{{ lang.t('paymentCancelled') }}</p> }
      <div class="card">
        <h3>{{ lang.t('orderSummary') }}</h3>
        @for (l of cart.lines(); track l.itemId) { <div>{{ l.name }} × {{ l.quantity }} — {{ l.price * l.quantity | number: '1.2-2' }}</div> }
        <h3>{{ lang.t('total') }}: {{ cart.total() | number: '1.2-2' }} EGP</h3>
      </div>
      <div class="card">
        <h3>{{ lang.t('yourDetails') }}</h3>
        <label>{{ lang.t('name') }}</label><input [(ngModel)]="name" />
        <label>{{ lang.t('phoneLabel') }}</label><input [(ngModel)]="phone" />
        <label>{{ lang.t('email') }}</label><input [(ngModel)]="email" type="email" autocomplete="email" />
        <label>{{ lang.t('address') }}</label><textarea [(ngModel)]="address"></textarea>
        @if (error()) { <p class="error">{{ error() }}</p> }
        @if (emailNotice()) { <p class="muted">{{ emailNotice() }}</p> }
        <p class="muted">{{ lang.t('stripeOrder') }}</p>
        <button class="primary" [disabled]="busy()" (click)="submit()">{{ lang.t('confirmOrder') }}</button>
      </div>
    }`,
})
export class Buy {
  cart = inject(CartService);
  private api = inject(CatalogService);
  name = ''; phone = ''; email = ''; address = '';
  error = signal(''); emailNotice = signal(''); busy = signal(false); done = signal(false);
  lang = inject(LanguageService);
  paymentCancelled = signal(false);

  constructor() {
    inject(ActivatedRoute).queryParamMap.subscribe(params => {
      if (params.get('payment') === 'success') { this.cart.clear(); this.done.set(true); }
      if (params.get('payment') === 'cancelled') this.paymentCancelled.set(true);
    });
  }

  submit() {
    if (!this.name.trim() || !this.phone.trim() || !this.email.trim()) { this.error.set(this.lang.t('requiredDetails')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) { this.error.set(this.lang.t('invalidEmail')); return; }
    this.busy.set(true); this.error.set('');
    this.api.createCheckoutSession({ name: this.name, phone: this.phone, email: this.email, address: this.address }, this.cart.lines()).subscribe({
      next: result => { window.location.assign(result.url); },
      error: e => { this.error.set(errMsg(e)); this.busy.set(false); },
    });
  }
}
