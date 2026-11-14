import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API } from './config';
import { Category, Item, Order } from './models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${API}/admin`;
  uploadImage(file: File) {
    const body = new FormData();
    body.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.base}/uploads/image`, body);
  }

  categories() { return this.http.get<Category[]>(`${API}/categories`); }
  createCategory(b: Partial<Category>) { return this.http.post<Category>(`${this.base}/categories`, b); }
  updateCategory(id: string, b: Partial<Category>) { return this.http.put<Category>(`${this.base}/categories/${id}`, b); }
  deleteCategory(id: string) { return this.http.delete<void>(`${this.base}/categories/${id}`); }

  items() { return this.http.get<Item[]>(`${this.base}/items`); }
  createItem(b: any) { return this.http.post<Item>(`${this.base}/items`, b); }
  updateItem(id: string, b: any) { return this.http.put<Item>(`${this.base}/items/${id}`, b); }
  deleteItem(id: string) { return this.http.delete<void>(`${this.base}/items/${id}`); }

  orders(status = '') {
    let p = new HttpParams();
    if (status) p = p.set('status', status);
    return this.http.get<Order[]>(`${this.base}/orders`, { params: p });
  }
  order(id: string) { return this.http.get<Order>(`${this.base}/orders/${id}`); }
  updateOrder(id: string, b: { status?: string; note?: string }) { return this.http.patch<Order>(`${this.base}/orders/${id}`, b); }
}
