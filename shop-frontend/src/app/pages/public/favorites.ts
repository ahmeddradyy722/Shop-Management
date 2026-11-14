import { Component, effect, inject, signal } from '@angular/core';
import { FavoritesService } from '../../core/favorites.service';
import { CatalogService } from '../../core/catalog.service';
import { Item } from '../../core/models';
import { ItemCard } from '../../shared/item-card';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-favorites',
  imports: [ItemCard],
  template: `
    <h1>{{ lang.t('favoritesPage') }}</h1>
    <div class="grid">
      @for (i of items(); track i._id) { <app-item-card [item]="i" /> } @empty { <p>{{ lang.t('noFavorites') }}</p> }
    </div>`,
})
export class Favorites {
  private fav = inject(FavoritesService);
  private api = inject(CatalogService);
  items = signal<Item[]>([]);
  lang = inject(LanguageService);

  constructor() {
    effect(() => {
      const ids = this.fav.ids();
      if (!ids.length) { this.items.set([]); return; }
      this.api.byIds(ids).subscribe(r => this.items.set(r));
    });
  }
}
