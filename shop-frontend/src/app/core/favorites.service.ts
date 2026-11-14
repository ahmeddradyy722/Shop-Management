import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private key = 'favorites';
  readonly ids = signal<string[]>(this.load());

  private load(): string[] {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch { return []; }
  }
  has(id: string) { return this.ids().includes(id); }
  toggle(id: string) {
    const v = this.has(id) ? this.ids().filter(x => x !== id) : [...this.ids(), id];
    this.ids.set(v);
    localStorage.setItem(this.key, JSON.stringify(v));
  }
}
