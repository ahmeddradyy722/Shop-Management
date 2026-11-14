export interface Category { _id: string; name: string; nameEn?: string; nameAr?: string; description?: string; descriptionEn?: string; descriptionAr?: string; }
export interface Item { _id: string; name: string; nameEn?: string; nameAr?: string; description?: string | { en?: string; ar?: string }; descriptionEn?: string; descriptionAr?: string; imageUrl?: string; price: number; quantity?: number; inStock?: boolean; category: Category | string; }
export interface CartLine { itemId: string; name: string; price: number; quantity: number; }
export interface OrderItem { item: string; name: string; price: number; quantity: number; }
export interface Order {
  _id: string;
  customer: { name: string; phone: string; email?: string; address?: string };
  items: OrderItem[];
  totalPrice: number;
  status: 'opened' | 'closed';
  notes?: string;
  noteHistory?: { _id: string; text: string; createdAt: string }[];
  createdAt: string;
}
export const errMsg = (e: any): string => e?.error?.message ?? 'Something went wrong';
export const catName = (c: Category | string): string => (typeof c === 'string' ? '' : c?.name ?? '');
export const itemDescription = (item: Item, language: 'en' | 'ar'): string => {
  if (typeof item.description === 'object') return item.description[language] || item.description.en || item.description.ar || '';
  return language === 'ar' ? item.descriptionAr || item.description || '' : item.descriptionEn || item.description || '';
};
export const localizedItemName = (item: Item, language: 'en' | 'ar'): string =>
  language === 'ar' ? item.nameAr || item.nameEn || item.name : item.nameEn || item.nameAr || item.name;
export const localizedCategoryName = (category: Category, language: 'en' | 'ar'): string =>
  language === 'ar' ? category.nameAr || category.nameEn || category.name : category.nameEn || category.nameAr || category.name;
export const categoryDescription = (category: Category, language: 'en' | 'ar'): string =>
  language === 'ar' ? category.descriptionAr || category.descriptionEn || category.description || '' : category.descriptionEn || category.descriptionAr || category.description || '';
