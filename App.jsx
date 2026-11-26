import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Store, LayoutDashboard, ShoppingCart, Package, ClipboardList, Settings,
  ScanLine, QrCode, Plus, Minus, Trash2, Search, CheckCircle2, AlertTriangle,
  Lock, Eye, EyeOff, Upload, Copy, Check, Printer, Bluetooth, LogOut,
  Users, Wallet, BookOpen, ShieldCheck, Crown, X, ArrowRight, RefreshCw
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const sanitize = (str = '') => String(str).replace(/<[^>]*>?/gm, '').trim();
const php = (n = 0) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PLANS = [
  { id: 'free', name: 'Free Starter', monthly: 0, annual: 0, maxSkus: 30, desc: 'Solo sellers starting out', features: ['Up to 30 Products/SKUs', 'POS Checkout & QR Scan', 'Basic QR Payment Display', 'Watermarked Digital Receipt'] },
  { id: 'lite', name: 'Negosyo Lite', monthly: 199, annual: 1990, maxSkus: 300, desc: 'Sari-sari stores & stalls', features: ['Up to 300 Products/SKUs', 'Customer Utang Ledger', 'Expense & Net Profit Tracker', 'Unbranded Thermal & BT Print'] },
  { id: 'pro', name: 'Pro Seller', monthly: 499, annual: 4990, maxSkus: 999999, popular: true, desc: 'Shops with staff & online sync', features: ['Unlimited Products/SKUs', 'Up to 5 Staff/Cashier Logins', 'Shift Z-Reading & Audit Log', 'Shopee/Lazada/TikTok SKU Sync'] },
  { id: 'branch', name: 'Multi-Branch', monthly: 999, annual: 9990, maxSkus: 999999, desc: '2+ branches or warehouses', features: ['Up to 3 Branches/Warehouses', 'Up to 15 Staff/Cashier Logins', 'Consolidated Profit Reports', 'Priority Support'] }
];

const ADDONS = [
  { id: 'addon_branch', name: 'Extra Branch / Warehouse', price: 250, cycle: 'monthly' },
  { id: 'addon_staff', name: 'Extra 5 Staff Logins', price: 150, cycle: 'monthly' },
  { id: 'addon_upload', name: 'Done-For-You Product Upload', price: 500, cycle: 'onetime' }
];

