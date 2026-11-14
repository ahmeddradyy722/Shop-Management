import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AdminService } from '../../core/admin.service';
import { Category, Item, catName, errMsg } from '../../core/models';
import { LanguageService } from '../../core/language.service';

const empty = () => ({ name: '', nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', price: 0, quantity: 0, category: '' });

@Component({
  selector: 'app-items',
  imports: [FormsModule, DecimalPipe],
  template: `
    <h1>{{ lang.t('items') }}</h1>
    <div class="card">
      <h3>{{ editId ? lang.t('editItem') : lang.t('newItem') }}</h3>
      <label>{{ lang.t('nameEn') }}</label><input [(ngModel)]="form.nameEn" />
      <label>{{ lang.t('nameAr') }}</label><input dir="rtl" [(ngModel)]="form.nameAr" />
      <label>{{ lang.t('descriptionEn') }}</label><textarea [(ngModel)]="form.descriptionEn"></textarea>
      <label>{{ lang.t('descriptionAr') }}</label><textarea dir="rtl" [(ngModel)]="form.descriptionAr"></textarea>
      <label>{{ lang.t('productImage') }}</label>
      <input type="file" accept="image/*" (change)="selectImage($event)" />
      @if (preview()) { <img class="admin-preview" [src]="preview()" alt="Product preview" /> }
      <small class="muted">JPG, PNG or WebP up to 5MB.</small>
      <label>{{ lang.t('price') }}</label><input type="number" min="0" [(ngModel)]="form.price" />
      <label>{{ lang.t('quantity') }}</label><input type="number" min="0" [(ngModel)]="form.quantity" />
      <label>{{ lang.t('categories') }}</label>
      <select [(ngModel)]="form.category">
        <option value="" disabled>{{ lang.t('selectCategory') }}</option>
        @for (c of cats(); track c._id) { <option [value]="c._id">{{ c.nameEn || c.name }}</option> }
      </select>
      @if (error()) { <p class="error">{{ error() }}</p> }
      <div class="row">
        <button class="primary" (click)="save()">{{ editId ? lang.t('update') : lang.t('add') }}</button>
        @if (editId) { <button (click)="reset()">{{ lang.t('cancel') }}</button> }
      </div>
    </div>
    <table>
      <thead><tr><th>{{ lang.t('name') }}</th><th>{{ lang.t('categories') }}</th><th>{{ lang.t('price') }}</th><th>{{ lang.t('quantity') }}</th><th></th></tr></thead>
      <tbody>
        @for (i of items(); track i._id) {
          <tr><td>{{ i.name }}</td><td>{{ cat(i.category) }}</td><td>{{ i.price | number: '1.2-2' }}</td><td>{{ i.quantity }}</td>
            <td class="row"><button (click)="edit(i)">{{ lang.t('update') }}</button><button class="danger" (click)="remove(i)">{{ lang.t('delete') }}</button></td></tr>
        } @empty { <tr><td colspan="5">{{ lang.t('noItems') }}</td></tr> }
      </tbody>
    </table>`,
})
export class Items implements OnInit {
  private api = inject(AdminService);
  items = signal<Item[]>([]);
  cats = signal<Category[]>([]);
  error = signal('');
  editId = '';
  form = empty();
  selectedImage: File | null = null;
  preview = signal('');
  cat = catName;
  lang = inject(LanguageService);

  ngOnInit() { this.api.categories().subscribe(c => this.cats.set(c)); this.load(); }
  load() { this.api.items().subscribe(i => this.items.set(i)); }
  reset() { this.editId = ''; this.form = empty(); this.error.set(''); this.selectedImage = null; this.preview.set(''); }
  edit(i: Item) {
    this.editId = i._id;
    this.form = {
      name: i.name,
      nameEn: i.nameEn ?? i.name,
      nameAr: i.nameAr ?? i.name,
      descriptionEn: i.descriptionEn ?? (typeof i.description === 'string' ? i.description : i.description?.en ?? ''),
      descriptionAr: i.descriptionAr ?? (typeof i.description === 'string' ? i.description : i.description?.ar ?? ''),
      price: i.price,
      quantity: i.quantity ?? 0,
      category: typeof i.category === 'string' ? i.category : i.category._id,
    };
    this.selectedImage = null;
    this.preview.set(i.imageUrl ?? '');
  }
  selectImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedImage = file;
    if (file) this.preview.set(URL.createObjectURL(file));
  }
  save() {
    const saveItem = (imageUrl?: string) => {
      const body = imageUrl ? { ...this.form, imageUrl } : this.form;
      const req = this.editId ? this.api.updateItem(this.editId, body) : this.api.createItem(body);
      req.subscribe({ next: () => { this.reset(); this.load(); }, error: e => this.error.set(errMsg(e)) });
    };
    if (this.selectedImage) {
      this.api.uploadImage(this.selectedImage).subscribe({
        next: result => saveItem(result.imageUrl),
        error: e => this.error.set(errMsg(e)),
      });
    } else saveItem();
  }
  remove(i: Item) {
    if (!confirm(`Delete "${i.name}"?`)) return;
    this.api.deleteItem(i._id).subscribe({ next: () => this.load(), error: e => this.error.set(errMsg(e)) });
  }
}
