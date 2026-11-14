import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/cart.service';
import { FavoritesService } from '../../core/favorites.service';
import { CatalogService } from '../../core/catalog.service';
import { Item, localizedCategoryName, localizedItemName, itemDescription } from '../../core/models';
import { imageUrl } from '../../core/config';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-item-details',
  imports: [RouterLink, DecimalPipe],
  template: `
    <a routerLink="/">← {{ lang.t('back') }}</a>
    @if (item(); as i) {
      <div class="detail-grid">
      <div class="detail-image">@if (i.imageUrl || i.name) { <img [src]="img(i.imageUrl, i.name)" [alt]="name(i)" /> } @else { <span>Fresh<br />selection</span> }</div>
      <div class="card detail-content">
        <small class="eyebrow">{{ category(i.category) }}</small>
        <h1>{{ name(i) }}</h1>
        <p>{{ description(i) }}</p>
        <p class="price">{{ i.price | number: '1.2-2' }} EGP</p>
        <div class="row">
          <button class="primary" [disabled]="i.inStock === false" (click)="cart.add(i); added.set(true)">
            {{ i.inStock === false ? lang.t('soldOut') : lang.t('addCart') }}
          </button>
          <button (click)="fav.toggle(i._id)">{{ fav.has(i._id) ? '♥ ' + lang.t('saved') : '♡ ' + lang.t('favorite') }}</button>
          <a routerLink="/cart">{{ lang.t('goCart') }}</a>
        </div>
        </div>
        @if (added()) { <p class="ok">{{ lang.t('added') }}</p> }
      </div>
    } @else if (notFound()) { <p class="error">{{ lang.t('notFound') }}</p> } @else { <p>{{ lang.t('loading') }}</p> }`,
})
export class ItemDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(CatalogService);
  cart = inject(CartService);
  fav = inject(FavoritesService);
  item = signal<Item | null>(null);
  notFound = signal(false);
  added = signal(false);
  img = imageUrl;
  lang = inject(LanguageService);
  description(item: Item) { return itemDescription(item, this.lang.language()); }
  name(item: Item) { return localizedItemName(item, this.lang.language()); }
  category(category: Item['category']) { return typeof category === 'string' ? category : localizedCategoryName(category, this.lang.language()); }

  ngOnInit() {
    this.api.item(this.route.snapshot.paramMap.get('id')!).subscribe({
      next: i => this.item.set(i),
      error: () => this.notFound.set(true),
    });
  }
}
