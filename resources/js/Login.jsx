import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Title, Text, Button } from '@tremor/react';
import { User, Lock, ArrowRight, Droplets, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setCredentials(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API delay for effect
        await new Promise(resolve => setTimeout(resolve, 800));

        // Submit form programmatically to handle PHP Auth scaffolding
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/PETRODIESEL2/public/login'; // Adjust based on Laravel/PHP route
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const hiddenToken = document.createElement('input');
            hiddenToken.type = 'hidden';
            hiddenToken.name = '_token';
            hiddenToken.value = csrfToken;
            form.appendChild(hiddenToken);
        }

        ['email', 'password'].forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field;
            input.value = credentials[field];
            form.appendChild(input);
        });

        if (credentials.remember) {
            const remember = document.createElement('input');
            remember.type = 'hidden';
            remember.name = 'remember';
            remember.value = 'on';
            form.appendChild(remember);
        }

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px] ring-1 ring-slate-100"
            >
                {/* Right: Login Form */}
                <div className="p-12 lg:p-20 flex flex-col justify-center order-2 lg:order-1">
                    <div className="mb-12">
                        <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-navy-900/20 rotate-3">
                            <Droplets className="w-8 h-8 text-emerald-400" />
                        </div>
                        <Title className="text-4xl font-black text-navy-900 mb-3 font-cairo">أهلاً بك مجدداً</Title>
                        <Text className="text-slate-500 text-lg">سجل الدخول للمتابعة إلى لوحة التحكم</Text>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                            <div className="relative group">
                                <User className="absolute right-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
                                <input 
                                    type="email" 
                                    name="email"
                                    required
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-navy-900"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold text-slate-700">كلمة المرور</label>
                                <a href="#" className="text-sm font-bold text-emerald-600 hover:underline">نسيت كلمة المرور؟</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute right-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
                                <input 
                                    type="password" 
                                    name="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-navy-900"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                id="remember"
                                name="remember"
                                checked={credentials.remember}
                                onChange={handleChange}
                                className="w-5 h-5 text-emerald-600 rounded-lg border-slate-300 focus:ring-emerald-500"
                            />
                            <label htmlFor="remember" className="text-sm font-bold text-slate-600 cursor-pointer">تذكرني على هذا الجهاز</label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-2xl shadow-xl shadow-navy-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            ) : (
                                <>
                                    <span>تسجيل الدخول</span>
                                    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <Text className="text-slate-500">
                             تواجه مشكلة في الدخول؟ <a href="#" className="font-bold text-navy-900 hover:underline">اتصل بالدعم الفني</a>
                        </Text>
                    </div>
                </div>

                {/* Left: Brand / Visual (Hidden on Mobile) */}
                <div className="bg-navy-900 relative hidden lg:flex flex-col items-center justify-center p-20 text-center order-1 lg:order-2 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 z-10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -ml-20 -mb-20"></div>
                    
                    <div className="relative z-20">
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl mx-auto mb-8 ring-1 ring-white/20 flex items-center justify-center shadow-2xl"
                        >
                            <ShieldCheck className="w-16 h-16 text-emerald-400" />
                        </motion.div>
                        
                        <h2 className="text-4xl font-bold text-white mb-6 font-cairo">نظام بتروديزل لإدارة الموارد</h2>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-sm mx-auto">
                            الجيل الجديد من أنظمة إدارة محطات الوقود. تحكم شامل، تقارير دقيقة، وأداء فائق السرعة.
                        </p>

                        <div className="mt-12 flex justify-center gap-4">
                            <div className="px-4 py-2 bg-white/5 rounded-full backdrop-blur text-xs font-mono text-emerald-300 border border-white/10">v2.5.0 Stable</div>
                            <div className="px-4 py-2 bg-white/5 rounded-full backdrop-blur text-xs font-mono text-blue-300 border border-white/10">Secure SSL</div>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
    );
}
