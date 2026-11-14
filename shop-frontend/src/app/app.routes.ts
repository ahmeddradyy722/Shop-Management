import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/public/public-layout').then(m => m.PublicLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/public/home').then(m => m.Home) },
      { path: 'items/:id', loadComponent: () => import('./pages/public/item-details').then(m => m.ItemDetails) },
      { path: 'favorites', loadComponent: () => import('./pages/public/favorites').then(m => m.Favorites) },
      { path: 'cart', loadComponent: () => import('./pages/public/cart').then(m => m.Cart) },
      { path: 'buy', loadComponent: () => import('./pages/public/buy').then(m => m.Buy) },
    ],
  },
  { path: 'admin/login', loadComponent: () => import('./pages/admin/login').then(m => m.Login) },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      { path: 'categories', loadComponent: () => import('./pages/admin/categories').then(m => m.Categories) },
      { path: 'items', loadComponent: () => import('./pages/admin/items').then(m => m.Items) },
      { path: 'orders', loadComponent: () => import('./pages/admin/orders').then(m => m.Orders) },
      { path: 'orders/:id', loadComponent: () => import('./pages/admin/order-details').then(m => m.OrderDetails) },
    ],
  },
  { path: '**', redirectTo: '' },
];
