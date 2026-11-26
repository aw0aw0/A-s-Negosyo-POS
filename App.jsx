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
function AuthFlow({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // login | signup | otp | onboarding
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
  if (!user || !profile || !store) return <AuthFlow onAuthenticated={loadWorkspace} />;

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
      const handleSubmitSubscription = async (e) => {
    e.preventDefault();
    if (!sanitize(subRef)) return notify('Enter your PalawanPay/Maya reference number.');
    let proofUrl = '';
    if (subProofFile) {
      proofUrl = await uploadImage('payment-proofs', subProofFile);
      if (!proofUrl) return;
    }
    const planObj = PLANS.find((p) => p.id === selectedPlan);
    const addonObj = ADDONS.find((a) => a.id === selectedPlan);
    const amount = planObj ? (billingCycle === 'annual' ? planObj.annual : planObj.monthly) : addonObj.price;
    const cycle = planObj ?
