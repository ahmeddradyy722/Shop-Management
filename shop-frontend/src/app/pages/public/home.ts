import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { Category, Item, localizedCategoryName } from '../../core/models';
import { ItemCard } from '../../shared/item-card';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, ItemCard],
  template: `
    <section class="hero shop-hero">
      <div class="hero-copy"><p class="eyebrow">{{ lang.t('shoppingDays') }}</p><h1>{{ lang.t('everything') }}<br /><em>{{ lang.t('allPlace') }}</em></h1><p>{{ lang.t('heroText') }}</p><button class="hero-cta" (click)="scrollToProducts()">{{ lang.t('shopNow') }} <span>→</span></button></div>
      <div class="hero-art"><div class="art-circle"></div><div class="art-card art-card-one">✦<small>Fresh<br />everyday</small></div><div class="art-card art-card-two">50%<small>OFF</small></div></div>
    </section>
    <section class="category-bar">
      <div class="category-label"><span class="category-icon">▦</span><strong>{{ lang.t('shopCategory') }}</strong></div>
      <button [class.active]="!cat()" (click)="pick('')"><span>✦</span> {{ lang.t('allItems') }}</button>
      @for (c of cats(); track c._id) { <button [class.active]="cat() === c._id" (click)="pick(c._id)"><span>{{ categoryIcon(c.name) }}</span>{{ categoryName(c) }}</button> }
    </section>
    <section class="catalog-section" id="products">
      <div class="section-heading"><div><p class="eyebrow">{{ lang.t('todayPicks') }}</p><h2>{{ lang.t('freshFinds') }}</h2></div>
        <div class="search-box"><input [(ngModel)]="search" (keyup.enter)="load()" [placeholder]="lang.t('search')" /><button class="primary" (click)="load()">⌕</button></div>
      </div>
      <div class="sale-heading"><div><span class="sale-dot"></span><strong>{{ lang.t('flashSale') }}</strong><small>{{ lang.t('limited') }}</small></div><span class="sale-timer">{{ lang.t('endsSoon') }}</span></div>
      <div class="grid product-grid">
        @for (i of items(); track i._id) { <app-item-card [item]="i" /> } @empty { <p>No items found.</p> }
      </div>
    </section>`,
})
export class Home implements OnInit {
  private api = inject(CatalogService);
  cats = signal<Category[]>([]);
  items = signal<Item[]>([]);
  cat = signal('');
  search = '';
  lang = inject(LanguageService);
  categoryIcon(name: string) { return name.toLowerCase().includes('drink') ? '◒' : name.toLowerCase().includes('snack') ? '◈' : '✦'; }
  categoryName(category: Category) { return localizedCategoryName(category, this.lang.language()); }
  scrollToProducts() { document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }
  ngOnInit() { this.api.categories().subscribe(c => this.cats.set(c)); this.load(); }
  pick(id: string) { this.cat.set(id); this.load(); }
  load() { this.api.items(this.cat(), this.search).subscribe(i => this.items.set(i)); }
}
