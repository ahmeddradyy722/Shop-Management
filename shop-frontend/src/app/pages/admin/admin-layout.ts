import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <span class="brand">{{ lang.t('dashboard') }}</span>
      <nav>
        <a routerLink="/admin/orders" routerLinkActive="active">{{ lang.t('orders') }}</a>
        <a routerLink="/admin/items" routerLinkActive="active">{{ lang.t('items') }}</a>
        <a routerLink="/admin/categories" routerLinkActive="active">{{ lang.t('categories') }}</a>
        <a routerLink="/">{{ lang.t('viewShop') }}</a>
        <button class="language-toggle" (click)="lang.toggle()">{{ lang.isArabic ? 'EN' : 'عربي' }}</button>
        <a href="#" (click)="$event.preventDefault(); auth.logout()">{{ lang.t('logout') }}</a>
      </nav>
    </header>
    <main class="container"><router-outlet /></main>`,
})
export class AdminLayout { auth = inject(AuthService); lang = inject(LanguageService); }
