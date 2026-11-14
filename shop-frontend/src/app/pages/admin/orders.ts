import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../core/admin.service';
import { Order } from '../../core/models';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <h1>{{ lang.t('orders') }}</h1>
    <div class="stats">
      <div class="stat"><span class="muted">{{ lang.t('totalOrders') }}</span><strong>{{ orders().length }}</strong></div>
      <div class="stat"><span class="muted">{{ lang.t('opened') }}</span><strong>{{ openedCount() }}</strong></div>
      <div class="stat"><span class="muted">{{ lang.t('closed') }}</span><strong>{{ closedCount() }}</strong></div>
      <div class="stat"><span class="muted">{{ lang.t('revenue') }}</span><strong>{{ revenue() | number: '1.2-2' }} EGP</strong></div>
    </div>
    <div class="row chips">
      <button [class.active]="status() === ''" (click)="filter('')">{{ lang.t('all') }}</button>
      <button [class.active]="status() === 'opened'" (click)="filter('opened')">{{ lang.t('opened') }}</button>
      <button [class.active]="status() === 'closed'" (click)="filter('closed')">{{ lang.t('closed') }}</button>
    </div>
    <table>
      <thead><tr><th>{{ lang.t('date') }}</th><th>{{ lang.t('customer') }}</th><th>{{ lang.t('phoneLabel') }}</th><th>{{ lang.t('total') }}</th><th>{{ lang.t('status') }}</th><th></th></tr></thead>
      <tbody>
        @for (o of orders(); track o._id) {
          <tr><td>{{ o.createdAt | date: 'short' }}</td><td>{{ o.customer.name }}</td><td>{{ o.customer.phone }}</td>
            <td>{{ o.totalPrice | number: '1.2-2' }}</td><td><span class="badge" [class]="o.status">{{ o.status === 'opened' ? lang.t('opened') : lang.t('closed') }}</span></td>
            <td><a [routerLink]="['/admin/orders', o._id]">{{ lang.t('details') }}</a></td></tr>
        } @empty { <tr><td colspan="6">{{ lang.t('noOrders') }}</td></tr> }
      </tbody>
    </table>`,
})
export class Orders implements OnInit {
  private api = inject(AdminService);
  orders = signal<Order[]>([]);
  status = signal('');
  lang = inject(LanguageService);
  openedCount = () => this.orders().filter(o => o.status === 'opened').length;
  closedCount = () => this.orders().filter(o => o.status === 'closed').length;
  revenue = () => this.orders().reduce((sum, o) => sum + o.totalPrice, 0);
  ngOnInit() { this.load(); }
  filter(s: string) { this.status.set(s); this.load(); }
  load() { this.api.orders(this.status()).subscribe(o => this.orders.set(o)); }
}
