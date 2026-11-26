import { createClient } from "@supabase/supabase-js";

// Only the public anon key belongs in the browser. Never use a service_role / secret key here.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSecretKey = k => {
  if (/^sb_secret_/.test(k)) return true;
  try { return JSON.parse(atob(k.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role === "service_role"; } catch { return false; }
};
export const envProblem = !url || !key
  ? "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY."
  : !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)
    ? "VITE_SUPABASE_URL is not a valid Supabase project URL."
    : isSecretKey(key)
      ? "A secret or service_role key must never be used in the browser. Use the anon (public) key."
      : "";
export const sb = envProblem ? null : createClient(url, key);
export const live = !!sb;

let me = null, ownerId = null, storeId = null;
const ok = r => { if (r.error) throw r.error; return r.data; };
const p63 = p => "+63" + String(p).replace(/^(\+63|0)/, "");

// ---- input sanitising (React also escapes output; the database re-checks with CHECK constraints) ----
export const strip = (s, max = 120) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
export const clean = (s, max = 120) => strip(s, max).trim();
const refOf = s => String(s || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);

// ---- sales channels (must match the list in App.jsx) ----
const CHANNELS = ["Walk-in", "Shopee", "TikTok Shop", "Lazada", "Online / FB"];
const MARKETPLACES = ["Shopee", "TikTok Shop", "Lazada"];