function PasswordInput({ label, value, onChange, placeholder = 'Max 8 chars (1 Caps, 1 Symbol)' }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          maxLength={8}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-teal-700"
        />
        {(focused || value.length > 0) && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-teal-700"
            aria-label="Toggle password visibility"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
function AuthFlow({ onAuthenticated, initialUser }) {
  const [mode, setMode] = useState(initialUser ? 'onboarding' : 'login'); // login | signup | otp | onboarding
  const [method, setMethod] = useState('email'); // email | phone
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [shopName, setShopName] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const validatePassword = (pw) => {
    if (pw.length < 4 || pw.length > 8) return 'Password must be 4 to 8 characters.';
    if (!/[A-Z]/.test(pw)) return 'Password needs at least 1 UPPERCASE letter.';
    if (!/[^a-zA-Z0-9]/.test(pw)) return 'Password needs at least 1 special character.';
    return '';
  };

  const handleOAuth = async (provider) => {
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    });
    if (err) setError(err.message);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: sanitize(email),
      password
    });
    setLoading(false);
    if (err) return setError(err.message);
    if (data?.user) onAuthenticated(data.user);
  };

  const handleStartSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (cooldown > 0) return setError(`Please wait ${cooldown}s before requesting another code.`);
    setLoading(true);
    if (method === 'phone') {
      if (!/^9\d{9}$/.test(phoneDigits)) {
        setLoading(false);
        return setError('Enter 10 digits starting with 9 (e.g., 9163498336).');
      }
      const fullPhone = `+63${phoneDigits}`;
      const { error: err } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      setLoading(false);
      if (err) return setError(err.message);
      setNotice(`6-digit SMS code sent to ${fullPhone}`);
      setCooldown(60);
      setMode('otp');
    } else {
      const cleanEmail = sanitize(email).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
        setLoading(false);
        return setError('Please enter a legitimate email address.');
      }
      const { error: err } = await supabase.auth.signInWithOtp({ email: cleanEmail });
      setLoading(false);
      if (err) return setError(err.message);
      setNotice(`Welcome to A's Negosyo POS! 6-digit verification code sent to ${cleanEmail}`);
      setCooldown(60);
      setMode('otp');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) return setError('Enter the 6-digit verification code.');
    setLoading(true);
    const payload = method === 'phone'
      ? { phone: `+63${phoneDigits}`, token: otp, type: 'sms' }
      : { email: sanitize(email).toLowerCase(), token: otp, type: 'email' };
    const { data, error: err } = await supabase.auth.verifyOtp(payload);
    setLoading(false);
    if (err || !data?.user) {
      setOtp('');
      setMode('signup');
      return setError('Incorrect verification code. For security, please restart your registration.');
    }
    setMode('onboarding');
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    setError('');
    const cleanUser = sanitize(username);
    const cleanShop = sanitize(shopName);
    if (!/^[a-zA-Z0-9]{1,8}$/.test(cleanUser)) {
      return setError('Username must be 1-8 letters/numbers only (no spaces or special characters).');
    }
    if (!cleanShop || cleanShop.length > 30) {
      return setError('Shop Name is required (maximum 30 characters).');
    }
    const pwErr = validatePassword(password);
    if (pwErr) return setError(pwErr);
    if (password !== confirmPassword) return setError('Password and Confirm Password do not match.');

    setLoading(true);
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', cleanUser).maybeSingle();
    if (existing) {
      setLoading(false);
      return setError('That username is already locked by another account. Choose another.');
    }

    const { data: authData, error: pwUpdateErr } = await supabase.auth.updateUser({ password });
    if (pwUpdateErr) {
      setLoading(false);
      return setError(pwUpdateErr.message);
    }

    const user = authData.user;
    const { data: storeRow, error: storeErr } = await supabase
      .from('stores')
      .insert({ owner_id: user.id, name: cleanShop })
      .select()
      .single();
    if (storeErr) {
      setLoading(false);
      return setError(storeErr.message);
    }

    const { error: profErr } = await supabase.from('profiles').insert({
      id: user.id,
      username: cleanUser,
      email: user.email || null,
      phone: method === 'phone' ? `+63${phoneDigits}` : null,
      role: 'owner',
      store_id: storeRow.id
    });
    setLoading(false);
    if (profErr) return setError(profErr.message);
    onAuthenticated(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">A's Negosyo POS</h1>
            <p className="text-xs text-slate-500">Omnichannel POS & Inventory for PH Sellers</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
        {notice && <div className="mb-4 p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800">{notice}</div>}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@email.com" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm" />
            </div>
            <PasswordInput label="Password" value={password} onChange={setPassword} placeholder="Enter password" />
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm">
              {loading ? 'Signing in...' : 'Log In'}
            </button>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="button" onClick={() => handleOAuth('google')} className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">Continue with Google</button>
              <button type="button" onClick={() => handleOAuth('apple')} className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">Continue with Apple ID</button>
            </div>
            <p className="text-center text-xs text-slate-600 pt-2">
              New seller? <button type="button" onClick={() => { setError(''); setMode('signup'); }} className="text-teal-700 font-bold">Create Account</button>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleStartSignup} className="space-y-3">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button type="button" onClick={() => setMethod('email')} className={`py-1.5 text-xs font-semibold rounded-md ${method === 'email' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'}`}>Use Other Email</button>
              <button type="button" onClick={() => setMethod('phone')} className={`py-1.5 text-xs font-semibold rounded-md ${method === 'phone' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'}`}>Phone (+63)</button>
            </div>
            {method === 'phone' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Philippine Mobile Number</label>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-sm font-bold text-slate-700">+63</span>
                  <input type="tel" maxLength={10} required value={phoneDigits} onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))} placeholder="9163498336" className="w-full px-3 py-2.5 rounded-r-lg border border-slate-300 text-sm" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Legitimate Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm" />
              </div>
            )}
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm">
              {loading ? 'Sending code...' : 'Send 6-Digit Verification Code'}
            </button>
            <p className="text-center text-xs text-slate-600 pt-2">
              Already registered? <button type="button" onClick={() => { setError(''); setNotice(''); setMode('login'); }} className="text-teal-700 font-bold">Log In</button>
            </p>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-center text-lg tracking-[0.5em] font-bold"
              />
            </div>
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={() => handleStartSignup({ preventDefault: () => {} })}
                className="text-teal-700 font-bold disabled:text-slate-400"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
              <button type="button" onClick={() => { setOtp(''); setNotice(''); setMode('signup'); }} className="text-slate-600 font-semibold">
                Change {method === 'phone' ? 'number' : 'email'}
              </button>
            </div>
          </form>
        )}

        {mode === 'onboarding' && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Your username is permanent. Once created, it is locked and cannot be changed.</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username (max 8 letters/numbers)</label>
              <input
                type="text"
                maxLength={8}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="aling123"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Name ({shopName.length}/30)</label>
              <input
                type="text"
                maxLength={30}
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Aling Nena's Store"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <PasswordInput label="Create Password" value={password} onChange={setPassword} />
            <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" />
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2">
              {loading ? 'Creating your shop...' : (<>Create My Shop <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [platform, setPlatform] = useState({ admin_qr_url: '', maya_number: '+639692692760', account_initials: 'R A B' });
  const [tab, setTab] = useState('pos');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [utang, setUtang] = useState([]);
  const [payments, setPayments] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [payRef, setPayRef] = useState('');
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [subRef, setSubRef] = useState('');
  const [subProofFile, setSubProofFile] = useState(null);
  const [copiedNum, setCopiedNum] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [newProd, setNewProd] = useState({ sku: '', name: '', price: '', cost: '', stock: '', shopee_sku: '', lazada_sku: '', tiktok_sku: '' });
  const [toast, setToast] = useState('');
  const [loadingInit, setLoadingInit] = useState(true);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Only JPG, PNG, or WEBP images allowed.';
    if (file.size > 2 * 1024 * 1024) return 'Maximum file size is 2MB.';
    return '';
  };

  const uploadImage = async (bucket, file) => {
    const err = validateFile(file);
    if (err) { notify(err); return null; }
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) { notify(error.message); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const loadWorkspace = async (authUser) => {
    setUser(authUser);
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    if (!prof) { setLoadingInit(false); return; }
    setProfile(prof);

    const { data: st } = await supabase.from('stores').select('*').eq('id', prof.store_id).maybeSingle();
    if (st) {
      await supabase.rpc('check_plan_expiry', { sid: st.id });
      const { data: freshSt } = await supabase.from('stores').select('*').eq('id', st.id).single();
      setStore(freshSt || st);
      const [{ data: p }, { data: o }, { data: e }, { data: u }] = await Promise.all([
        supabase.from('products').select('*').eq('store_id', st.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('store_id', st.id).order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').eq('store_id', st.id).order('created_at', { ascending: false }),
        supabase.from('utang_ledger').select('*').eq('store_id', st.id).order('created_at', { ascending: false })
      ]);
      setProducts(p || []); setOrders(o || []); setExpenses(e || []); setUtang(u || []);
    }

    const { data: plat } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle();
    if (plat) setPlatform(plat);

    if (prof.role === 'super_admin') {
      const [{ data: pays }, { data: sts }] = await Promise.all([
        supabase.from('subscription_payments').select('*').order('created_at', { ascending: false }),
        supabase.from('stores').select('*').order('created_at', { ascending: false })
      ]);
      setPayments(pays || []); setAllStores(sts || []);
    }
    setLoadingInit(false);
  };

  useEffect(() => {
    if (!supabase) { setLoadingInit(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) loadWorkspace(data.session.user);
      else setLoadingInit(false);
    });
  }, []);

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-red-200 rounded-xl p-5 text-sm text-slate-700">
          <p className="font-bold text-red-700 mb-1">Missing Supabase Environment Variables</p>
          <p>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel Project Settings.</p>
        </div>
      </div>
    );
  }

  if (loadingInit) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600">Loading A's Negosyo POS...</div>;
  if (!user || !profile || !store) return <AuthFlow onAuthenticated={loadWorkspace} initialUser={user && !profile ? user : null} />;

  const isCashier = profile.role === 'cashier';
  const isPaid = store.plan !== 'free';
  const currentPlanObj = PLANS.find((p) => p.id === store.plan) || PLANS[0];
  const accent = store.accent_color || '#0F766E';
  const requirePaid = (minPlan = 'lite') => {
    const rank = { free: 0, lite: 1, pro: 2, branch: 3 };
    if (rank[store.plan] < rank[minPlan]) { setUpgradeModal(true); return false; }
    return true;
  };

  const addToCart = (prod) => {
    if (prod.stock <= 0) return notify('Out of stock.');
    setCart((prev) => {
      const found = prev.find((i) => i.id === prod.id);
      if (found) return prev.map((i) => i.id === prod.id ? { ...i, qty: Math.min(prod.stock, i.qty + 1) } : i);
      return [...prev, { ...prod, qty: 1 }];
    });
  };

  const handleScanSku = (e) => {
    e.preventDefault();
    const code = sanitize(scanInput).toLowerCase();
    const match = products.find((p) => p.sku.toLowerCase() === code || p.shopee_sku?.toLowerCase() === code);
    if (match) { addToCart(match); notify(`Added ${match.name}`); }
    else notify('SKU not found in inventory.');
    setScanInput('');
  };

  const cartTotal = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const cartCogs = cart.reduce((s, i) => s + Number(i.cost || 0) * i.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (payMethod !== 'Cash' && !sanitize(payRef)) return notify('Enter customer payment reference number.');
    const change = payMethod === 'Cash' ? Math.max(0, Number(cashTendered || 0) - cartTotal) : 0;
    const { data: created, error } = await supabase.from('orders').insert({
      store_id: store.id,
      items: cart.map(({ id, sku, name, price, cost, qty }) => ({ id, sku, name, price, cost, qty })),
      subtotal: cartTotal,
      total: cartTotal,
      cogs: cartCogs,
      payment_method: payMethod,
      payment_ref: sanitize(payRef),
      cash_change: change,
      status: 'Completed',
      created_by: user.id
    }).select().single();
    if (error) return notify(error.message);

    for (const item of cart) {
      await supabase.from('products').update({ stock: Math.max(0, item.stock - item.qty) }).eq('id', item.id);
    }
    setCart([]); setCashTendered(''); setPayRef('');
    setReceiptOrder(created);
    loadWorkspace(user);
  };

  const handleBluetoothPrint = async (ord) => {
    if (!requirePaid('lite')) return;
    if (!navigator.bluetooth) return notify('Web Bluetooth requires Android/Desktop Chrome.');
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const char = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      const lines = `\x1B\x40${store.name}\n${store.address}\nOrder #${ord.order_number}\nTotal: PHP ${ord.total}\n${store.receipt_footer}\n\n\n`;
      await char.writeValue(new TextEncoder().encode(lines));
      notify('Printed via Bluetooth thermal printer.');
    } catch {
      notify('Bluetooth printer cancelled or unsupported. Use Standard Print.');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (products.length >= currentPlanObj.maxSkus) return setUpgradeModal(true);
    const { error } = await supabase.from('products').insert({
      store_id: store.id,
      sku: sanitize(newProd.sku),
      name: sanitize(newProd.name),
      price: Number(newProd.price || 0),
      cost: Number(newProd.cost || 0),
      stock: Number(newProd.stock || 0),
      shopee_sku: sanitize(newProd.shopee_sku),
      lazada_sku: sanitize(newProd.lazada_sku),
      tiktok_sku: sanitize(newProd.tiktok_sku)
    });
    if (error) return notify(error.message);
    setNewProd({ sku: '', name: '', price: '', cost: '', stock: '', shopee_sku: '', lazada_sku: '', tiktok_sku: '' });
    notify('Product saved to Master Inventory.');
    loadWorkspace(user);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (isCashier) return notify('Only the Owner can delete products.');
    if (!window.confirm(`Delete "${productName}" from Master Inventory? This cannot be undone.`)) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', store.id);
    if (error) return notify(error.message);
    notify(`${productName} deleted from Master Inventory.`);
    loadWorkspace(user);
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(platform.maya_number || '+639692692760');
      setCopiedNum(true);
      setTimeout(() => setCopiedNum(false), 2000);
    } catch {
      notify('Copy failed. Please copy the number manually.');
    }
  };

  const handleSubmitSubscription = async (e) => {
    e.preventDefault();
    if (!sanitize(subRef)) return notify('Enter your PalawanPay/Maya reference number.');
    const planObj = PLANS.find((p) => p.id === selectedPlan);
    const addonObj = ADDONS.find((a) => a.id === selectedPlan);
    if (!planObj && !addonObj) return notify('Select a plan or add-on.');
    const amount = planObj ? (billingCycle === 'annual' ? planObj.annual : planObj.monthly) : addonObj.price;
    const cycle = planObj ? billingCycle : addonObj.cycle;
    if (!amount || amount <= 0) return notify('Select a paid plan or add-on to continue.');

    let proofUrl = '';
    if (subProofFile) {
      proofUrl = await uploadImage('payment-proofs', subProofFile);
      if (!proofUrl) return;
    }

    const { error } = await supabase.from('subscription_payments').insert({
      store_id: store.id,
      item_id: selectedPlan,
      item_type: planObj ? 'plan' : 'addon',
      item_name: planObj ? planObj.name : addonObj.name,
      amount,
      billing_cycle: cycle,
      reference_number: sanitize(subRef),
      proof_url: proofUrl,
      status: 'Pending',
      submitted_by: user.id
    });
    if (error) return notify(error.message);
    setSubRef('');
    setSubProofFile(null);
    setUpgradeModal(false);
    notify('Payment submitted. The Super Admin will verify and activate your plan.');
    loadWorkspace(user);
  };

  const handleApprovePayment = async (pay) => {
    if (profile.role !== 'super_admin') return notify('Super Admin access only.');
    if (pay.status !== 'Pending') return;
    const planObj = PLANS.find((p) => p.id === pay.item_id);
    if (planObj) {
      const days = pay.billing_cycle === 'annual' ? 365 : 30;
      const expires = new Date(Date.now() + days * 86400000).toISOString();
      const { error: stErr } = await supabase
        .from('stores')
        .update({ plan: planObj.id, plan_expires_at: expires })
        .eq('id', pay.store_id);
      if (stErr) return notify(stErr.message);
    }
    const { error } = await supabase
      .from('subscription_payments')
      .update({ status: 'Approved', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq('id', pay.id);
    if (error) return notify(error.message);
    notify('Payment approved and plan activated.');
    loadWorkspace(user);
  };

  const handleRejectPayment = async (pay) => {
    if (profile.role !== 'super_admin') return notify('Super Admin access only.');
    if (pay.status !== 'Pending') return;
    if (!window.confirm('Reject this payment submission?')) return;
    const { error } = await supabase
      .from('subscription_payments')
      .update({ status: 'Rejected', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq('id', pay.id);
    if (error) return notify(error.message);
    notify('Payment rejected.');
    loadWorkspace(user);
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    if (isCashier) return notify('Only the Owner can change store settings.');
    const fd = new FormData(e.currentTarget);
    const name = sanitize(fd.get('name'));
    if (!name || name.length > 30) return notify('Shop Name is required (maximum 30 characters).');
    const updates = {
      name,
      address: sanitize(fd.get('address')),
      receipt_footer: sanitize(fd.get('receipt_footer')),
      paper_size: fd.get('paper_size') === '80mm' ? '80mm' : '58mm'
    };
    const qr = fd.get('qr');
    if (qr && qr.size > 0) {
      const url = await uploadImage('store-assets', qr);
      if (!url) return;
      updates.payment_qr_url = url;
    }
    const { error } = await supabase.from('stores').update(updates).eq('id', store.id);
    if (error) return notify(error.message);
    notify('Store settings updated.');
    loadWorkspace(user);
  };

  const handleUpdatePlatform = async (e) => {
    e.preventDefault();
    if (profile.role !== 'super_admin') return notify('Super Admin access only.');
    const fd = new FormData(e.currentTarget);
    const updates = {
      id: 1,
      maya_number: sanitize(fd.get('maya_number')) || '+639692692760',
      account_initials: sanitize(fd.get('account_initials')) || 'R A B',
      admin_qr_url: platform.admin_qr_url || ''
    };
    const qr = fd.get('qr');
    if (qr && qr.size > 0) {
      const url = await uploadImage('store-assets', qr);
      if (!url) return;
      updates.admin_qr_url = url;
    }
    const { error } = await supabase.from('platform_settings').upsert(updates);
    if (error) return notify(error.message);
    notify('Platform payment settings updated.');
    loadWorkspace(user);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!requirePaid('lite')) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const description = sanitize(fd.get('description'));
    const amount = Number(fd.get('amount') || 0);
    if (!description || amount <= 0) return notify('Enter an expense description and amount.');
    const { error } = await supabase.from('expenses').insert({
      store_id: store.id,
      description,
      amount,
      created_by: user.id
    });
    if (error) return notify(error.message);
    form.reset();
    notify('Expense recorded.');
    loadWorkspace(user);
  };

  const handleDeleteExpense = async (id) => {
    if (isCashier) return;
    if (!window.confirm('Delete this expense entry?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('store_id', store.id);
    if (error) return notify(error.message);
    loadWorkspace(user);
  };

  const handleAddUtang = async (e) => {
    e.preventDefault();
    if (!requirePaid('lite')) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const customer = sanitize(fd.get('customer'));
    const amount = Number(fd.get('amount') || 0);
    const note = sanitize(fd.get('note'));
    if (!customer || amount <= 0) return notify('Enter customer name and utang amount.');
    const { error } = await supabase.from('utang_ledger').insert({
      store_id: store.id,
      customer_name: customer,
      amount,
      note,
      status: 'Unpaid',
      created_by: user.id
    });
    if (error) return notify(error.message);
    form.reset();
    notify('Utang recorded.');
    loadWorkspace(user);
  };

  const handleSettleUtang = async (id) => {
    const { error } = await supabase
      .from('utang_ledger')
      .update({ status: 'Paid', paid_at: new Date().toISOString() })
      .eq('id', id)
      .eq('store_id', store.id);
    if (error) return notify(error.message);
    notify('Utang marked as paid.');
    loadWorkspace(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setStore(null);
    setProducts([]); setOrders([]); setExpenses([]); setUtang([]);
    setPayments([]); setAllStores([]); setCart([]); setTab('pos');
  };

  const isSuperAdmin = profile.role === 'super_admin';
  const paper = store.paper_size === '80mm' ? '80mm' : '58mm';
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const revenue = completedOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalCogs = completedOrders.reduce((s, o) => s + Number(o.cogs || 0), 0);
  const totalExpenses = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  const netProfit = revenue - totalCogs - totalExpenses;
  const utangOwed = utang.filter((u) => u.status !== 'Paid').reduce((s, u) => s + Number(u.amount || 0), 0);
  const lowStock = products.filter((p) => Number(p.stock) <= 5);
  const pendingPayments = payments.filter((p) => p.status === 'Pending');
  const q = sanitize(search).toLowerCase();
  const filteredProducts = products.filter((p) =>
    !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
  );

  const tabs = [
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    ...(!isCashier ? [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'settings', label: 'Settings', icon: Settings }
    ] : []),
    ...(isSuperAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : [])
  ];

  const cardCls = 'bg-white border border-slate-200 rounded-xl p-4';
  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:border-teal-700';
  const primaryBtn = 'px-4 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2';

  const statusBadge = (s) => {
    const map = { Approved: 'bg-teal-50 text-teal-800 border-teal-200', Rejected: 'bg-red-50 text-red-700 border-red-200', Pending: 'bg-amber-50 text-amber-800 border-amber-200' };
    return `inline-block px-2 py-0.5 rounded-full border text-[11px] font-semibold ${map[s] || map.Pending}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-white border-r border-slate-200 p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg text-white flex items-center justify-center" style={{ backgroundColor: accent }}>
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{store.name}</p>
            <p className="text-[11px] text-slate-500">{currentPlanObj.name}</p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${active ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </nav>
        {!isPaid && !isSuperAdmin && (
          <button onClick={() => setUpgradeModal(true)} className="mb-2 w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2">
            <Crown className="w-4 h-4" /> Upgrade Plan
          </button>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </aside>

      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0 md:hidden">
            <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center" style={{ backgroundColor: accent }}>
              <Store className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold truncate">{store.name}</p>
          </div>
          <h2 className="hidden md:block text-base font-bold text-slate-900 capitalize">{tab === 'pos' ? 'Point of Sale' : tab === 'inventory' ? 'Master Inventory' : tab}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => loadWorkspace(user)} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            {!isPaid && !isSuperAdmin && (
              <button onClick={() => setUpgradeModal(true)} className="md:hidden px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Upgrade
              </button>
            )}
            <button onClick={handleLogout} className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600" aria-label="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="p-4 max-w-6xl mx-auto">
          {/* ============ POS ============ */}
          {tab === 'pos' && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <form onSubmit={handleScanSku} className={`${cardCls} flex gap-2`}>
                  <div className="relative flex-1">
                    <ScanLine className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input value={scanInput} onChange={(e) => setScanInput(e.target.value)} placeholder="Scan or type SKU / Shopee SKU" className={`${inputCls} pl-9`} />
                  </div>
                  <button className={primaryBtn}>Add</button>
                </form>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products by name or SKU" className={`${inputCls} pl-9`} />
                </div>
                {filteredProducts.length === 0 ? (
                  <div className={`${cardCls} text-center text-sm text-slate-500`}>No products yet. Add items in Inventory.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className={`${cardCls} text-left hover:border-teal-700 disabled:opacity-50 disabled:hover:border-slate-200`}
                      >
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">{p.name}</p>
                        <p className="text-[11px] text-slate-500 mb-1">{p.sku}</p>
                        <p className="text-sm font-bold text-teal-700">{php(p.price)}</p>
                        <p className={`text-[11px] ${p.stock <= 5 ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                          {p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`${cardCls} h-fit space-y-3 lg:sticky lg:top-20`}>
                <h3 className="text-sm font-bold flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-teal-700" /> Current Order</h3>
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Cart is empty. Tap a product to add.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((i) => (
                      <div key={i.id} className="flex items-center gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{i.name}</p>
                          <p className="text-[11px] text-slate-500">{php(i.price)} each</p>
                        </div>
                        <button onClick={() => setCart((c) => c.map((x) => x.id === i.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="p-1 rounded border border-slate-300" aria-label="Decrease"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-6 text-center font-semibold">{i.qty}</span>
                        <button onClick={() => setCart((c) => c.map((x) => x.id === i.id ? { ...x, qty: Math.min(x.stock, x.qty + 1) } : x))} className="p-1 rounded border border-slate-300" aria-label="Increase"><Plus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setCart((c) => c.filter((x) => x.id !== i.id))} className="p-1 text-red-600" aria-label="Remove"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total</span>
                  <span className="text-lg font-bold text-teal-700">{php(cartTotal)}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className={inputCls}>
                    {['Cash', 'GCash', 'Maya', 'PalawanPay', 'Bank Transfer'].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                {payMethod === 'Cash' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cash Tendered</label>
                    <input type="number" min="0" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} placeholder="0.00" className={inputCls} />
                    <p className="text-xs text-slate-600 mt-1">Change: <span className="font-bold">{php(Math.max(0, Number(cashTendered || 0) - cartTotal))}</span></p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {store.payment_qr_url && (
                      <div className="text-center">
                        <img src={store.payment_qr_url} alt="Shop payment QR" className="w-40 h-40 object-contain mx-auto border border-slate-200 rounded-lg" />
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1"><QrCode className="w-3 h-3" /> Customer scans to pay</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Reference No.</label>
                      <input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Customer reference number" className={inputCls} />
                    </div>
                  </div>
                )}
                <button onClick={handleCheckout} disabled={cart.length === 0} className={`${primaryBtn} w-full disabled:opacity-50`}>
                  <CheckCircle2 className="w-4 h-4" /> Complete Sale
                </button>
              </div>
            </div>
          )}

          {/* ============ INVENTORY ============ */}
          {tab === 'inventory' && (
            <div className="space-y-4">
              <div className={`${cardCls} flex items-center justify-between`}>
                <div>
                  <p className="text-sm font-bold">Master Inventory</p>
                  <p className="text-xs text-slate-500">{products.length} of {currentPlanObj.maxSkus >= 999999 ? 'Unlimited' : currentPlanObj.maxSkus} SKUs used</p>
                </div>
                <Package className="w-5 h-5 text-teal-700" />
              </div>

              <form onSubmit={handleAddProduct} className={`${cardCls} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4 text-teal-700" /> Add Product</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input required value={newProd.sku} onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })} placeholder="SKU" className={inputCls} />
                  <input required value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} placeholder="Product name" className={`${inputCls} col-span-1 md:col-span-3`} />
                  <input required type="number" min="0" step="0.01" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} placeholder="Price" className={inputCls} />
                  <input type="number" min="0" step="0.01" value={newProd.cost} onChange={(e) => setNewProd({ ...newProd, cost: e.target.value })} placeholder="Cost" className={inputCls} />
                  <input required type="number" min="0" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} placeholder="Stock" className={inputCls} />
                  <input value={newProd.shopee_sku} onChange={(e) => setNewProd({ ...newProd, shopee_sku: e.target.value })} placeholder="Shopee SKU" className={inputCls} />
                  <input value={newProd.lazada_sku} onChange={(e) => setNewProd({ ...newProd, lazada_sku: e.target.value })} placeholder="Lazada SKU" className={inputCls} />
                  <input value={newProd.tiktok_sku} onChange={(e) => setNewProd({ ...newProd, tiktok_sku: e.target.value })} placeholder="TikTok SKU" className={inputCls} />
                </div>
                <button className={primaryBtn}><Plus className="w-4 h-4" /> Save Product</button>
              </form>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory" className={`${inputCls} pl-9`} />
              </div>

              {filteredProducts.length === 0 ? (
                <div className={`${cardCls} text-center text-sm text-slate-500`}>No products found.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className={`${cardCls} flex items-start gap-3`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-500">SKU: {p.sku}</p>
                        <div className="flex gap-3 mt-1 text-xs">
                          <span className="font-bold text-teal-700">{php(p.price)}</span>
                          <span className="text-slate-500">Cost {php(p.cost)}</span>
                        </div>
                        <p className={`text-xs mt-1 flex items-center gap-1 ${p.stock <= 5 ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
                          {p.stock <= 5 && <AlertTriangle className="w-3 h-3" />} Stock: {p.stock}
                        </p>
                        {(p.shopee_sku || p.lazada_sku || p.tiktok_sku) && (
                          <p className="text-[10px] text-slate-400 mt-1 truncate">
                            {[p.shopee_sku && `Shopee: ${p.shopee_sku}`, p.lazada_sku && `Lazada: ${p.lazada_sku}`, p.tiktok_sku && `TikTok: ${p.tiktok_sku}`].filter(Boolean).join(' | ')}
                          </p>
                        )}
                      </div>
                      {!isCashier && (
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600"
                          aria-label={`Delete ${p.name}`}
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ ORDERS ============ */}
          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className={`${cardCls} text-center text-sm text-slate-500`}>No orders yet.</div>
              ) : orders.map((o) => (
                <div key={o.id} className={`${cardCls} flex items-center gap-3`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">Order #{o.order_number ?? String(o.id).slice(0, 6)}</p>
                    <p className="text-[11px] text-slate-500">{new Date(o.created_at).toLocaleString('en-PH')} | {o.payment_method}{o.payment_ref ? ` | Ref ${o.payment_ref}` : ''}</p>
                    <p className="text-xs text-slate-600">{(o.items || []).reduce((s, i) => s + i.qty, 0)} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-teal-700">{php(o.total)}</p>
                    <span className={statusBadge(o.status === 'Completed' ? 'Approved' : 'Pending')}>{o.status}</span>
                  </div>
                  <button onClick={() => setReceiptOrder(o)} className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" aria-label="View receipt">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ============ DASHBOARD ============ */}
          {tab === 'dashboard' && !isCashier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Gross Sales', value: php(revenue), color: 'text-slate-900' },
                  { label: 'Cost of Goods', value: php(totalCogs), color: 'text-slate-900' },
                  { label: 'Expenses', value: php(totalExpenses), color: 'text-amber-600' },
                  { label: 'Net Profit', value: php(netProfit), color: netProfit >= 0 ? 'text-teal-700' : 'text-red-600' }
                ].map((c) => (
                  <div key={c.label} className={cardCls}>
                    <p className="text-[11px] text-slate-500 font-semibold">{c.label}</p>
                    <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={cardCls}>
                  <p className="text-[11px] text-slate-500 font-semibold">Orders Completed</p>
                  <p className="text-lg font-bold">{completedOrders.length}</p>
                </div>
                <div className={cardCls}>
                  <p className="text-[11px] text-slate-500 font-semibold">Utang Outstanding</p>
                  <p className="text-lg font-bold text-amber-600">{php(utangOwed)}</p>
                </div>
              </div>

              {lowStock.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Low Stock ({lowStock.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {lowStock.slice(0, 12).map((p) => (
                      <span key={p.id} className="px-2 py-1 rounded-md bg-white border border-amber-200 text-xs text-amber-800">{p.name}: {p.stock}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-4">
                {/* Expenses */}
                <div className={`${cardCls} space-y-3`}>
                  <h3 className="text-sm font-bold flex items-center gap-2"><Wallet className="w-4 h-4 text-teal-700" /> Expense Tracker</h3>
                  <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-2">
                    <input name="description" required placeholder="Expense (e.g., Electricity)" className={inputCls} />
                    <input name="amount" required type="number" min="0" step="0.01" placeholder="Amount" className={`${inputCls} sm:w-32`} />
                    <button className={primaryBtn}><Plus className="w-4 h-4" /> Add</button>
                  </form>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {expenses.length === 0 && <p className="text-xs text-slate-500 text-center py-3">No expenses recorded.</p>}
                    {expenses.map((x) => (
                      <div key={x.id} className="flex items-center gap-2 text-sm border-b border-slate-100 pb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{x.description}</p>
                          <p className="text-[11px] text-slate-500">{new Date(x.created_at).toLocaleDateString('en-PH')}</p>
                        </div>
                        <span className="font-bold text-amber-600">{php(x.amount)}</span>
                        <button onClick={() => handleDeleteExpense(x.id)} className="p-1.5 text-red-600" aria-label="Delete expense"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utang */}
                <div className={`${cardCls} space-y-3`}>
                  <h3 className="text-sm font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-teal-700" /> Customer Utang Ledger</h3>
                  <form onSubmit={handleAddUtang} className="grid grid-cols-2 gap-2">
                    <input name="customer" required placeholder="Customer name" className={inputCls} />
                    <input name="amount" required type="number" min="0" step="0.01" placeholder="Amount" className={inputCls} />
                    <input name="note" placeholder="Note (optional)" className={`${inputCls} col-span-2 sm:col-span-1`} />
                    <button className={`${primaryBtn} col-span-2 sm:col-span-1`}><Plus className="w-4 h-4" /> Record Utang</button>
                  </form>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {utang.length === 0 && <p className="text-xs text-slate-500 text-center py-3">No utang records.</p>}
                    {utang.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 text-sm border-b border-slate-100 pb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{u.customer_name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{u.note || new Date(u.created_at).toLocaleDateString('en-PH')}</p>
                        </div>
                        <span className={`font-bold ${u.status === 'Paid' ? 'text-slate-400 line-through' : 'text-amber-600'}`}>{php(u.amount)}</span>
                        {u.status !== 'Paid' ? (
                          <button onClick={() => handleSettleUtang(u.id)} className="px-2 py-1 rounded-md bg-teal-700 text-white text-[11px] font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Paid</button>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-teal-700" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ SETTINGS ============ */}
          {tab === 'settings' && !isCashier && (
            <div className="grid lg:grid-cols-3 gap-4">
              <form onSubmit={handleUpdateStore} className={`${cardCls} lg:col-span-2 space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-teal-700" /> Store Settings</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username (locked)</label>
                  <div className="relative">
                    <input value={profile.username || ''} disabled className={`${inputCls} bg-slate-100 text-slate-500 pr-9`} />
                    <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Name (max 30 characters)</label>
                  <input name="name" required maxLength={30} defaultValue={store.name} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input name="address" defaultValue={store.address || ''} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Footer</label>
                  <input name="receipt_footer" defaultValue={store.receipt_footer || 'Thank you for shopping!'} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thermal Paper Size</label>
                  <select name="paper_size" defaultValue={paper} className={inputCls}>
                    <option value="58mm">58mm (small thermal)</option>
                    <option value="80mm">80mm (standard thermal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Payment QR (JPG/PNG/WEBP, max 2MB)</label>
                  <input name="qr" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-800 file:font-semibold" />
                  {store.payment_qr_url && <img src={store.payment_qr_url} alt="Current payment QR" className="w-24 h-24 object-contain mt-2 border border-slate-200 rounded-lg" />}
                </div>
                <button className={primaryBtn}><Upload className="w-4 h-4" /> Save Settings</button>
              </form>

              <div className="space-y-4">
                <div className={`${cardCls} space-y-2`}>
                  <h3 className="text-sm font-bold flex items-center gap-2"><Crown className="w-4 h-4 text-amber-600" /> Current Plan</h3>
                  <p className="text-lg font-bold text-teal-700">{currentPlanObj.name}</p>
                  <p className="text-xs text-slate-600">{currentPlanObj.desc}</p>
                  {store.plan_expires_at && isPaid && (
                    <p className="text-xs text-slate-500">Valid until {new Date(store.plan_expires_at).toLocaleDateString('en-PH')}</p>
                  )}
                  <button onClick={() => setUpgradeModal(true)} className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4" /> {isPaid ? 'Renew / Add-ons' : 'Upgrade Plan'}
                  </button>
                </div>
                <div className={`${cardCls} space-y-2`}>
                  <h3 className="text-sm font-bold flex items-center gap-2"><Bluetooth className="w-4 h-4 text-teal-700" /> Printing</h3>
                  <p className="text-xs text-slate-600">Standard print uses {paper} thermal sizing. Bluetooth printing needs Android or Desktop Chrome and a paid plan.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============ ADMIN ============ */}
          {tab === 'admin' && isSuperAdmin && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className={cardCls}><p className="text-[11px] text-slate-500 font-semibold">Stores</p><p className="text-lg font-bold flex items-center gap-2"><Users className="w-4 h-4 text-teal-700" />{allStores.length}</p></div>
                <div className={cardCls}><p className="text-[11px] text-slate-500 font-semibold">Pending</p><p className="text-lg font-bold text-amber-600">{pendingPayments.length}</p></div>
                <div className={cardCls}><p className="text-[11px] text-slate-500 font-semibold">Paid Stores</p><p className="text-lg font-bold text-teal-700">{allStores.filter((s) => s.plan !== 'free').length}</p></div>
              </div>

              <form onSubmit={handleUpdatePlatform} className={`${cardCls} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2"><QrCode className="w-4 h-4 text-teal-700" /> Platform Payment Details</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PalawanPay / Maya Number</label>
                    <input name="maya_number" defaultValue={platform.maya_number} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Initials</label>
                    <input name="account_initials" defaultValue={platform.account_initials} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Payment QR</label>
                  <input name="qr" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-800 file:font-semibold" />
                  {platform.admin_qr_url && <img src={platform.admin_qr_url} alt="Admin QR" className="w-24 h-24 object-contain mt-2 border border-slate-200 rounded-lg" />}
                </div>
                <button className={primaryBtn}><Upload className="w-4 h-4" /> Save Platform Settings</button>
              </form>

              <div className={`${cardCls} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2"><Wallet className="w-4 h-4 text-teal-700" /> Subscription Payments</h3>
                {payments.length === 0 && <p className="text-xs text-slate-500 text-center py-3">No payment submissions yet.</p>}
                {payments.map((pay) => {
                  const shop = allStores.find((s) => s.id === pay.store_id);
                  return (
                    <div key={pay.id} className="border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{shop?.name || 'Unknown Store'}</p>
                          <p className="text-xs text-slate-600">{pay.item_name || pay.item_id} | {pay.billing_cycle} | <span className="font-bold">{php(pay.amount)}</span></p>
                          <p className="text-[11px] text-slate-500">Ref: {pay.reference_number} | {new Date(pay.created_at).toLocaleString('en-PH')}</p>
                        </div>
                        <span className={statusBadge(pay.status)}>{pay.status}</span>
                      </div>
                      {pay.proof_url && (
                        <a href={pay.proof_url} target="_blank" rel="noreferrer" className="text-xs text-teal-700 font-semibold underline">View payment proof</a>
                      )}
                      {pay.status === 'Pending' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleApprovePayment(pay)} className="py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Approve</button>
                          <button onClick={() => handleRejectPayment(pay)} className="py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={`${cardCls} space-y-2`}>
                <h3 className="text-sm font-bold flex items-center gap-2"><Store className="w-4 h-4 text-teal-700" /> All Stores</h3>
                {allStores.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                    <span className="font-semibold truncate">{s.name}</span>
                    <span className="text-xs text-slate-600 capitalize">{s.plan}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around z-30">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-semibold ${active ? 'text-teal-700' : 'text-slate-500'}`}>
              <Icon className="w-5 h-5" /> {t.label}
            </button>
          );
        })}
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-3 rounded-lg bg-slate-900 text-white text-xs text-center shadow-lg">
          {toast}
        </div>
      )}

      {/* ============ RECEIPT MODAL ============ */}
      {receiptOrder && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <style>{`@media print { body * { visibility: hidden; } #receipt-print, #receipt-print * { visibility: visible; } #receipt-print { position: absolute; left: 0; top: 0; width: ${paper}; } @page { size: ${paper} auto; margin: 2mm; } }`}</style>
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 space-y-3 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-700" /> Sale Complete</h3>
              <button onClick={() => setReceiptOrder(null)} className="p-1 text-slate-500" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-x-auto">
              <div id="receipt-print" className="mx-auto bg-white text-black font-mono text-[11px] leading-tight p-2 border border-dashed border-slate-300" style={{ width: paper }}>
                <p className="text-center font-bold text-xs">{store.name}</p>
                {store.address && <p className="text-center">{store.address}</p>}
                <p className="text-center mt-1">Order #{receiptOrder.order_number ?? String(receiptOrder.id).slice(0, 6)}</p>
                <p className="text-center">{new Date(receiptOrder.created_at).toLocaleString('en-PH')}</p>
                <div className="border-t border-dashed border-black my-1" />
                {(receiptOrder.items || []).map((i, idx) => (
                  <div key={idx} className="mb-0.5">
                    <p className="truncate">{i.name}</p>
                    <div className="flex justify-between"><span>{i.qty} x {Number(i.price).toFixed(2)}</span><span>{(i.qty * Number(i.price)).toFixed(2)}</span></div>
                  </div>
                ))}
                <div className="border-t border-dashed border-black my-1" />
                <div className="flex justify-between font-bold"><span>TOTAL</span><span>{php(receiptOrder.total)}</span></div>
                <div className="flex justify-between"><span>Paid via</span><span>{receiptOrder.payment_method}</span></div>
                {receiptOrder.payment_method === 'Cash' && Number(receiptOrder.cash_change) > 0 && (
                  <div className="flex justify-between"><span>Change</span><span>{php(receiptOrder.cash_change)}</span></div>
                )}
                {receiptOrder.payment_ref && <p>Ref: {receiptOrder.payment_ref}</p>}
                <div className="border-t border-dashed border-black my-1" />
                <p className="text-center">{store.receipt_footer || 'Thank you for shopping!'}</p>
                {store.plan === 'free' && <p className="text-center mt-1 text-[9px]">Powered by A's Negosyo POS</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => window.print()} className={primaryBtn}><Printer className="w-4 h-4" /> Print {paper}</button>
              <button onClick={() => handleBluetoothPrint(receiptOrder)} className="px-4 py-2.5 rounded-lg border border-teal-700 text-teal-700 font-semibold text-sm flex items-center justify-center gap-2">
                <Bluetooth className="w-4 h-4" /> Bluetooth
              </button>
            </div>
            <button onClick={() => setReceiptOrder(null)} className="w-full py-2 text-xs font-semibold text-slate-600">Close</button>
          </div>
        </div>
      )}

      {/* ============ UPGRADE MODAL ============ */}
      {upgradeModal && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 flex items-start md:items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-4 md:p-5 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2"><Crown className="w-5 h-5 text-amber-600" /> Upgrade Your Plan</h3>
              <button onClick={() => setUpgradeModal(false)} className="p-1 text-slate-500" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              {['monthly', 'annual'].map((c) => (
                <button key={c} onClick={() => setBillingCycle(c)} className={`py-1.5 text-xs font-semibold rounded-md capitalize ${billingCycle === c ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'}`}>
                  {c === 'annual' ? 'Annual (2 months free)' : 'Monthly'}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {PLANS.filter((p) => p.id !== 'free').map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`text-left p-3 rounded-xl border-2 relative ${selectedPlan === p.id ? 'border-teal-700 bg-teal-50' : 'border-slate-200'}`}
                >
                  {p.popular && <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold">Popular</span>}
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-lg font-bold text-teal-700">{php(billingCycle === 'annual' ? p.annual : p.monthly)}<span className="text-[11px] text-slate-500 font-normal">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span></p>
                  <ul className="mt-2 space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-[11px] text-slate-600 flex gap-1.5"><Check className="w-3 h-3 text-teal-700 shrink-0 mt-0.5" />{f}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Add-ons</p>
              <div className="grid sm:grid-cols-3 gap-2">
                {ADDONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedPlan(a.id)}
                    className={`text-left p-2.5 rounded-lg border-2 ${selectedPlan === a.id ? 'border-amber-600 bg-amber-50' : 'border-slate-200'}`}
                  >
                    <p className="text-xs font-semibold">{a.name}</p>
                    <p className="text-sm font-bold text-amber-600">{php(a.price)}<span className="text-[10px] text-slate-500 font-normal"> {a.cycle === 'monthly' ? '/mo' : 'one-time'}</span></p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitSubscription} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-2"><Wallet className="w-4 h-4 text-teal-700" /> Pay via PalawanPay / Maya</p>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                {platform.admin_qr_url && <img src={platform.admin_qr_url} alt="Payment QR" className="w-32 h-32 object-contain border border-slate-200 rounded-lg bg-white" />}
                <div className="space-y-1 text-xs text-slate-700">
                  <p>Send payment to:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{platform.maya_number || '+639692692760'}</span>
                    <button type="button" onClick={copyNumber} className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-600" aria-label="Copy number">
                      {copiedNum ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p>Account name initials: <span className="font-bold">{platform.account_initials || 'R A B'}</span></p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Reference Number</label>
                <input value={subRef} onChange={(e) => setSubRef(e.target.value)} placeholder="Enter reference number" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Proof Screenshot (optional, max 2MB)</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setSubProofFile(e.target.files?.[0] || null)} className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-800 file:font-semibold" />
              </div>
              <button className={`${primaryBtn} w-full`}><ArrowRight className="w-4 h-4" /> Submit Payment for Verification</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
