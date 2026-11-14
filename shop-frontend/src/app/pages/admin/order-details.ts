import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../core/admin.service';
import { Order, errMsg } from '../../core/models';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-order-details',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  template: `
    <a routerLink="/admin/orders">← {{ lang.t('back') }} {{ lang.t('orders') }}</a>
    @if (order(); as o) {
      <h1>{{ lang.t('orderDetails') }}</h1>
      <p class="muted">{{ lang.t('created') }} {{ o.createdAt | date: 'medium' }}</p>
      <div class="card">
        <h3>{{ lang.t('customer') }}</h3>
        <p><b>{{ lang.t('name') }}:</b> {{ o.customer.name }}</p>
        <p><b>{{ lang.t('phoneLabel') }}:</b> {{ o.customer.phone }}</p>
        <p><b>{{ lang.t('email') }}:</b> {{ o.customer.email || '-' }}</p>
        <p><b>{{ lang.t('address') }}:</b> {{ o.customer.address || '-' }}</p>
      </div>
      <table>
        <thead><tr><th>{{ lang.t('item') }}</th><th>{{ lang.t('price') }}</th><th>{{ lang.t('qty') }}</th><th>{{ lang.t('subtotal') }}</th></tr></thead>
        <tbody>
          @for (l of o.items; track l.item) {
            <tr><td>{{ l.name }}</td><td>{{ l.price | number: '1.2-2' }}</td><td>{{ l.quantity }}</td><td>{{ l.price * l.quantity | number: '1.2-2' }}</td></tr>
          }
        </tbody>
      </table>
      <h3>{{ lang.t('total') }}: {{ o.totalPrice | number: '1.2-2' }} EGP</h3>
      <div class="card notes-card">
        <label>{{ lang.t('status') }}</label>
        <select [(ngModel)]="status"><option value="opened">{{ lang.t('opened') }}</option><option value="closed">{{ lang.t('closed') }}</option></select>
        <label>{{ lang.t('addNote') }}</label><textarea [(ngModel)]="notes" placeholder="Write a note about this order..."></textarea>
        @if (msg()) { <p [class]="isError() ? 'error' : 'ok'">{{ msg() }}</p> }
        <button class="primary" (click)="save()">{{ lang.t('saveChanges') }}</button>
      </div>
      <div class="card">
        <h3>{{ lang.t('managerNotes') }}</h3>
        @if (o.noteHistory?.length) {
          <div class="note-list">
            @for (note of o.noteHistory; track note._id) {
              <div class="note-entry">
                <span>{{ note.text }}</span>
                <time>{{ note.createdAt | date: 'dd/MM/yyyy - hh:mm a' }}</time>
              </div>
            }
          </div>
        } @else if (o.notes) {
          <div class="note-entry"><span>{{ o.notes }}</span><time>{{ lang.t('legacyNote') }}</time></div>
        } @else { <p class="muted">{{ lang.t('noNotes') }}</p> }
      </div>
    } @else { <p>{{ lang.t('loading') }}</p> }`,
})
export class OrderDetails implements OnInit {
  private api = inject(AdminService);
  private route = inject(ActivatedRoute);
  order = signal<Order | null>(null);
  msg = signal(''); isError = signal(false);
  status = 'opened'; notes = '';
  lang = inject(LanguageService);

  ngOnInit() {
    this.api.order(this.route.snapshot.paramMap.get('id')!).subscribe(o => {
      this.order.set(o); this.status = o.status; this.notes = '';
    });
  }
  save() {
    const o = this.order(); if (!o) return;
    this.api.updateOrder(o._id, { status: this.status, note: this.notes }).subscribe({
      next: r => { this.order.set(r); this.notes = ''; this.isError.set(false); this.msg.set('Saved with date and time.'); },
      error: e => { this.isError.set(true); this.msg.set(errMsg(e)); },
    });
  }
}
