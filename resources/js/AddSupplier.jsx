import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, Title, Text } from "@tremor/react";
import {
  Truck,
  Phone,
  User,
  Save,
  MapPin,
  Building2,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

export default function AddSupplier() {
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    address: "",
    initial_balance: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    Object.keys(formData).forEach((key) => form.append(key, formData[key]));

    try {
      const response = await fetch(
        "/PETRODIESEL2/public/suppliers/api_create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();

      if (data.success) {
        toast.success("تمت إضافة المورد بنجاح");
        setTimeout(
          () => (window.location.href = "/PETRODIESEL2/public/suppliers"),
          1000,
        );
      } else {
        toast.error(data.message || "حدث خطأ أثناء الحفظ");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-12 gap-6 p-6 h-full max-w-[1800px] mx-auto"
    >
      {/* Left: Identity & Preview */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-8 h-fit">
        <Card className="bg-navy-900 border-none shadow-2xl relative overflow-hidden p-8 flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-white/5">
            <Truck className="w-12 h-12 text-emerald-400" />
          </div>
          <Title className="text-3xl text-white mb-2 font-bold font-cairo">
            {formData.name || "مورد جديد"}
          </Title>
          <Text className="text-blue-200 mb-6">شريك توريد استراتيجي</Text>

          <div className="w-full bg-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <User className="w-4 h-4 text-emerald-500" />
              <span>{formData.contact_person || "---"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span dir="ltr">{formData.phone || "---"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>{formData.address || "---"}</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none text-white shadow-lg">
          <Title className="text-white text-lg font-bold mb-2 flex items-center gap-2">
            <Wallet className="w-5 h-5" /> الرصيد الافتتاحي
          </Title>
          <div className="text-4xl font-black font-mono tracking-tighter">
            {formData.initial_balance
              ? Number(formData.initial_balance).toLocaleString()
              : "0.00"}
            <span className="text-lg font-normal ml-2 opacity-80">SDG</span>
          </div>
          <Text className="text-emerald-100 text-xs mt-2">
            {Number(formData.initial_balance) < 0
              ? "مبلغ مستحق علينا (مديونية)"
              : "مبلغ مدفوع مقدماً (رصيد لنا)"}
          </Text>
        </Card>
      </div>

      {/* Right: Form */}
      <div className="col-span-12 lg:col-span-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card className="bg-white ring-1 ring-slate-100 shadow-lg p-8">
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-50">
              <div>
                <Title className="text-navy-900 font-bold text-2xl">
                  تسجيل مورد جديد
                </Title>
                <Text className="text-slate-500">
                  إضافة بيانات شركات التوريد والخدمات اللوجستية
                </Text>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <div className="space-y-8">
              {/* Company Info */}
              <div className="space-y-4">
                <Title className="text-base text-navy-900 border-l-4 border-emerald-500 pl-3">
                  بيانات المنشأة
                </Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      اسم الشركة / المورد
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="مثال: شركة النفط الوطنية المحدودة"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      العنوان
                    </label>
                    <div className="relative">
                      <MapPin className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all"
                        placeholder="المدينة، الحي..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      الرصيد الافتتاحي
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="initial_balance"
                      value={formData.initial_balance}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all font-mono font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Contact Person */}
              <div className="space-y-4">
                <Title className="text-base text-navy-900 border-l-4 border-blue-500 pl-3">
                  مسؤول التواصل
                </Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      الاسم
                    </label>
                    <div className="relative">
                      <User className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                        placeholder="اسم مندوب المبيعات"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      رقم الهاتف / الجوال
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-mono"
                        placeholder="05xxxxxxx"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end gap-4">
              <button
                type="button"
                className="px-8 py-3.5 text-slate-500 hover:bg-slate-50 font-bold rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 bg-navy-900 text-white font-bold rounded-xl shadow-xl shadow-navy-900/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> حفظ المورد
              </button>
            </div>
          </Card>
        </form>
      </div>
    </motion.div>
  );
}