// ---- image validation: JPEG / PNG / WebP only, 2 MB max, magic-byte check ----
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 2 * 1024 * 1024;
export const checkImage = async f => {
  if (!TYPES[f.type]) return "Only JPEG, PNG or WebP images are allowed.";
  if (f.size > MAX) return "Image must be 2MB or smaller.";
  const h = new Uint8Array(await f.slice(0, 12).arrayBuffer());
  const png = h[0] === 0x89 && h[1] === 0x50 && h[2] === 0x4e && h[3] === 0x47;
  const jpg = h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff;
  const webp = h[0] === 0x52 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x46 && h[8] === 0x57 && h[9] === 0x45 && h[10] === 0x42 && h[11] === 0x50;
  return png || jpg || webp ? "" : "That file is not a valid image.";
};
const blobOf = d => {
  const m = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(d || "");
  if (!m) throw new Error("Invalid image file.");
  const bin = atob(m[2]); const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  const b = new Blob([a], { type: m[1] });
  if (b.size > MAX) throw new Error("Image must be 2MB or smaller.");
  return b;
};
const upload = async (bucket, folder, dataUrl) => {
  const blob = blobOf(dataUrl);
  const path = folder + "/" + crypto.randomUUID() + "." + TYPES[blob.type];
  const r = await sb.storage.from(bucket).upload(path, blob, { upsert: false, contentType: blob.type });
  if (r.error) throw r.error;
  return { path, url: sb.storage.from(bucket).getPublicUrl(path).data.publicUrl };
};
const safeImg = u => (typeof u === "string" && /^https:\/\/[a-z0-9-]+\.supabase\.co\//.test(u) ? u : "");

const mapP = r => ({
  id: r.id, sku: r.sku, name: r.name, price: +r.price, cost: +r.cost, stock: r.stock,
  shopee: r.shopee_sku || "", lazada: r.lazada_sku || "", tiktok: r.tiktok_sku || "",
  category: r.category || "", unit: r.unit || "pc", description: r.description || "", image_url: safeImg(r.image_url),
});
const mapO = o => ({
  id: o.order_no, items: (o.order_items || []).map(i => ({ id: i.product_id, name: i.name, price: +i.price, cost: +i.cost, qty: i.qty })),
  subtotal: +o.subtotal, discount: +o.discount, total: +o.total, cogs: +o.cogs, method: o.method, ref: o.reference_no || "", change: +o.cash_change,
  status: o.status, time: new Date(o.created_at).toLocaleString("en-PH"),
  sales_channel: CHANNELS.includes(o.sales_channel) ? o.sales_channel : "Walk-in", waybill_number: o.waybill_number || null, platform_fee: +o.platform_fee || 0,
});
const eff = s => (s.plan_expires_at && new Date(s.plan_expires_at) < new Date() ? "free" : s.plan);
const mapS = s => ({ id: s.owner_id === ownerId ? "me" : s.id, name: s.name, plan: eff(s), expires: eff(s) === "free" ? null : s.plan_expires_at });
const signed = async p => (p ? safeImg((await sb.storage.from("payment-screenshots").createSignedUrl(p, 600)).data?.signedUrl) : "");

export const cloud = {
  sendOtp: async (ch, v) => {
    const r = await sb.auth.signInWithOtp(ch === "phone" ? { phone: p63(v), options: { shouldCreateUser: true } } : { email: String(v).toLowerCase(), options: { shouldCreateUser: true } });
    if (r.error) throw r.error;
  },
  verifyOtp: async (ch, v, t) => ok(await sb.auth.verifyOtp(ch === "phone" ? { phone: p63(v), token: t, type: "sms" } : { email: String(v).toLowerCase(), token: t, type: "email" })),
  oauth: p => sb.auth.signInWithOAuth({ provider: p, options: { redirectTo: window.location.origin } }),
  claim: async (username, shop, password) => {
    const r = await sb.auth.updateUser({ password });
    if (r.error) throw r.error;
    ok(await sb.rpc("claim_profile", { p_username: username, p_shop_name: clean(shop, 30) }));
  },
  login: (id, pw) => (id.includes("@") ? sb.auth.signInWithPassword({ email: id.toLowerCase(), password: pw }) : sb.auth.signInWithPassword({ phone: p63(id), password: pw })),
  logout: async () => {
    try { await sb.auth.signOut(); } catch { /* ignore */ }
    me = ownerId = storeId = null;
    try { Object.keys(localStorage).filter(k => k.startsWith("sb-")).forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); } catch { /* ignore */ }
  },
  products: async () => ok(await sb.from("products").select("*").order("created_at")).map(mapP),
  orders: async () => ok(await sb.from("orders").select("*,order_items(*)").order("created_at", { ascending: false }).limit(300)).map(mapO),
  stores: async () => ok(await sb.from("stores").select("*").order("created_at")).map(mapS),
  payments: async () => {
    const rows = ok(await sb.from("subscription_payments").select("*,stores(name)").order("created_at", { ascending: false }).limit(100));
    return Promise.all(rows.map(async r => ({ id: r.id, store: r.stores?.name || "", item: r.item, plan: r.plan, days: r.days, amt: +r.amount, ref: r.reference_no, shot: await signed(r.screenshot_path), status: r.status })));
  },
  loadAll: async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    me = user.id;
    const profile = ok(await sb.from("profiles").select("*").eq("id", me).maybeSingle());
    if (!profile) return { profile: null };
    ownerId = profile.owner_id;
    const st = ok(await sb.from("stores").select("*").eq("owner_id", ownerId).maybeSingle());
    storeId = st?.id;
    const [products, orders, stores, payments, ex, ps] = await Promise.all([
      cloud.products(), cloud.orders(), cloud.stores(), cloud.payments(),
      sb.from("expenses").select("amount").order("created_at"),
      sb.from("platform_settings").select("*").eq("key", "palawanpay_qr_url").maybeSingle(),
    ]);
    return {
      // store_id is the id of this account's store row; App.jsx uses it as the product-images folder.
      profile: { ...profile, store_id: st?.id ?? profile.store_id ?? null },
      products, orders, stores, payments,
      expenses: (ex.data || []).map(e => ({ amt: +e.amount })),
      adminQr: safeImg(ps.data?.value),
      set: { name: st.name, addr: st.address || "", phone: st.phone || "", tin: st.tin_note || "", foot: st.receipt_footer || "", accent: st.accent, qr: safeImg(st.qr_url), paper: st.paper_width },
    };
  },
  saveStore: async s => ok(await sb.from("stores").update({
    name: clean(s.name, 30) || "My Store", address: clean(s.addr), phone: clean(s.phone, 30), tin_note: clean(s.tin, 80), receipt_footer: clean(s.foot),
    accent: /^#[0-9a-fA-F]{6}$/.test(s.accent) ? s.accent : "#0F766E", paper_width: s.paper === "80" ? "80" : "58", qr_url: safeImg(s.qr) || null,
  }).eq("owner_id", ownerId)),
  uploadSellerQr: async d => (await upload("seller-qr", me, d)).url,
  saveProduct: async p => ok(await sb.from("products").upsert({
    store_id: storeId, owner_id: ownerId, sku: clean(p.sku, 40), name: clean(p.name, 80),
    price: Math.max(0, +p.price || 0), cost: Math.max(0, +p.cost || 0), stock: Math.max(0, Math.floor(+p.stock || 0)),
    shopee_sku: clean(p.shopee, 40) || null, lazada_sku: clean(p.lazada, 40) || null, tiktok_sku: clean(p.tiktok, 40) || null,
    category: clean(p.category, 30) || null, unit: clean(p.unit, 12) || "pc", description: clean(p.description, 120) || null,
    image_url: safeImg(p.image_url) || null,
  }, { onConflict: "store_id,sku" })),
  placeOrder: async ({ items, discount, method, ref, change, sales_channel, waybill_number, platform_fee }) => {
    const o = ok(await sb.rpc("place_order", { p_items: items.map(i => ({ product_id: i.id, qty: Math.floor(+i.qty) })), p_discount: Math.max(0, +discount || 0), p_method: method, p_ref: refOf(ref), p_change: Math.max(0, +change || 0) }));
    // Channel details are saved right after the order is created, so the place_order function does not have to change.
    const channel = CHANNELS.includes(sales_channel) ? sales_channel : "Walk-in";
    const mk = MARKETPLACES.includes(channel);
    const extra = { sales_channel: channel, waybill_number: mk ? refOf(waybill_number) || null : null, platform_fee: mk ? Math.min(Math.max(0, +platform_fee || 0), 9999999) : 0 };
    if (extra.sales_channel !== "Walk-in" || extra.waybill_number || extra.platform_fee) {
      const r = await sb.from("orders").update(extra).eq("order_no", o.order_no).select("order_no");
      if (r.error || !r.data?.length) console.warn("Order saved, but its sales channel details were not:", r.error?.message || "no row updated (check the orders UPDATE policy).");
      else Object.assign(o, extra);
    }
    return mapO(o);
  },
  setStatus: async (no, status) => ok(await sb.from("orders").update({ status }).eq("order_no", no)),
  addExpense: async amt => ok(await sb.from("expenses").insert({ amount: Math.max(0.01, +amt || 0) })),
  submitPayment: async ({ o, ref, shot }) => {
    const r = refOf(ref);
    if (!/^[A-Za-z0-9-]{4,40}$/.test(r)) throw new Error("Enter a valid reference number.");
    const { path } = await upload("payment-screenshots", me, shot);
    ok(await sb.from("subscription_payments").insert({ item: o.label, plan: o.plan, addon: o.plan ? null : o.key, days: o.days, amount: o.amt, reference_no: r, screenshot_path: path }));
  },
  approve: async (id, days) => ok(await sb.rpc("approve_payment", { p_id: id, p_days: days === 365 ? 365 : 30 })),
  reject: async id => ok(await sb.rpc("reject_payment", { p_id: id })),
  setAdminQr: async d => {
    const { url: u } = await upload("admin-qr", "platform", d);
    ok(await sb.from("platform_settings").upsert({ key: "palawanpay_qr_url", value: u, updated_by: me, updated_at: new Date().toISOString() }));
    return u;
  },
};
