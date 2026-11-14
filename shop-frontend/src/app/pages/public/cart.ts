import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/cart.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, DecimalPipe],
  template: `
    <h1>{{ lang.t('cart') }}</h1>
    @if (cart.lines().length) {
      <table>
        <thead><tr><th>{{ lang.t('item') }}</th><th>{{ lang.t('price') }}</th><th>{{ lang.t('qty') }}</th><th>{{ lang.t('subtotal') }}</th><th></th></tr></thead>
        <tbody>
          @for (l of cart.lines(); track l.itemId) {
            <tr>
              <td>{{ l.name }}</td>
              <td>{{ l.price | number: '1.2-2' }}</td>
              <td><input type="number" min="1" style="width:70px" [value]="l.quantity"
                         (change)="cart.setQty(l.itemId, +$any($event.target).value)" /></td>
              <td>{{ l.price * l.quantity | number: '1.2-2' }}</td>
              <td><button class="danger" (click)="cart.remove(l.itemId)">{{ lang.t('remove') }}</button></td>
            </tr>
          }
        </tbody>
      </table>
      <h3>{{ lang.t('total') }}: {{ cart.total() | number: '1.2-2' }} EGP</h3>
      <div class="row">
        <button (click)="cart.clear()">{{ lang.t('clearCart') }}</button>
        <a routerLink="/buy"><button class="primary">{{ lang.t('buy') }}</button></a>
      </div>
    } @else { <p>{{ lang.t('emptyCart') }} <a routerLink="/">{{ lang.t('browseItems') }}</a></p> }`,
})
export class Cart { cart = inject(CartService); lang = inject(LanguageService); }
