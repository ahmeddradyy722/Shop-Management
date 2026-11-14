import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API } from './config';
import { CartLine, Category, Item } from './models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  categories() { return this.http.get<Category[]>(`${API}/categories`); }
  items(category = '', search = '') {
    let p = new HttpParams();
    if (category) p = p.set('category', category);
    if (search) p = p.set('search', search);
    return this.http.get<Item[]>(`${API}/items`, { params: p });
  }
  item(id: string) { return this.http.get<Item>(`${API}/items/${id}`); }
  byIds(ids: string[]) { return this.http.post<Item[]>(`${API}/items/by-ids`, { ids }); }
  createOrder(customer: { name: string; phone: string; email: string; address?: string }, lines: CartLine[]) {
    return this.http.post<{ _id: string; totalPrice: number; emailSent: boolean; emailWarning?: string }>(`${API}/orders`, {
      customer, items: lines.map(l => ({ itemId: l.itemId, quantity: l.quantity })),
    });
  }
  createCheckoutSession(customer: { name: string; phone: string; email: string; address?: string }, lines: CartLine[]) {
    return this.http.post<{ url: string }>(`${API}/payments/create-checkout-session`, {
      customer, items: lines.map(l => ({ itemId: l.itemId, quantity: l.quantity })),
    });
  }
}
