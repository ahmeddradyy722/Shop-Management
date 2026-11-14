import { Injectable, signal } from '@angular/core';

type Language = 'en' | 'ar';

const text: Record<string, { en: string; ar: string }> = {
  home: { en: 'Home', ar: 'الرئيسية' }, favorites: { en: 'Favorites', ar: 'المفضلة' },
  Drinks: { en: 'Drinks', ar: 'المشروبات' }, SNACKS: { en: 'SNACKS', ar: 'الوجبات الخفيفة' },
  bag: { en: 'Bag', ar: 'السلة' }, managerLogin: { en: 'Manager Login', ar: 'دخول المدير' },
  delivery: { en: 'Free delivery on orders over 500 EGP', ar: 'توصيل مجاني للطلبات فوق 500 جنيه' },
  phone: { en: 'Call us: 0100 000 0000', ar: 'اتصل بنا: 0100 000 0000' },
  shoppingDays: { en: 'BIG SHOPPING DAYS', ar: 'أيام التسوق الكبرى' },
  everything: { en: 'Everything you need.', ar: 'كل ما تحتاجه.' }, allPlace: { en: 'All in one place.', ar: 'في مكان واحد.' },
  heroText: { en: 'Find everyday favorites, fresh essentials and great deals curated just for you.', ar: 'اكتشف منتجاتك اليومية والعروض المميزة المختارة لك.' },
  shopNow: { en: 'Shop now', ar: 'تسوق الآن' }, shopCategory: { en: 'Shop by category', ar: 'تسوق حسب التصنيف' },
  allItems: { en: 'All items', ar: 'كل المنتجات' }, todayPicks: { en: "TODAY'S PICKS", ar: 'اختيارات اليوم' },
  freshFinds: { en: 'Fresh finds for you', ar: 'منتجات مختارة لك' }, search: { en: 'Search products...', ar: 'ابحث عن المنتجات...' },
  flashSale: { en: 'Flash sale', ar: 'عروض سريعة' }, limited: { en: 'Limited time deals', ar: 'عروض لفترة محدودة' },
  endsSoon: { en: 'Ends soon', ar: 'ينتهي قريبًا' }, addBag: { en: 'Add to bag', ar: 'أضف للسلة' },
  soldOut: { en: 'Sold out', ar: 'نفد المخزون' },
  cart: { en: 'Cart', ar: 'السلة' }, item: { en: 'Item', ar: 'المنتج' }, price: { en: 'Price', ar: 'السعر' },
  qty: { en: 'Qty', ar: 'الكمية' }, subtotal: { en: 'Subtotal', ar: 'الإجمالي الفرعي' }, remove: { en: 'Remove', ar: 'حذف' },
  total: { en: 'Total', ar: 'الإجمالي' }, clearCart: { en: 'Clear cart', ar: 'تفريغ السلة' }, buy: { en: 'Buy', ar: 'شراء' },
  emptyCart: { en: 'Your cart is empty.', ar: 'السلة فارغة.' }, browseItems: { en: 'Browse items', ar: 'تصفح المنتجات' },
  thankYou: { en: 'Thank you!', ar: 'شكرًا لك!' }, orderReceived: { en: 'Your order was received. We will contact you by phone to confirm and arrange delivery.', ar: 'تم استلام طلبك. سنتواصل معك هاتفيًا للتأكيد وترتيب التوصيل.' },
  backHome: { en: 'Back to home', ar: 'العودة للرئيسية' }, orderSummary: { en: 'Order summary', ar: 'ملخص الطلب' },
  yourDetails: { en: 'Your details', ar: 'بياناتك' }, name: { en: 'Name', ar: 'الاسم' }, address: { en: 'Address', ar: 'العنوان' },
  phoneOrder: { en: 'Payment and delivery are arranged by phone call.', ar: 'يتم تنسيق الدفع والتوصيل عبر الهاتف.' },
  stripeOrder: { en: 'You will be redirected to Stripe to pay securely.', ar: 'سيتم تحويلك إلى Stripe للدفع بشكل آمن.' },
  paymentCancelled: { en: 'Payment was cancelled. Your cart is still available.', ar: 'تم إلغاء الدفع. ما زالت منتجاتك في السلة.' },
  confirmOrder: { en: 'Confirm order', ar: 'تأكيد الطلب' },
  favoritesPage: { en: 'Favorites', ar: 'المفضلة' }, noFavorites: { en: 'No favorites yet.', ar: 'لا توجد منتجات مفضلة بعد.' },
  back: { en: 'Back', ar: 'رجوع' }, addCart: { en: 'Add to cart', ar: 'أضف للسلة' }, saved: { en: 'Saved', ar: 'محفوظ' },
  favorite: { en: 'Favorite', ar: 'المفضلة' }, goCart: { en: 'Go to cart', ar: 'اذهب للسلة' }, added: { en: 'Added to cart.', ar: 'تمت الإضافة إلى السلة.' },
  notFound: { en: 'Item not found.', ar: 'المنتج غير موجود.' }, loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  totalOrders: { en: 'Total orders', ar: 'إجمالي الطلبات' }, opened: { en: 'Opened', ar: 'مفتوح' }, closed: { en: 'Closed', ar: 'مغلق' },
  revenue: { en: 'Revenue', ar: 'الإيرادات' }, all: { en: 'All', ar: 'الكل' }, date: { en: 'Date', ar: 'التاريخ' },
  customer: { en: 'Customer', ar: 'العميل' }, status: { en: 'Status', ar: 'الحالة' }, details: { en: 'Details', ar: 'التفاصيل' }, noOrders: { en: 'No orders.', ar: 'لا توجد طلبات.' },
  newCategory: { en: 'New category', ar: 'تصنيف جديد' }, editCategory: { en: 'Edit category', ar: 'تعديل التصنيف' },
  description: { en: 'Description', ar: 'الوصف' }, descriptionEn: { en: 'Description (English)', ar: 'الوصف (الإنجليزية)' }, descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (العربية)' }, update: { en: 'Update', ar: 'تحديث' }, add: { en: 'Add', ar: 'إضافة' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (الإنجليزية)' }, nameAr: { en: 'Name (Arabic)', ar: 'الاسم (العربية)' },
  cancel: { en: 'Cancel', ar: 'إلغاء' }, delete: { en: 'Delete', ar: 'حذف' }, noCategories: { en: 'No categories.', ar: 'لا توجد تصنيفات.' },
  newItem: { en: 'New item', ar: 'منتج جديد' }, editItem: { en: 'Edit item', ar: 'تعديل المنتج' }, productImage: { en: 'Product image', ar: 'صورة المنتج' },
  selectCategory: { en: 'Select category', ar: 'اختر التصنيف' }, noItems: { en: 'No items.', ar: 'لا توجد منتجات.' }, quantity: { en: 'Quantity', ar: 'الكمية' },
  created: { en: 'Created', ar: 'تم الإنشاء' }, orderDetails: { en: 'Order details', ar: 'تفاصيل الطلب' }, managerNotes: { en: 'Manager notes', ar: 'ملاحظات المدير' },
  addNote: { en: 'Add note', ar: 'إضافة ملاحظة' }, saveChanges: { en: 'Save changes', ar: 'حفظ التغييرات' }, noNotes: { en: 'No notes yet.', ar: 'لا توجد ملاحظات بعد.' },
  legacyNote: { en: 'Old note', ar: 'ملاحظة قديمة' }, phoneLabel: { en: 'Phone', ar: 'الهاتف' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' }, orders: { en: 'Orders', ar: 'الطلبات' },
  items: { en: 'Items', ar: 'المنتجات' }, categories: { en: 'Categories', ar: 'التصنيفات' },
  viewShop: { en: 'View shop', ar: 'عرض المتجر' }, logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  privateAccess: { en: 'PRIVATE ACCESS', ar: 'دخول خاص' }, signIn: { en: 'Sign in to manage your shop.', ar: 'سجل الدخول لإدارة متجرك.' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' }, password: { en: 'Password', ar: 'كلمة المرور' },
  login: { en: 'Login', ar: 'دخول' }, signingIn: { en: 'Signing in...', ar: 'جاري تسجيل الدخول...' },
  requiredDetails: { en: 'Name, phone and email are required', ar: 'الاسم والهاتف والبريد الإلكتروني مطلوبة' },
  invalidEmail: { en: 'Enter a valid email address', ar: 'أدخل بريدًا إلكترونيًا صحيحًا' },
  emailWarning: { en: 'Order created, but the confirmation email could not be sent.', ar: 'تم إنشاء الطلب، لكن تعذر إرسال رسالة التأكيد.' },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<Language>((localStorage.getItem('language') as Language) || 'en');
  constructor() { this.applyDirection(); }
  get isArabic() { return this.language() === 'ar'; }
  t(key: string) { return text[key]?.[this.language()] ?? key; }
  category(name: string) {
    const value = name.toLowerCase();
    if (this.isArabic && value === 'drinks') return 'مشروبات';
    if (this.isArabic && value === 'snacks') return 'وجبات خفيفة';
    return name;
  }
  toggle() {
    const next = this.isArabic ? 'en' : 'ar';
    this.language.set(next);
    localStorage.setItem('language', next);
    this.applyDirection();
  }
  private applyDirection() {
    document.documentElement.lang = this.language();
    document.documentElement.dir = this.isArabic ? 'rtl' : 'ltr';
  }
}
