import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { FavoritesService } from '../../core/favorites.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="top-strip">{{ lang.t('delivery') }} <span>{{ lang.t('phone') }}</span></div>
    <header class="nav">
      <a routerLink="/" class="brand"><span class="brand-mark">✦</span> My Shop</a>
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ lang.t('home') }}</a>
        <a routerLink="/favorites" routerLinkActive="active">♡ {{ lang.t('favorites') }} <span class="nav-count">{{ fav.ids().length }}</span></a>
        <a routerLink="/cart" routerLinkActive="active">{{ lang.t('bag') }} <span class="nav-count">{{ cart.count() }}</span></a>
        <button class="language-toggle" (click)="lang.toggle()">{{ lang.isArabic ? 'EN' : 'عربي' }}</button>
        <a class="nav-login" routerLink="/admin/login">{{ lang.t('managerLogin') }}</a>
      </nav>
    </header>
    <main class="container"><router-outlet /></main>`,
})
export class PublicLayout {
  cart = inject(CartService);
  fav = inject(FavoritesService);
  lang = inject(LanguageService);
}
