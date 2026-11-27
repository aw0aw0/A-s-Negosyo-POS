import React, { useEffect, useState } from "react";
import { Check, Eye, LogIn, RefreshCw } from "lucide-react";
import { cloud, sb } from "../cloud";
import { Message, StoreShell, peso, statusLabel } from "./StoreShell";

const statuses = ["Pending Verification", "Payment Confirmed", "Preparing", "Shipped", "Delivered"];

export default function AdminOrders() {
  const [user, setUser] = useState(undefined);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const { data } = await sb.auth.getUser();
      setUser(data.user);
      if (data.user) setOrders(await cloud.adminOrders());
    } catch (e) { setError(e.message); }
  };
  useEffect(() => {
    load();
    const ch = sb.channel("admin-online-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => sb.removeChannel(ch);
  }, []);
  const inspect = async o => {
    setSelected(o); setReceipt("");
    if (o.payment_receipt_path) setReceipt(await cloud.receiptUrl(o.payment_receipt_path));
  };
  const update = async (o, status) => {
    try {
      await cloud.updateOnlineOrderStatus(o.order_no, status);
      setOrders(xs => xs.map(x => x.order_no === o.order_no ? { ...x, status } : x));
    } catch (e) { setError(e.message); }
  };
  if (user === undefined) return <StoreShell title="Admin orders"><Message>Checking sign-in...</Message></StoreShell>;
  if (!user) return <StoreShell title="Admin orders"><Message><LogIn size={30} className="mx-auto mb-2" />Sign in as the store owner to view online orders.</Message></StoreShell>;
  return <StoreShell title="Admin orders">
    <div className="space-y-4">
      <div className="flex justify-between items-center"><p className="mu">Incoming online storefront orders</p><button className="btn ghost" onClick={load}><RefreshCw size={16} />Refresh</button></div>
      {error && <p className="err">{error}</p>}
      {!orders.length && <Message>No online orders yet.</Message>}
      {orders.map(o => <div className="card p-4 space-y-3" key={o.order_no}>
        <div className="flex justify-between gap-3"><div><b>#{o.order_no}</b><p className="mu text-sm">{o.customer_name || "Guest"} · {o.customer_phone || "No phone"}</p></div><strong>{peso(o.total)}</strong></div>
        <p className="text-sm">{o.payment_method || "Payment not specified"}{o.reference_no && ` · Ref ${o.reference_no}`}</p>
        <div className="flex gap-2 flex-wrap"><button className="btn ghost" onClick={() => inspect(o)}><Eye size={16} />Inspect</button>{statuses.map(s => <button key={s} className={`btn ${statusLabel(o.status) === s ? "primary" : "ghost"}`} onClick={() => update(o, s)}><Check size={14} />{s}</button>)}</div>
        {selected?.order_no === o.order_no && <div className="border-t pt-3 text-sm space-y-2"><p><b>Fulfillment:</b> {o.fulfillment_method || o.method} {o.delivery_address && `· ${o.delivery_address}`}</p><p><b>Notes:</b> {o.order_notes || "None"}</p>{receipt ? <a href={receipt} target="_blank" rel="noreferrer"><img src={receipt} alt="Uploaded payment receipt" className="max-w-xs max-h-72 rounded-lg object-contain" /></a> : <p className="mu">No receipt screenshot uploaded.</p>}</div>}
      </div>)}
    </div>
  </StoreShell>;
}
