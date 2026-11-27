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
export const currentStoreId = () => storeId;
export const broadcastDisplay = async (id, payload) => {
  if (!sb || !id) return;
  const channel = sb.channel("pos-display:" + id);
  try {
    const subscribed = await Promise.race([
      new Promise(resolve => channel.subscribe(status => resolve(status === "SUBSCRIBED"))),
      new Promise(resolve => setTimeout(() => resolve(false), 4000)),
    ]);
    if (subscribed) await channel.send({ type: "broadcast", event: "cart", payload });
  } finally { sb.removeChannel(channel); }
};

let me = null, ownerId = null, storeId = null;
const ok = r => { if (r.error) throw r.error; return r.data; };
const p63 = p => "+63" + String(p).replace(/^(\+63|0)/, "");

// ---- input sanitising (React also escapes output; the database re-checks with CHECK constraints) ----
export const strip = (s, max = 120) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
export const clean = (s, max = 120) => strip(s, max).trim();
const refOf = s => String(s || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);

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

const imgsOf = r => { const a = Array.isArray(r.images) ? r.images : []; return (a.length ? a : r.image_url ? [r.image_url] : []).map(safeImg).filter(Boolean).slice(0, 3); };
const mapP = r => ({ id: r.id, store_id: r.store_id, sku: r.sku, name: r.name, price: +r.price, cost: +r.cost, stock: r.stock, active: r.active !== false, category: r.category || "", unit: r.unit || "pc", description: r.description || "", expiry_date: r.expiry_date || "", batch_number: r.batch_number || "", serial_numbers: Array.isArray(r.serial_numbers) ? r.serial_numbers : (r.serial_numbers ? String(r.serial_numbers).split(",").map(x => x.trim()).filter(Boolean) : []), shopee: r.shopee_sku || "", lazada: r.lazada_sku || "", tiktok: r.tiktok_sku || "", images: imgsOf(r) });
const mapO = o => ({ id: o.order_no, items: (o.order_items || []).map(i => ({ id: i.product_id, name: i.name, price: +i.price, cost: +i.cost, qty: i.qty })), subtotal: +o.subtotal, discount: +o.discount, total: +o.total, cogs: +o.cogs, method: o.method, ref: o.reference_no || "", change: +o.cash_change, status: o.status, created_at: o.created_at, time: new Date(o.created_at).toLocaleString("en-PH"), cashier_name: o.cashier_name || "Unknown", customer_id: o.customer_id || "", promo_code: o.promo_code || "", points_earned: +o.points_earned || 0, points_redeemed: +o.points_redeemed || 0, mdr_fee: +o.mdr_fee || 0, offline_queued: !!o.offline_queued });
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
  displayStore: async id => {
    const row = ok(await sb.from("stores").select("id,name,qr_url,payment_qr_url,slug,allow_cod,online_store_active").eq("id", id).maybeSingle());
    if (!row) return null;
    const promos = (await sb.from("promotions").select("name,code,type,value").eq("store_id", id).eq("active", true).limit(20)).data || [];
    return { id: row.id, name: row.name || "", logo: "/logo-full.png", qr: safeImg(row.payment_qr_url) || safeImg(row.qr_url), promos, slug: row.slug || row.id, allow_cod: row.allow_cod !== false };
  },
  publicStore: async slug => {
    let row = ok(await sb.from("stores").select("id,name,address,phone,qr_url,payment_qr_url,slug,allow_cod,online_store_active,gcash_details,maya_details,bank_details").eq("slug", slug).eq("online_store_active", true).maybeSingle());
    if (!row && /^[0-9a-f-]{36}$/i.test(slug)) row = ok(await sb.from("stores").select("id,name,address,phone,qr_url,payment_qr_url,slug,allow_cod,online_store_active,gcash_details,maya_details,bank_details").eq("id", slug).eq("online_store_active", true).maybeSingle());
    if (!row) return null;
    const products = ok(await sb.from("products").select("id,store_id,sku,name,price,stock,category,unit,description,image_url,images").eq("store_id", row.id).eq("active", true).gt("stock", 0).order("name").limit(500)).map(mapP);
    return { ...row, qr: safeImg(row.payment_qr_url) || safeImg(row.qr_url), products };
  },
  placeOnlineOrder: async p => ok(await sb.rpc("place_online_order", { p_store_slug: p.storeSlug, p_items: p.items.map(i => ({ product_id: i.id, qty: Math.floor(+i.qty) })), p_customer_name: clean(p.customerName, 120), p_customer_phone: clean(p.customerPhone, 30), p_fulfillment_method: p.fulfillment, p_delivery_address: clean(p.address, 240), p_order_notes: clean(p.notes, 240), p_payment_method: p.paymentMethod, p_reference_no: p.reference || null, p_receipt_path: p.receiptPath || null }))[0],
  trackOnlineOrder: async (orderNo, phone) => ok(await sb.rpc("track_online_order", { p_order_no: Number(orderNo), p_phone: clean(phone, 30) }))[0] || null,
  uploadGuestReceipt: async file => {
    const bad = await checkImage(file);
    if (bad) throw new Error(bad);
    const path = "guest/" + crypto.randomUUID() + "." + TYPES[file.type];
    const r = await sb.storage.from("storefront-receipts").upload(path, file, { upsert: false, contentType: file.type });
    if (r.error) throw r.error;
    return path;
  },
  adminOrders: async () => ok(await sb.from("orders").select("order_no,status,method,payment_method,reference_no,payment_receipt_path,total,created_at,customer_name,customer_phone,fulfillment_method,delivery_address,order_notes,source,order_items(product_id,name,price,qty)").eq("source", "online_storefront").order("created_at", { ascending: false }).limit(300)),
  updateOnlineOrderStatus: async (orderNo, status) => ok(await sb.from("orders").update({ status }).eq("order_no", orderNo).eq("source", "online_storefront")),
  receiptUrl: async path => path ? safeImg((await sb.storage.from("storefront-receipts").createSignedUrl(path, 600)).data?.signedUrl) : "",
  kitchenOrders: async id => {
    let q = sb.from("orders").select("order_no,status,method,total,created_at,cashier_name,customer_id,order_items(order_id,product_id,name,qty,price)").eq("store_id", id).gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString()).order("created_at", { ascending: true }).limit(300);
    return (await q).data?.map(mapO) || [];
  },
  customers: async () => ok(await sb.from("customers").select("id,name,phone,points,store_id").order("name").limit(1000)).map(r => ({ id: r.id, name: r.name, phone: r.phone || "", email: "", points: +r.points || 0 })),
  promotions: async () => ok(await sb.from("promotions").select("id,code,name,type,value,active,store_id").eq("active", true).order("code").limit(200)).map(r => ({ id: r.id, code: r.code, name: r.name || r.code, type: r.type || "cart_pct", value: +r.value || 0, active: r.active !== false })),
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
    if (!st) return { profile: null };
    const [products, orders, stores, payments, customers, promotions, ex, ps] = await Promise.all([
      cloud.products(), cloud.orders(), cloud.stores(), cloud.payments(), cloud.customers(), cloud.promotions(),
      sb.from("expenses").select("amount").order("created_at"),
      sb.from("platform_settings").select("*").eq("key", "palawanpay_qr_url").maybeSingle(),
    ]);
    return {
      profile, products, orders, stores, payments, customers, promotions,
      expenses: (ex.data || []).map(e => ({ amt: +e.amount })),
      adminQr: safeImg(ps.data?.value),
      storeId: st.id,
      set: { name: st.name, addr: st.address || "", phone: st.phone || "", tin: st.tin_note || "", foot: st.receipt_footer || "", accent: st.accent, qr: safeImg(st.payment_qr_url) || safeImg(st.qr_url), paper: st.paper_width, allow_cod: st.allow_cod !== false, online_store_active: st.online_store_active !== false, slug: st.slug || st.id, gcash_details: st.gcash_details || "", maya_details: st.maya_details || "", bank_details: st.bank_details || "" },
    };
  },
  saveStore: async s => ok(await sb.from("stores").update({
    name: clean(s.name, 30) || "My Store", address: clean(s.addr), phone: clean(s.phone, 30), tin_note: clean(s.tin, 80), receipt_footer: clean(s.foot),
    accent: /^#[0-9a-fA-F]{6}$/.test(s.accent) ? s.accent : "#0F766E", paper_width: s.paper === "80" ? "80" : "58", qr_url: safeImg(s.qr) || null, payment_qr_url: safeImg(s.qr) || null, allow_cod: s.allow_cod !== false, online_store_active: s.online_store_active !== false, gcash_details: clean(s.gcash_details, 240), maya_details: clean(s.maya_details, 240), bank_details: clean(s.bank_details, 240),
  }).eq("owner_id", ownerId)),
  uploadSellerQr: async d => (await upload("seller-qr", me, d)).url,
  saveProduct: async p => ok(await sb.from("products").upsert({
    store_id: storeId, owner_id: ownerId, sku: clean(p.sku, 40), name: clean(p.name, 80),
    price: Math.max(0, +p.price || 0), cost: Math.max(0, +p.cost || 0), stock: Math.max(0, Math.floor(+p.stock || 0)),
    shopee_sku: clean(p.shopee, 40) || null, lazada_sku: clean(p.lazada, 40) || null, tiktok_sku: clean(p.tiktok, 40) || null,
    expiry_date: p.expiry_date || null, batch_number: clean(p.batch_number, 80) || null, serial_numbers: (p.serial_numbers || []).map(x => clean(x, 80)).filter(Boolean),
    images: (p.images || []).map(safeImg).filter(Boolean).slice(0, 3), image_url: (p.images || []).map(safeImg).filter(Boolean)[0] || null,
  }, { onConflict: "store_id,sku" })),
  placeOrder: async ({ items, discount, method, ref, change }) => mapO(ok(await sb.rpc("place_order", { p_items: items.map(i => ({ product_id: i.id, qty: Math.floor(+i.qty) })), p_discount: Math.max(0, +discount || 0), p_method: method, p_ref: refOf(ref), p_change: Math.max(0, +change || 0) }))),
  updateOrderMetadata: async (no, m) => ok(await sb.from("orders").update({ cashier_name: clean(m.cashier_name, 120) || null, customer_id: m.customer_id || null, promo_code: clean(m.promo_code, 50) || null, points_earned: Math.max(0, +m.points_earned || 0), points_redeemed: Math.max(0, +m.points_redeemed || 0), mdr_fee: Math.max(0, +m.mdr_fee || 0), offline_queued: !!m.offline_queued }).eq("order_no", no)),
  createCustomer: async ({ name, phone }) => {
    const row = ok(await sb.from("customers").insert({ store_id: storeId, name: clean(name, 120), phone: clean(phone, 30) }).select("id,name,phone,points").single());
    return { id: row.id, name: row.name, phone: row.phone || "", email: "", points: +row.points || 0 };
  },
  updateCustomerPoints: async (id, delta) => {
    if (!id) return null;
    const row = ok(await sb.from("customers").select("points").eq("id", id).single());
    return ok(await sb.from("customers").update({ points: Math.max(0, (+row.points || 0) + Math.trunc(+delta || 0)) }).eq("id", id));
  },
  saveStocktake: async (id, physical) => ok(await sb.from("products").update({ stock: Math.max(0, Math.floor(+physical || 0)) }).eq("id", id)),
  setStatus: async (no, status) => ok(await sb.from("orders").update({ status }).eq("order_no", no)),
  addExpense: async amt => ok(await sb.from("expenses").insert({ amount: Math.max(0.01, +amt || 0) })),
  submitPayment: async ({ o, ref, shot }) => {
    const r = refOf(ref);
    if (!/^[A-Za-z0-9-]{4,40}$/.test(r)) throw new Error("Enter a valid reference number.");
    const { path } = await upload("payment-screenshots", me, shot);
    ok(await sb.from("subscription_payments").insert({ item: o.label, plan: o.plan, addon: o.plan ? null : o.key, days: o.days, amount: o.amt, reference_no: r, screenshot_path: path }));
  },
  deleteProduct: async id => ok(await sb.from("products").delete().eq("id", id)),
  deleteStore: async () => {
    if (!storeId) throw new Error("No store to delete.");
    ok(await sb.rpc("delete_my_store", { p_store_id: storeId }));
  },
  uploadProductImage: async blob => {
    if (blob.type !== "image/jpeg" || blob.size > MAX || !storeId) throw new Error("Invalid image file.");
    const path = storeId + "/" + crypto.randomUUID() + ".jpg";
    const r = await sb.storage.from("product-images").upload(path, blob, { upsert: false, contentType: "image/jpeg" });
    if (r.error) throw r.error;
    return sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  },
  resetPassword: async email => { const r = await sb.auth.resetPasswordForEmail(String(email).toLowerCase(), { redirectTo: window.location.origin }); if (r.error) throw r.error; },
  updatePassword: async password => { const r = await sb.auth.updateUser({ password }); if (r.error) throw r.error; },
  approve: async (id, days) => ok(await sb.rpc("approve_payment", { p_id: id, p_days: days === 365 ? 365 : 30 })),
  reject: async id => ok(await sb.rpc("reject_payment", { p_id: id })),
  setAdminQr: async d => {
    const { url: u } = await upload("admin-qr", "platform", d);
    ok(await sb.from("platform_settings").upsert({ key: "palawanpay_qr_url", value: u, updated_by: me, updated_at: new Date().toISOString() }));
    return u;
  },
};
