import React from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Store } from "lucide-react";
import { formatMoney, isInternationalRegion } from "../currency.js";

export const peso = (n, currencyCode = "PHP") => formatMoney(n, currencyCode);
export const statusLabel = s => ({ New: "Pending Verification", "To Pack": "Payment Confirmed", Preparing: "Preparing", "Ready for Pickup": "Preparing", Completed: "Delivered" }[s] || s || "Pending Verification");
export function StoreShell({ title, children, back = "/" }) {
  return <div className="min-h-screen p-4 sm:p-8" style={{ background: "var(--bg)", color: "var(--tx)" }}>
    <div className="max-w-3xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0"><img src="/logo.png" alt="" className="w-11 h-11 rounded-full object-cover"/><div className="min-w-0"><div className="font-bold text-xl truncate">{title}</div><div className="mu text-sm">A’s Negosyo POS</div></div></div>
        <a className="btn ghost shrink-0" href={back}><ArrowLeft size={16} className="inline mr-1"/>Back</a>
      </header>{children}
    </div>
  </div>;
}
export function Message({ children, ok = false }) { return <div className="card p-8 text-center space-y-3">{ok && <CheckCircle2 size={56} className="mx-auto" style={{ color: "var(--ok)" }}/>}<p className={ok ? "text-xl font-bold" : "mu"}>{children}</p></div>; }
export function PaymentDetails({ store, method }) {
  const international = isInternationalRegion(store.country_code, store.currency_code);
  const paypalUrl = (() => { try { const u = new URL(store.paypal_me_url || ""); return u.protocol === "https:" && ["paypal.me", "www.paypal.me"].includes(u.hostname.toLowerCase()) ? u.href : ""; } catch { return ""; } })();
  return <div className="card p-3 space-y-2 text-sm"><b className="flex items-center gap-2"><Store size={16}/>Payment instructions</b>
    {method === "PayPal" && <>{paypalUrl && <a className="btn primary w-full justify-center" href={paypalUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/>Open PayPal.Me</a>}{store.paypal_email && <div className="break-all"><b>PayPal email:</b> {store.paypal_email}</div>}{!paypalUrl && !store.paypal_email && <p className="mu">PayPal instructions have not been added by this store.</p>}</>}
    {method === "Bank Transfer" && (store.bank_details ? <p><b>Bank transfer:</b> {store.bank_details}</p> : <p className="mu">Bank transfer instructions have not been added by this store.</p>)}
    {method === "Card" && <p className="mu">Card processing is not connected. Confirm payment through the store’s external card terminal before submitting the order.</p>}
    {(!international || method === "QR Ph / GCash / Maya") && <>{store.gcash_details && <p><b>GCash:</b> {store.gcash_details}</p>}{store.maya_details && <p><b>Maya:</b> {store.maya_details}</p>}{!store.gcash_details && !store.maya_details && !store.qr && <p className="mu">Enter the payment reference after making the transfer.</p>}</>}
  </div>;
}
