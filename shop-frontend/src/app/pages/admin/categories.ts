import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { Category, errMsg } from '../../core/models';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-categories',
  imports: [FormsModule],
  template: `
    <h1>{{ lang.t('categories') }}</h1>
    <div class="card">
      <h3>{{ editId ? lang.t('editCategory') : lang.t('newCategory') }}</h3>
      <label>{{ lang.t('nameEn') }}</label><input [(ngModel)]="form.nameEn" />
      <label>{{ lang.t('nameAr') }}</label><input dir="rtl" [(ngModel)]="form.nameAr" />
      <label>{{ lang.t('descriptionEn') }}</label><input [(ngModel)]="form.descriptionEn" />
      <label>{{ lang.t('descriptionAr') }}</label><input dir="rtl" [(ngModel)]="form.descriptionAr" />
      @if (error()) { <p class="error">{{ error() }}</p> }
      <div class="row">
        <button class="primary" (click)="save()">{{ editId ? lang.t('update') : lang.t('add') }}</button>
        @if (editId) { <button (click)="reset()">{{ lang.t('cancel') }}</button> }
      </div>
    </div>
    <table>
      <thead><tr><th>{{ lang.t('name') }}</th><th>{{ lang.t('description') }}</th><th></th></tr></thead>
      <tbody>
        @for (c of cats(); track c._id) {
          <tr><td>{{ c.nameEn || c.name }}</td><td>{{ c.descriptionEn || c.description }}</td>
            <td class="row"><button (click)="edit(c)">{{ lang.t('update') }}</button><button class="danger" (click)="remove(c)">{{ lang.t('delete') }}</button></td></tr>
        } @empty { <tr><td colspan="3">{{ lang.t('noCategories') }}</td></tr> }
      </tbody>
    </table>`,
})
export class Categories implements OnInit {
  private api = inject(AdminService);
  cats = signal<Category[]>([]);
  error = signal('');
  editId = '';
  form = { name: '', nameEn: '', nameAr: '', description: '', descriptionEn: '', descriptionAr: '' };
  lang = inject(LanguageService);

  ngOnInit() { this.load(); }
  load() { this.api.categories().subscribe(c => this.cats.set(c)); }
  reset() { this.editId = ''; this.form = { name: '', nameEn: '', nameAr: '', description: '', descriptionEn: '', descriptionAr: '' }; this.error.set(''); }
  edit(c: Category) {
    this.editId = c._id;
    this.form = {
      name: c.name, nameEn: c.nameEn ?? c.name, nameAr: c.nameAr ?? c.name,
      description: c.description ?? '', descriptionEn: c.descriptionEn ?? c.description ?? '', descriptionAr: c.descriptionAr ?? c.description ?? '',
    };
  }
  save() {
    const req = this.editId ? this.api.updateCategory(this.editId, this.form) : this.api.createCategory(this.form);
    req.subscribe({ next: () => { this.reset(); this.load(); }, error: e => this.error.set(errMsg(e)) });
  }
  remove(c: Category) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    this.api.deleteCategory(c._id).subscribe({ next: () => this.load(), error: e => this.error.set(errMsg(e)) });
  }
}
