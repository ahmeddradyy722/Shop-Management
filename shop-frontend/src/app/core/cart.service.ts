import { Injectable, computed, inject, signal } from '@angular/core';
import { CartLine, Item, localizedItemName } from './models';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private language = inject(LanguageService);
  private key = 'cart';
  readonly lines = signal<CartLine[]>(this.load());
  readonly count = computed(() => this.lines().reduce((s, l) => s + l.quantity, 0));
  readonly total = computed(() => this.lines().reduce((s, l) => s + l.price * l.quantity, 0));

  private load(): CartLine[] {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch { return []; }
  }
  private save(v: CartLine[]) { this.lines.set(v); localStorage.setItem(this.key, JSON.stringify(v)); }

  add(item: Item, quantity = 1) {
    const cur = this.lines();
    const ex = cur.find(l => l.itemId === item._id);
    this.save(ex
      ? cur.map(l => l.itemId === item._id ? { ...l, quantity: l.quantity + quantity } : l)
      : [...cur, { itemId: item._id, name: localizedItemName(item, this.language.language()), price: item.price, quantity }]);
  }
  setQty(id: string, q: number) {
    const quantity = Math.max(1, Math.floor(Number(q) || 1));
    this.save(this.lines().map(l => l.itemId === id ? { ...l, quantity } : l));
  }
  remove(id: string) { this.save(this.lines().filter(l => l.itemId !== id)); }
  clear() { this.save([]); }
}
