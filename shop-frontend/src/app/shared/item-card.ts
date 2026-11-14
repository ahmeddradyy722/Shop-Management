import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../core/cart.service';
import { FavoritesService } from '../core/favorites.service';
import { Item, localizedCategoryName, localizedItemName, itemDescription } from '../core/models';
import { imageUrl } from '../core/config';
import { LanguageService } from '../core/language.service';

@Component({
  selector: 'app-item-card',
  imports: [RouterLink, DecimalPipe],
  template: `
    <article class="product-card">
      <a class="product-image" [class.sold-out-image]="item().inStock === false" [routerLink]="['/items', item()._id]">
        @if (item().imageUrl || item().name) { <img [src]="img(item().imageUrl, item().name)" [alt]="name(item())" /> }
        @else { <span>Fresh<br />selection</span> }
        @if (item().inStock === false) { <span class="sold-out-badge">Sold out</span> }
      </a>
      <div class="product-body">
        <small class="eyebrow">{{ category(item().category) }}</small>
        <h3><a [routerLink]="['/items', item()._id]">{{ name(item()) }}</a></h3>
        <p class="muted product-description">{{ description(item()) }}</p>
        <div class="product-footer"><p class="price">{{ item().price | number: '1.2-2' }} <small>EGP</small></p>
        <button class="favorite-btn" (click)="fav.toggle(item()._id)">{{ fav.has(item()._id) ? '♥' : '♡' }}</button></div>
        <button class="primary product-action" [disabled]="item().inStock === false" (click)="cart.add(item())">
          {{ item().inStock === false ? lang.t('soldOut') : lang.t('addBag') }} <span>{{ item().inStock === false ? '×' : '+' }}</span>
        </button>
      </div>
    </article>`,
})
export class ItemCard {
  item = input.required<Item>();
  cart = inject(CartService);
  fav = inject(FavoritesService);
  category(c: Item['category']) {
    return typeof c === 'string' ? c : localizedCategoryName(c, this.lang.language());
  }
  img = imageUrl;
  lang = inject(LanguageService);
  description(item: Item) { return itemDescription(item, this.lang.language()); }
  name(item: Item) { return localizedItemName(item, this.lang.language()); }
}
