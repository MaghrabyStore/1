# MAGHRABY STORE v10

## الجديد
- أزرار Facebook / Instagram / Telegram / Google Maps بشكل بطاقات احترافية.
- كل قسم (شغلنا / آخر العروض / آخر الإضافات) يدعم عدة صور.
- Drag & Drop لرفع عدة صور مرة واحدة.
- حذف كل صورة بشكل مستقل من لوحة المطور.
- الصور تحفظ في Supabase Storage وتظهر لكل الزوار.

## إعداد Supabase مرة واحدة
بعد رفع ملفات v10 على GitHub:
1. افتح Supabase > SQL Editor > New query.
2. انسخ كامل محتوى `supabase_setup.sql` واضغط Run.
3. لا تحذف Bucket `store-images`.
4. افتح `admin.html` وسجل دخول المطور.
