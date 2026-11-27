import React from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Store } from "lucide-react";

export const peso = n => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
export function PaymentDetails({ store }) { return <div className="card p-3 space-y-2 text-sm"><b className="flex items-center gap-2"><Store size={16}/>Payment instructions</b>{store.gcash_details && <p><b>GCash:</b> {store.gcash_details}</p>}{store.maya_details && <p><b>Maya:</b> {store.maya_details}</p>}{store.bank_details && <p><b>Bank transfer:</b> {store.bank_details}</p>}{!store.gcash_details && !store.maya_details && !store.bank_details && <p className="mu">Use the QR code above, then enter your payment reference number.</p>}</div>; }
