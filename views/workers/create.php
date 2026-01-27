    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-100 mx-auto mt-10">
        <!-- Header -->
        <div class="bg-navy-900 p-6 text-center relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h1 class="text-2xl font-bold text-white relative z-10">موظف جديد</h1>
            <p class="text-slate-400 text-sm mt-1">إضافة موظف إلى طاقم المحطة</p>
        </div>

        <!-- Form -->
        <form action="<?= BASE_URL ?>/workers/store" method="POST" class="p-6 space-y-4">

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل</label>
                <input type="text" name="name" required
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="مثال: محمد أحمد">
            </div>

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input type="tel" name="phone"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="05xxxxxxxx">
            </div>

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">رقم الهوية / الإقامة</label>
                <input type="text" name="national_id"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="اختياري">
            </div>

            <div class="pt-4 flex gap-3">
                <button type="button" onclick="history.back()" class="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    إلغاء
                </button>
                <button type="submit" class="flex-[2] py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
                    حفظ الموظف
                </button>
            </div>
        </form>
    </div>

    <style>
        /* Kept styles if needed, but Tailwind is used */
    </style>