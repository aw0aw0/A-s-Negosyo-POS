
import {useState,useMemo,useEffect,useRef} from "react";
import {Html5Qrcode} from "html5-qrcode";
import {LayoutDashboard,Receipt as ReceiptIcon,Package,Tag,Settings as SettingsIcon,Gem,ShieldCheck,ScanLine,Smartphone,Mail,Lock,Printer,Check,X,ArrowLeft,AlertTriangle,MessageSquare,CheckCircle2,Star,Eye,EyeOff,Copy,Trash2,ImagePlus} from "lucide-react";
import {sb,live,cloud,envProblem,strip,clean,checkImage} from "./cloud.js";
const peso=n=>"₱"+Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const seed=[
{id:1,sku:"SKU-001",name:"Kape 3-in-1 (box)",price:120,cost:85,stock:40,shopee:"SP-KAPE",lazada:"",tiktok:""},
{id:2,sku:"SKU-002",name:"Dried Mangoes 200g",price:150,cost:95,stock:25,shopee:"SP-MANGO",lazada:"LZ-MANGO",tiktok:""},
{id:3,sku:"SKU-003",name:"Barong Tee",price:450,cost:260,stock:12,shopee:"",lazada:"",tiktok:"TT-BAR"},
{id:4,sku:"SKU-004",name:"Tote Bag Abaca",price:299,cost:150,stock:6,shopee:"SP-TOTE",lazada:"",tiktok:""},
{id:5,sku:"SKU-005",name:"Coco Soap",price:85,cost:40,stock:60,shopee:"",lazada:"LZ-SOAP",tiktok:""},
{id:6,sku:"SKU-006",name:"Bagoong Jar",price:110,cost:70,stock:3,shopee:"",lazada:"",tiktok:""}];
const defSet={name:"A’s Negosyo POS Demo Store",addr:"123 Rizal St., Quezon City",phone:"0917 000 0000",tin:"Non-VAT Reg. TIN 000-000-000-000",foot:"Salamat po! Balik kayo ulit.",accent:"#0F766E",qr:"",paper:"58"};
let PLAN="free";

function Modal({children,onClose,title}){return(
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{background:"rgba(0,0,0,.55)"}}>
<div className="card w-full sm:max-w-md max-h-[92vh] overflow-auto p-4" style={{borderRadius:"18px 18px 0 0"}}>
<div className="flex justify-between items-center mb-3"><b className="text-lg">{title}</b><button className="btn ghost" onClick={onClose} aria-label="Close"><X size={18}/></button></div>{children}</div></div>);}

const DISPOSABLE=["mailinator.com","10minutemail.com","guerrillamail.com","tempmail.com","temp-mail.org","yopmail.com","trashmail.com","throwawaymail.com","sharklasers.com","getnada.com","dispostable.com","fakeinbox.com","maildrop.cc"];
const validEmail=e=>{const m=/^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})$/.exec(e);if(!m||e.includes(".."))return "Enter a valid email address.";if(DISPOSABLE.includes(m[1].toLowerCase()))return "Disposable or fake email addresses are not allowed.";return ""};
const gen8=()=>{const a=new Uint32Array(1);let x="";for(let i=0;i<6;i++){crypto.getRandomValues(a);x+=a[0]%10}return x};
const msg8=c=>`Welcome to A’s Negosyo POS! This is your 6-digit verification code: ${c}`;
const friendly=e=>/unsupported phone provider|phone (signups|logins) (are )?disabled|sms provider/i.test((e&&e.message)||"")?"SMS service is currently being activated by the admin. Please use Email or Google sign-up for now.":/rate|limit|429|too many|seconds/i.test((e&&e.message)||"")?"Too many requests. Please wait a minute and try again.":((e&&e.message)||"Something went wrong. Please try again.");
const RESERVED=["admin","owner","cashier","demo","superadmin"];

function PwField({label,value,onChange,maxLength,ac}){const[v,setV]=useState(false);const[fo,setFo]=useState(false);const show=fo||value.length>0;
return <div><div className="text-xs mu">{label}</div><div className="relative mt-1">
<input aria-label={label} className="inp" style={{paddingRight:show?46:12}} placeholder={label} type={v?"text":"password"} maxLength={maxLength} value={value} autoComplete={ac||"off"} onChange={e=>onChange(e.target.value)} onFocus={()=>setFo(true)} onBlur={()=>setFo(false)}/>
{show&&<button type="button" aria-label={v?"Hide password":"Show password"} onMouseDown={e=>e.preventDefault()} onClick={()=>setV(!v)} className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-2" style={{color:"var(--mu)"}}>{v?<EyeOff size={22}/>:<Eye size={22}/>}</button>}</div></div>}

function Auth({pre,notice,role,users,setUsers,onIn}){
const[st,setSt]=useState("login");const[err,setErr]=useState("");
const[lid,setLid]=useState("");const[lpw,setLpw]=useState("");
const[ph,setPh]=useState("");const[em,setEm]=useState("");const[ch,setCh]=useState("");const[code,setCode]=useState("");const[inp,setInp]=useState("");const[bn,setBn]=useState(true);
const[un,setUn]=useState("");const[pw,setPw]=useState("");const[pw2,setPw2]=useState("");const[shop,setShop]=useState("");const[prov,setProv]=useState("");const[info,setInfo]=useState("");
const[now,setNow]=useState(Date.now());useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[]);
const[until,setUntil]=useState(0);const[fails,setFails]=useState(0);const[lock,setLock]=useState(0);
const wait=Math.max(0,Math.ceil((until-now)/1000));const lockLeft=Math.max(0,Math.ceil((lock-now)/1000));
useEffect(()=>{if(pre&&(st==="login"||st==="signup")){setCh("oauth");setSt("creds")}},[pre]);
const G={background:"#0F766E"};
const reset=m=>{setSt("signup");setErr(m||"");setPh("");setEm("");setCh("");setCode("");setInp("");setUn("");setPw("");setPw2("");setShop("");setProv("");setInfo("")};
const bad=()=>{const n=fails+1;setFails(n);if(n>=5)setLock(Date.now()+60000*Math.min(8,n-4));setErr("Incorrect username or password.")};
const login=async()=>{if(lockLeft>0)return setErr("Too many attempts. Try again in "+lockLeft+"s.");if(live){const r=await cloud.login(lid.trim(),lpw);if(r.error)return bad();setFails(0);setErr("");return onIn("live")}const k=lid.trim().toLowerCase();const u=users.find(u=>u.username.toLowerCase()===k||(u.phone&&u.phone===lid.trim().replace(/^(\+63|0)/,""))||(u.email&&u.email.toLowerCase()===k));if(!u||u.pw!==lpw)return bad();setFails(0);setErr("");onIn(u)};
const send=async c=>{if(wait>0)return setErr("Please wait "+wait+"s before requesting another code.");if(live){try{await cloud.sendOtp(c,c==="phone"?ph:em.trim())}catch(e){return setErr(friendly(e))}}setUntil(Date.now()+60000);setCh(c);setCode(gen8());setInp("");setBn(true);setErr("");setSt("code")};
const startPhone=()=>{if(!/^9\d{9}$/.test(ph))return setErr("Enter exactly 10 digits starting with 9 (e.g. 9163498336).");if(users.some(u=>u.phone===ph))return setErr("This phone number is already registered.");send("phone")};
const emailOk=()=>{const m=validEmail(em.trim());if(m){setErr(m);return false}if(users.some(u=>u.email&&u.email.toLowerCase()===em.trim().toLowerCase())){setErr("This email is already registered.");return false}return true};
const startEmail=pv=>{if(!emailOk())return;setProv(pv);send("email")};
const sendReset=async()=>{if(wait>0)return setErr("Please wait "+wait+"s before requesting another link.");const m=validEmail(em.trim());if(m)return setErr(m);if(live){try{await cloud.resetPassword(em.trim())}catch(e){return setErr(friendly(e))}}setUntil(Date.now()+60000);setErr("");setInfo(live?"If that email is registered, a password reset link has been sent. Check your inbox.":"Demo mode: no email is sent.")};
const verify=async()=>{let good=inp===code;if(live){try{await cloud.verifyOtp(ch,ch==="phone"?ph:em.trim(),inp);good=true}catch(e){good=false}}if(good){setErr("");setSt("creds")}else if(live){cloud.logout();reset("Wrong verification code. For your security, registration was restarted. Please start again.")}else reset("Wrong verification code. For your security, registration was restarted. Please start again.")};
const unOk=/^[a-zA-Z0-9]{1,8}$/.test(un);const taken=un&&(RESERVED.includes(un.toLowerCase())||users.some(u=>u.username.toLowerCase()===un.toLowerCase()));
const pwErr=!pw?"":!/[A-Z]/.test(pw)?"Add at least 1 UPPERCASE letter.":!/[^A-Za-z0-9\s]/.test(pw)?"Add at least 1 special character (!@#$%^&*).":"";
const match=pw.length>0&&pw===pw2;const credOk=unOk&&!taken&&pw&&!pwErr&&match;
const finish=async()=>{const u={username:un,pw,phone:ch==="phone"?ph:"",email:ch==="phone"?"":em.trim(),shop:clean(shop,30),provider:prov};if(live){try{await cloud.claim(un,clean(shop,30),pw)}catch(e){const m=String(e.message||e);setSt("creds");return setErr(m.includes("username")?"That username is already taken.":m.includes("phone")?"That phone number is already registered.":m)}}else setUsers([...users,u]);onIn(u)};
const Btn=({children,onClick,dis,ghost})=><button disabled={dis} onClick={onClick} className={"btn w-full disabled:opacity-40 "+(ghost?"ghost":"text-white")} style={ghost?{}:G}>{children}</button>;
const Err=()=>err?<div className="text-sm text-red-500">{err}</div>:null;
const Back=()=><button className="text-sm mu" onClick={()=>reset("")}><ArrowLeft size={14} className="inline -mt-0.5 mr-1.5"/>Back to sign-up options</button>;
return <div className="p-5 max-w-sm mx-auto pt-8">
{st==="code"&&ch==="phone"&&bn&&!live&&<div className="fixed top-2 left-2 right-2 z-[60] max-w-sm mx-auto rounded-2xl p-3 text-sm shadow-lg" style={{background:"#14161a",color:"#fff"}}><div className="flex justify-between text-xs" style={{opacity:.7}}><span className="flex items-center gap-1"><MessageSquare size={12}/> Messages · now</span><button onClick={()=>setBn(false)} aria-label="Dismiss"><X size={14}/></button></div><div className="mt-1">{msg8(code)}</div></div>}
<div className="text-center mb-5"><img src="/logo-full.png" alt="A’s Negosyo PH" className="w-32 h-32 mx-auto rounded-2xl object-contain" /><h1 className="text-2xl font-bold mt-2">A’s Negosyo POS</h1><p className="mu text-sm">POS at inventory para sa Pinoy sellers</p></div>
<div className="card p-4 space-y-3">
{st==="login"&&<><b>Log In</b><input className="inp" placeholder={live?"Email or phone":"Username, email or phone"} value={lid} onChange={e=>setLid(e.target.value)}/><PwField label="Password" value={lpw} onChange={setLpw} ac="current-password"/><button type="button" className="text-sm w-full text-right font-semibold" style={{color:"#0F766E"}} onClick={()=>{setErr("");setInfo("");setEm("");setSt("forgot")}}>Forgot Password?</button>{notice&&<div className="text-sm" style={{color:"#0F766E"}}>{notice}</div>}<Err/>
<Btn onClick={login}>Log In</Btn><Btn ghost onClick={()=>reset("")}>Create an account</Btn>
{!live&&<button className="text-sm mu w-full" onClick={()=>onIn(null)}>Skip to demo store as {role}</button>}</>}
{st==="signup"&&<><b>Create your account</b><Err/>
<button className="btn ghost w-full" onClick={()=>{if(live)return cloud.oauth("google");setErr("");setEm("");setSt("google")}}><b style={{color:"#4285F4"}}>G</b> Continue with Google</button>
<button className="btn ghost w-full" onClick={()=>{setErr("");setSt("phone")}}><Smartphone size={18} className="inline -mt-0.5 mr-1.5"/>Sign Up with Phone Number (+63)</button>
<button className="btn ghost w-full" onClick={()=>{setErr("");setEm("");setSt("email")}}><Mail size={18} className="inline -mt-0.5 mr-1.5"/>Use Other Email</button>
<button className="text-sm mu w-full" onClick={()=>{setErr("");setSt("login")}}>Already have an account? Log In</button></>}
{st==="google"&&<><Back/><b>Google account</b><p className="mu text-xs">Demo of <code>supabase.auth.signInWithOAuth({`{provider:"${st}"}`})</code>. Enter the account email to simulate the sign-in.</p>
<input className="inp" type="email" placeholder="you@gmail.com" value={em} onChange={e=>setEm(e.target.value)}/><Err/>
<Btn onClick={()=>startEmail("Google")}>Continue (email verification)</Btn></>}
{st==="phone"&&<><Back/><b>Sign up with phone</b><div className="flex gap-2"><div className="inp flex items-center justify-center font-bold" style={{width:72}}>+63</div>
<input className="inp" inputMode="numeric" placeholder="9163498336" maxLength={10} value={ph} onChange={e=>{let v=e.target.value.replace(/\D/g,"").slice(0,10);if(v&&v[0]!=="9")v="";setPh(v)}}/></div>
<p className="mu text-xs">10 digits, starting with 9.</p><Err/><Btn onClick={startPhone}>Send 6-digit code</Btn></>}
{st==="forgot"&&<><button className="text-sm mu" onClick={()=>{setErr("");setInfo("");setSt("login")}}><ArrowLeft size={14} className="inline -mt-0.5 mr-1.5"/>Back to log in</button><b>Forgot Password</b><p className="mu text-xs">Enter your registered email address and we will send you a reset link.</p>
<input className="inp" type="email" placeholder="you@example.com" value={em} onChange={e=>setEm(e.target.value)}/>{info&&<div className="text-sm" style={{color:"#0F766E"}}>{info}</div>}<Err/>
<Btn dis={wait>0&&!!info} onClick={sendReset}>Send Password Reset Link{wait>0&&info?" ("+wait+"s)":""}</Btn></>}
{st==="email"&&<><Back/><b>Sign up with email</b><input className="inp" type="email" placeholder="you@example.com" value={em} onChange={e=>setEm(e.target.value)}/><p className="mu text-xs">Disposable or fake email addresses are blocked.</p><Err/><Btn onClick={()=>startEmail("Email")}>Send 6-digit code</Btn></>}
{st==="code"&&<><b>Enter the 6-digit code</b><p className="mu text-xs">Sent to {ch==="phone"?"+63 "+ph:em}. A wrong code restarts registration.</p>
{live?<p className="mu text-xs">Check your {ch==="phone"?"SMS":"email"} for the code.</p>:ch==="email"?<div className="card p-3 text-sm space-y-1"><div className="mu text-xs"><Mail size={13} className="inline -mt-0.5 mr-1.5"/>Simulated email (demo mode)</div><div className="text-xs">To: {em}</div><div className="text-xs">Subject: Your A’s Negosyo POS verification code</div><div className="pt-1">{msg8(code)}</div></div>:<p className="mu text-xs"><Smartphone size={13} className="inline -mt-0.5 mr-1.5"/>See the simulated SMS banner at the top of the screen.</p>}
<input className="inp" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={inp} onChange={e=>setInp(e.target.value.replace(/\D/g,"").slice(0,6))}/><Err/>
<Btn dis={inp.length!==6} onClick={verify}>Verify</Btn><button disabled={wait>0} className="text-sm mu w-full disabled:opacity-50" onClick={()=>send(ch)}>Resend code{wait>0?" ("+wait+"s)":""}</button><button className="text-sm mu w-full" onClick={()=>reset("")}>Start over</button></>}
{st==="creds"&&<><b>Create your username and password</b>
<div><div className="flex justify-between text-xs mu"><span>Username</span><span>{un.length}/8</span></div><input className="inp mt-1" maxLength={8} placeholder="Letters and numbers only" autoCapitalize="none" value={un} onChange={e=>setUn(e.target.value.replace(/[^a-zA-Z0-9]/g,""))}/>
<div className="text-xs mt-1" style={{color:taken?"#ef4444":unOk?"#0F766E":"var(--mu)"}}>{taken?"Already taken. Try another.":unOk?"Available":"Max 8 characters, no spaces or symbols."} The username is permanent and cannot be changed.</div></div>
<PwField label="Password" value={pw} onChange={setPw} maxLength={8} ac="new-password"/>{pwErr&&<div className="text-xs text-red-500">{pwErr}</div>}
<PwField label="Confirm Password" value={pw2} onChange={setPw2} maxLength={8} ac="new-password"/>{pw2&&!match&&<div className="text-xs text-red-500">Passwords do not match.</div>}
<p className="mu text-xs">Max 8 characters, with 1 uppercase letter and 1 special character.</p>
<Err/><Btn dis={!credOk} onClick={()=>setSt("shop")}>Continue</Btn></>}
{st==="shop"&&<><b>Set up your store</b><div><div className="flex justify-between text-xs mu"><span>Shop name</span><span>{shop.length}/30</span></div>
<input className="inp mt-1" maxLength={30} placeholder="e.g. Ate Mel Online Shop" value={shop} onChange={e=>setShop(strip(e.target.value,30))}/></div>
<Err/><Btn dis={!shop.trim()} onClick={finish}>Activate my A’s Negosyo POS store</Btn></>}
</div></div>;}
function Scanner({onCode,onClose,products}){const[sim,setSim]=useState("");const[err,setErr]=useState("");const ref=useRef();
useEffect(()=>{let s;try{s=new Html5Qrcode("reader");ref.current=s;
s.start({facingMode:"environment"},{fps:10,qrbox:220},t=>{onCode(t)},()=>{}).catch(e=>setErr("Camera unavailable: allow camera access or use a USB/Bluetooth scanner."));}catch(e){setErr("Scanner failed to load.")}
return()=>{try{ref.current&&ref.current.isScanning&&ref.current.stop().catch(()=>{})}catch(e){}}},[]);
return <Modal title="Scan QR / Barcode" onClose={onClose}><div id="reader" style={{width:"100%"}}></div>{err&&<p className="text-sm text-red-500 mt-2">{err}</p>}<p className="mu text-xs mt-2">Each scan adds 1 item matching the SKU.</p>
<div className="card p-3 mt-3 space-y-2"><b className="text-sm">Simulate Scan (demo)</b><div className="flex gap-2"><select className="inp" value={sim} onChange={e=>setSim(e.target.value)}><option value="">Choose a SKU…</option>{(products||[]).map(p=><option key={p.id} value={p.sku}>{p.sku} – {p.name}</option>)}</select>
<button className="btn text-white" style={{background:"#0F766E"}} disabled={!sim} onClick={()=>onCode(sim)}>Simulate Scan</button></div></div></Modal>;}

const BT_SERVICES=["000018f0-0000-1000-8000-00805f9b34fb","0000ff00-0000-1000-8000-00805f9b34fb","0000ffe0-0000-1000-8000-00805f9b34fb","49535343-fe7d-4ae5-8fa9-9fafd205e455","e7810a71-73ae-499d-8c15-faa9aef0c3f2"];
let btDev=null,btChar=null;
async function btFind(){const sv=await btDev.gatt.connect();for(const x of await sv.getPrimaryServices()){const c=(await x.getCharacteristics()).find(c=>c.properties.write||c.properties.writeWithoutResponse);if(c)return c}throw new Error("No writable printer service found. This printer may be classic-Bluetooth only. Use system print instead.")}
async function btConnect(){if(!navigator.bluetooth)throw new Error("Direct Bluetooth printing needs Chrome on Android (or desktop Chrome).");
if(btChar&&btDev&&btDev.gatt.connected)return btChar;
if(btDev){try{btChar=await btFind();return btChar}catch(e){}}
btDev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:BT_SERVICES});btChar=await btFind();return btChar}
function escpos(o,set){const W=set.paper==="80"?48:32;const enc=new TextEncoder();const out=[];const raw=(...b)=>out.push(...b);
const txt=t=>out.push(...enc.encode(t.replace(/[^\x20-\x7E\n]/g,"?")));const money=n=>Number(n).toFixed(2);
const ln=(l,r)=>l.slice(0,Math.max(0,W-r.length-1))+" ".repeat(Math.max(1,W-Math.min(l.length,W-r.length-1)-r.length))+r+"\n";
raw(0x1b,0x40,0x1b,0x61,1,0x1b,0x45,1);txt(set.name+"\n");raw(0x1b,0x45,0);txt(set.addr+"\n"+set.phone+"\n"+set.tin+"\nOR #"+o.id+"  "+o.time+"\n");raw(0x1b,0x61,0);txt("-".repeat(W)+"\n");
o.items.forEach(i=>txt(ln(i.qty+"x "+i.name,money(i.price*i.qty))));txt("-".repeat(W)+"\n"+ln("Subtotal",money(o.subtotal)));
if(o.discount>0)txt(ln("Discount","-"+money(o.discount)));raw(0x1b,0x45,1);txt(ln("TOTAL","PHP "+money(o.total)));raw(0x1b,0x45,0);
txt(o.method==="Cash"?ln("Cash change",money(o.change)):ln("QR Ph",o.ref||""));raw(0x1b,0x61,1);txt("\n"+set.foot+"\n");raw(0x0a,0x0a,0x0a,0x1d,0x56,0x42,0x00);return new Uint8Array(out)}
async function btPrint(o,set){const c=await btConnect();const b=escpos(o,set);for(let i=0;i<b.length;i+=100){const ch=b.slice(i,i+100);if(c.properties.writeWithoutResponse)await c.writeValueWithoutResponse(ch);else await c.writeValue(ch);await new Promise(r=>setTimeout(r,25))}}
function Receipt({o,set,onClose,rank,up}){const pw=set.paper==="80"?80:58;const share=()=>{const t=`${set.name}\n${set.addr}\n${set.phone}\nOR #${o.id}\n`+o.items.map(i=>`${i.qty}x ${i.name} ${peso(i.price*i.qty)}`).join("\n")+`\nTOTAL ${peso(o.total)}\n${set.foot}`+(PLAN==="free"?"\nPowered by A’s Negosyo POS":"");
if(navigator.share)navigator.share({text:t}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(t);alert("Receipt copied")}};
return <Modal title="Receipt" onClose={onClose}>
<style>{`@media print{@page{size:${pw}mm auto;margin:0}html,body{background:#fff!important}#rcpt{width:${pw-6}mm!important;margin:0 auto!important;padding:2mm 0;font-size:${pw===80?12:10}px!important;line-height:1.25;color:#000!important}#rcpt *{color:#000!important}}`}</style>
<div id="rcpt" className="text-sm text-center space-y-1" style={{fontFamily:"ui-monospace,monospace",width:pw===80?300:216,maxWidth:"100%",margin:"0 auto"}}>
<b style={{color:set.accent}} className="text-base">{set.name}</b><div>{set.addr}</div><div>{set.phone}</div><div className="mu">{set.tin}</div>
<div className="mu">OR #{o.id} · {o.time}</div><hr style={{borderColor:"var(--bd)"}}/>
{o.items.map(i=><div key={i.id} className="flex justify-between text-left"><span>{i.qty}× {i.name}</span><span>{peso(i.price*i.qty)}</span></div>)}
<hr style={{borderColor:"var(--bd)"}}/>
<div className="flex justify-between"><span>Subtotal</span><span>{peso(o.subtotal)}</span></div>
{o.discount>0&&<div className="flex justify-between"><span>Discount</span><span>-{peso(o.discount)}</span></div>}
<div className="flex justify-between font-bold text-base"><span>TOTAL</span><span>{peso(o.total)}</span></div>
<div className="flex justify-between"><span>{o.method}{o.ref?` · Ref ${o.ref}`:""}</span><span>{o.method==="Cash"?`Change ${peso(o.change)}`:""}</span></div>
<div className="pt-2">{set.foot}</div>
{PLAN==="free"&&<div className="mu text-xs pt-2">Powered by A’s Negosyo POS</div>}</div>
<div className="flex gap-2 mt-4"><button className="btn flex-1 text-white" style={{background:set.accent}} onClick={share}>Share</button><button className="btn flex-1 ghost" onClick={()=>window.print()}>Print</button></div>
<button className="btn w-full ghost mt-2" onClick={async()=>{if(rank<1)return up("Direct Bluetooth Printing");try{await btPrint(o,set)}catch(e){alert(e.message)}}}>{rank<1?<Lock size={15} className="inline -mt-0.5 mr-1.5" style={{color:"#D97706"}}/>:<Printer size={15} className="inline -mt-0.5 mr-1.5"/>}Print via Bluetooth (1-tap)</button>
<p className="mu text-xs mt-1">System print works on every plan ({pw}mm paper). Direct Bluetooth printing is Negosyo Lite and up.</p></Modal>;}

function Checkout({total,set,onDone,onClose,onSettings}){const[m,setM]=useState("Cash");const[cash,setCash]=useState("");const[ref,setRef]=useState("");
const change=Math.max(0,(+cash||0)-total);const ok=m==="Cash"?(+cash||0)>=total:ref.trim().length>3;
return <Modal title={"Pay "+peso(total)} onClose={onClose}>
<div className="flex gap-2 mb-3">{["Cash","QR Ph / GCash / Maya"].map(k=><button key={k} onClick={()=>setM(k)} className={"btn flex-1 text-xs "+(m===k?"text-white":"ghost")} style={m===k?{background:set.accent}:{}}>{k}</button>)}</div>
{m==="Cash"?<div className="space-y-2"><input className="inp" inputMode="decimal" placeholder="Cash received" value={cash} onChange={e=>setCash(e.target.value)}/>
<div className="flex gap-2 flex-wrap">{[total,100,500,1000].map((v,i)=><button key={i} className="btn ghost" onClick={()=>setCash(String(v))}>{i?peso(v):"Exact"}</button>)}</div>
<div className="card p-3 text-center"><div className="mu text-xs">CHANGE</div><div className="text-3xl font-bold">{peso(change)}</div></div></div>
:<div className="space-y-2 text-center">{set.qr?<img src={set.qr} alt="Store payment QR" className="mx-auto rounded-lg" style={{maxHeight:260}}/>:<div className="card p-5 text-sm space-y-3"><p className="mu">No store QR uploaded yet. Go to Settings to upload your GCash / Maya / QR Ph code.</p>{onSettings&&<button className="btn w-full text-white" style={{background:"#0F766E"}} onClick={onSettings}>Open Settings</button>}</div>}
<p className="mu text-xs">Customer scans, pays {peso(total)}, then enter their reference no.</p>
<input className="inp" placeholder="Customer reference number" maxLength={40} value={ref} onChange={e=>setRef(e.target.value.replace(/[^A-Za-z0-9-]/g,"").slice(0,40))}/>
<p className="mu text-xs text-left">Verify the incoming transfer &amp; reference number on your e-wallet/bank app before confirming.</p></div>}
<button disabled={!ok} className="btn w-full text-white mt-4 disabled:opacity-40" style={{background:set.accent}} onClick={()=>onDone({method:m,ref:m==="Cash"?"":ref,change})}>Confirm Payment</button></Modal>;}

function POS({products,setProducts,orders,setOrders,set,role,rank,up,goSettings}){
const[q,setQ]=useState("");const[cart,setCart]=useState([]);const[disc,setDisc]=useState("");const[scan,setScan]=useState(false);const[pay,setPay]=useState(false);const[rc,setRc]=useState(null);const[toast,setToast]=useState("");
const add=p=>{if(p.stock<=(cart.find(c=>c.id===p.id)?.qty||0)){setToast("Out of stock: "+p.name);return}
setCart(c=>c.find(x=>x.id===p.id)?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}])};
const bySku=code=>{const p=products.find(p=>[p.sku,p.shopee,p.lazada,p.tiktok].filter(Boolean).includes(code.trim()));if(p){add(p);setToast("Added "+p.name)}else setToast("SKU not found: "+code)};
useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),1800);return()=>clearTimeout(t)}},[toast]);
const sub=cart.reduce((a,c)=>a+c.price*c.qty,0);const d=Math.min(+disc||0,sub);const total=sub-d;
const list=products.filter(p=>(p.name+p.sku).toLowerCase().includes(q.toLowerCase()));
const done=async({method,ref,change})=>{if(live){try{const o=await cloud.placeOrder({items:cart,discount:d,method,ref,change});const[pr,or]=await Promise.all([cloud.products(),cloud.orders()]);setProducts(pr);setOrders(or);setCart([]);setDisc("");setPay(false);setRc(o)}catch(e){alert(e.message)}return}const o={id:1000+orders.length+1,items:cart,subtotal:sub,discount:d,total,cogs:cart.reduce((a,c)=>a+c.cost*c.qty,0),method,ref,change,status:"New",time:new Date().toLocaleString("en-PH")};
setOrders([o,...orders]);setProducts(products.map(p=>{const c=cart.find(x=>x.id===p.id);return c?{...p,stock:p.stock-c.qty}:p}));setCart([]);setDisc("");setPay(false);setRc(o)};
return <div className="p-3 space-y-3">
<div className="flex gap-2"><input className="inp" placeholder="Search or type/scan SKU + Enter" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&q){bySku(q);setQ("")}}}/>
<button className="btn text-white" style={{background:set.accent}} onClick={()=>setScan(true)}><ScanLine size={16} className="inline -mt-0.5 mr-1.5"/>Scan</button></div>
<div className="grid grid-cols-2 gap-2">{list.map(p=><button key={p.id} onClick={()=>add(p)} className="card p-3 text-left active:scale-95 transition">
<Thumb p={p} big/><div className="font-semibold text-sm leading-tight">{p.name}</div>
<div className="flex justify-between items-center mt-1"><b style={{color:set.accent}}>{peso(p.price)}</b><span className={"text-xs "+(p.stock<=5?"text-red-500":"mu")}>{p.stock} left</span></div></button>)}</div>
<div className="card p-3 space-y-2 mb-16"><b>Cart ({cart.reduce((a,c)=>a+c.qty,0)})</b>
{!cart.length&&<p className="mu text-sm">Tap a product to add.</p>}
{cart.map(c=><div key={c.id} className="flex items-center gap-2 text-sm"><span className="flex-1">{c.name}</span>
<button className="btn ghost px-3" onClick={()=>setCart(cart.map(x=>x.id===c.id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0))}>−</button><b>{c.qty}</b>
<button className="btn ghost px-3" onClick={()=>add(c)}>+</button><span className="w-20 text-right">{peso(c.price*c.qty)}</span></div>)}
{cart.length>0&&<><div className="flex items-center gap-2"><span className="mu text-sm">Discount ₱</span><input className="inp" inputMode="decimal" value={disc} onChange={e=>setDisc(e.target.value)} style={{width:110}}/></div>
<div className="flex justify-between text-lg font-bold"><span>Total</span><span>{peso(total)}</span></div>
<button className="btn w-full text-white" style={{background:set.accent}} onClick={()=>setPay(true)}>Checkout</button></>}</div>
{toast&&<div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 px-4 py-2 rounded-full text-white text-sm" style={{background:"#14161a"}}>{toast}</div>}
{scan&&<Scanner products={products} onCode={bySku} onClose={()=>setScan(false)}/>}
{pay&&<Checkout total={total} set={set} onDone={done} onClose={()=>setPay(false)} onSettings={role!=="Cashier"&&goSettings?()=>{setPay(false);goSettings()}:null}/>}
{rc&&<Receipt o={rc} set={set} onClose={()=>setRc(null)} rank={rank} up={up}/>}</div>;}

function Dashboard({orders,products,expenses,setExpenses,role,set,rank,up}){const[ex,setEx]=useState("");const own=role!=="Cashier";
const sales=orders.reduce((a,o)=>a+o.total,0),cogs=orders.reduce((a,o)=>a+o.cogs,0),exp=expenses.reduce((a,e)=>a+e.amt,0);const low=products.filter(p=>p.stock<=5);
const cnt=s=>orders.filter(o=>o.status===s).length;
const Stat=({l,v,c})=><div className="card p-3"><div className="mu text-xs">{l}</div><div className="text-xl font-bold" style={c?{color:c}:{}}>{v}</div></div>;
return <div className="p-3 space-y-3">
<div className="grid grid-cols-2 gap-2"><Stat l="Today’s Gross Sales" v={peso(sales)} c={set.accent}/>
{own?(rank>=1?<Stat l="True Net Profit" v={peso(sales-cogs-exp)} c={sales-cogs-exp<0?"#ef4444":undefined}/>:<button onClick={()=>up("True Net Profit Calculator")} className="card p-3 text-left"><div className="mu text-xs">True Net Profit</div><div className="font-bold flex items-center gap-1" style={{color:"#D97706"}}><Lock size={14}/> Upgrade</div></button>):<Stat l="Orders Today" v={orders.length}/>}</div>
<div className="grid grid-cols-3 gap-2"><Stat l="New" v={cnt("New")}/><Stat l="To Pack" v={cnt("To Pack")}/><Stat l="Completed" v={cnt("Completed")}/></div>
{own&&rank<1&&<button onClick={()=>up("Expense and Petty Cash Tracker")} className="card p-3 w-full text-left"><Lock size={14} className="inline -mt-0.5 mr-1.5" style={{color:"#D97706"}}/><b>Expense and Petty Cash Tracker</b><div className="mu text-xs">Negosyo Lite and up</div></button>}{own&&rank>=1&&<div className="card p-3 space-y-2"><div className="flex justify-between"><b>Expenses</b><b>{peso(exp)}</b></div>
<div className="mu text-xs">Net profit = sales − cost of goods ({peso(cogs)}) − expenses</div>
<div className="flex gap-2"><input className="inp" placeholder="Expense ₱ (rent, load…)" inputMode="decimal" value={ex} onChange={e=>setEx(e.target.value)}/><button className="btn text-white" style={{background:set.accent}} onClick={async()=>{if(+ex>0){if(live){try{await cloud.addExpense(+ex)}catch(e){return alert(e.message)}}setExpenses([...expenses,{amt:+ex}]);setEx("")}}}>Add</button></div></div>}
<div className="card p-3"><b className="flex items-center gap-1"><AlertTriangle size={16} style={{color:"#D97706"}}/> Low stock ({low.length})</b>{low.map(p=><div key={p.id} className="flex justify-between text-sm mt-1"><span>{p.name}</span><span className="text-red-500">{p.stock} left</span></div>)}{!low.length&&<p className="mu text-sm">All good.</p>}</div></div>;}

function Orders({orders,setOrders,set,rank,up}){const[t,setT]=useState("New");
const csv=()=>{if(rank<1)return up("Excel/CSV Export");const x="Order,Time,Method,Ref,Total\n"+orders.map(o=>[o.id,'"'+o.time+'"',o.method,o.ref,o.total].join(",")).join("\n");try{navigator.clipboard.writeText(x)}catch(e){}alert("CSV copied to clipboard. Paste it into Excel or Google Sheets.")};const[rc,setRc]=useState(null);const nxt={New:"To Pack","To Pack":"Completed"};
return <div className="p-3 space-y-3"><div className="flex justify-end"><button className="btn ghost text-xs" onClick={csv}>{rank<1&&<Lock size={13} className="inline -mt-0.5 mr-1.5" style={{color:"#D97706"}}/>}Export CSV</button></div><div className="flex gap-2">{["New","To Pack","Completed"].map(k=><button key={k} onClick={()=>setT(k)} className={"btn flex-1 text-sm "+(t===k?"text-white":"ghost")} style={t===k?{background:set.accent}:{}}>{k} ({orders.filter(o=>o.status===k).length})</button>)}</div>
{!orders.filter(o=>o.status===t).length&&<p className="mu text-center text-sm py-8">No {t} orders. Stock auto-deducts at checkout.</p>}
{orders.filter(o=>o.status===t).map(o=><div key={o.id} className="card p-3 text-sm space-y-1"><div className="flex justify-between"><b>#{o.id}</b><b>{peso(o.total)}</b></div>
<div className="mu">{o.items.map(i=>`${i.qty}× ${i.name}`).join(", ")}</div><div className="mu text-xs">{o.method}{o.ref?` · ${o.ref}`:""} · {o.time}</div>
<div className="flex gap-2 pt-1"><button className="btn ghost flex-1" onClick={()=>setRc(o)}>Receipt</button>
{nxt[o.status]&&<button className="btn flex-1 text-white" style={{background:set.accent}} onClick={async()=>{if(live){try{await cloud.setStatus(o.id,nxt[o.status])}catch(e){return alert(e.message)}}setOrders(orders.map(x=>x.id===o.id?{...x,status:nxt[o.status]}:x))}}>Mark {nxt[o.status]}</button>}</div></div>)}
{rc&&<Receipt o={rc} set={set} onClose={()=>setRc(null)} rank={rank} up={up}/>}</div>;}

function Thumb({p,big}){const u=(p.images&&p.images[0])||"";const sz=big?{}:{width:48,height:48};
return u?<img src={u} alt={p.name} loading="lazy" className={big?"w-full aspect-square object-cover rounded-lg mb-1":"object-cover rounded-lg shrink-0"} style={sz}/>
:<div className={"flex items-center justify-center rounded-lg shrink-0 "+(big?"aspect-square mb-1":"")} style={{background:"var(--bg)",...sz}}><Package size={big?32:24} color="#0F766E"/></div>}
const shrink=file=>new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{const sc=Math.min(1,600/img.width);const c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*sc));c.height=Math.max(1,Math.round(img.height*sc));const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?res(b):rej(new Error("Could not process image.")),"image/jpeg",0.8)};img.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("That file is not a valid image."))};img.src=u});
function Inventory({products,setProducts,role,set,rank,up}){const[f,setF]=useState(null);const lim=rank>=2?Infinity:rank===1?300:30;const cash=role==="Cashier";
const blank={sku:"",name:"",price:"",cost:"",stock:"",shopee:"",lazada:"",tiktok:"",images:[]};const[busy,setBusy]=useState(false);
const addPhoto=async e=>{const fl=e.target.files[0];e.target.value="";if(!fl||cash)return;if((f.images||[]).length>=3)return alert("You can add up to 3 photos.");const bad=await checkImage(fl);if(bad)return alert(bad);setBusy(true);try{const blob=await shrink(fl);const url=live?await cloud.uploadProductImage(blob):await new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(blob)});setF(cur=>({...cur,images:[...(cur.images||[]),url].slice(0,3)}))}catch(er){alert(er.message)}setBusy(false)};
const del=async p=>{if(!window.confirm(`Delete "${p.name}"? This cannot be undone.`))return;if(live){try{await cloud.deleteProduct(p.id)}catch(e){alert(e.message);return}}setProducts(products.filter(x=>x.id!==p.id))};
const save=async()=>{if(!f.name||!f.sku)return;const p={...f,name:clean(f.name,80),sku:clean(f.sku,40),shopee:clean(f.shopee,40),lazada:clean(f.lazada,40),tiktok:clean(f.tiktok,40),price:Math.max(0,+f.price||0),cost:Math.max(0,+f.cost||0),stock:Math.max(0,Math.floor(+f.stock||0))};if(live){try{await cloud.saveProduct(p);setProducts(await cloud.products())}catch(e){alert(e.message);return}}else setProducts(f.id?products.map(x=>x.id===f.id?p:x):[...products,{...p,id:Date.now()}]);setF(null)};
const fld=(k,l,type)=><label className="block text-xs mu">{l}<input className="inp mt-1" type={type||"text"} value={f[k]} disabled={cash&&(k==="stock"||k==="cost")} onChange={e=>setF({...f,[k]:["price","cost","stock"].includes(k)?e.target.value:strip(e.target.value,k==="name"?80:40)})}/></label>;
return <div className="p-3 space-y-2"><div className="flex justify-between items-center"><b>Master Inventory ({products.length}/{lim===Infinity?"∞":lim})</b><button className="btn text-white" style={{background:set.accent}} onClick={()=>products.length>=lim?up("Product limit reached ("+lim+" SKUs)"):setF(blank)}>+ Product</button></div>
{products.map(p=><div key={p.id} className="card p-3 flex items-center gap-3"><Thumb p={p}/>
<div className="flex-1 text-sm"><div className="font-semibold">{p.name}</div><div className="mu text-xs">{p.sku}{p.shopee&&" · Shopee "+p.shopee}{p.lazada&&" · Lazada "+p.lazada}{p.tiktok&&" · TikTok "+p.tiktok}</div>
<div className="text-xs">{peso(p.price)}{!cash&&<span className="mu"> · cost {peso(p.cost)}</span>} · <span className={p.stock<=5?"text-red-500":""}>{p.stock} in stock</span></div></div>
<div className="flex gap-2"><button className="btn ghost" onClick={()=>setF({...p,images:p.images||[]})}>{cash?"View":"Edit"}</button>{!cash&&<button aria-label="Delete product" className="btn ghost" style={{color:"#DC2626",borderColor:"#FCA5A5"}} onClick={()=>del(p)}><Trash2 size={16}/></button>}</div></div>)}
{f&&<Modal title={f.id?"Product":"New Product"} onClose={()=>setF(null)}><div className="space-y-2">
<div><div className="flex justify-between text-xs mu"><span>Product photos</span><span>{(f.images||[]).length}/3</span></div>
<div className="grid grid-cols-3 gap-2 mt-1">{(f.images||[]).map((u,i)=><div key={u} className="relative"><img src={u} alt={"Product photo "+(i+1)} className="w-full aspect-square object-cover rounded-lg" style={{border:"1px solid var(--bd)"}}/>{!cash&&<button type="button" aria-label="Remove photo" className="absolute top-1 right-1 rounded-full p-1 text-white" style={{background:"#0F172A"}} onClick={()=>setF({...f,images:f.images.filter((_,k)=>k!==i)})}><X size={12}/></button>}</div>)}
{!cash&&(f.images||[]).length<3&&<label className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs mu cursor-pointer" style={{border:"1px dashed var(--bd)"}}><ImagePlus size={22}/>{busy?"Uploading...":"Add photo"}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={addPhoto} disabled={busy}/></label>}</div>
<p className="mu text-xs mt-1">JPG, PNG or WebP, up to 2MB each. Photos are resized to save data.</p></div>{fld("name","Name")}{fld("sku","SKU / Barcode")}{fld("price","Selling price ₱","number")}
{!cash&&fld("cost","Cost price (COGS) ₱","number")}{!cash&&fld("stock","Stock count","number")}
<div className="mu text-xs pt-1">Marketplace SKU mapping</div>{fld("shopee","Shopee SKU")}{fld("lazada","Lazada SKU")}{fld("tiktok","TikTok Shop SKU")}
{cash&&<p className="mu text-xs">Cashiers can’t edit stock counts or see costs.</p>}
<button disabled={cash} className="btn w-full text-white disabled:opacity-40" style={{background:set.accent}} onClick={save}>Save</button></div></Modal>}</div>;}

function Settings({set,setSet}){const up=async e=>{const fl=e.target.files[0];if(!fl)return;const bad=await checkImage(fl);if(bad){alert(bad);e.target.value="";return}const r=new FileReader();r.onload=async()=>{if(live){try{setSet({...set,qr:await cloud.uploadSellerQr(r.result)})}catch(e){alert(e.message)}}else setSet({...set,qr:r.result})};r.readAsDataURL(fl)};
const f=(k,l)=><label className="block text-xs mu">{l}<input className="inp mt-1" value={set[k]} onChange={e=>setSet({...set,[k]:strip(e.target.value,120)})}/></label>;
return <div className="p-3 space-y-3"><b>Store Customization</b><div className="card p-3 space-y-2"><label className="block text-xs mu"><span className="flex justify-between"><span>Store name</span><span>{set.name.length}/30</span></span><input className="inp mt-1" maxLength={30} value={set.name} onChange={e=>setSet({...set,name:strip(e.target.value,30)})}/></label>{f("addr","Branch address")}{f("phone","Contact number")}{f("tin","TIN / VAT note")}{f("foot","Receipt footer")}
<label className="block text-xs mu">Brand accent color<input type="color" className="block mt-1" value={set.accent} onChange={e=>setSet({...set,accent:e.target.value})} style={{width:60,height:36}}/></label>
<div className="text-xs mu">Thermal paper width<div className="flex gap-2 mt-1">{["58","80"].map(w=><button key={w} onClick={()=>setSet({...set,paper:w})} className={"btn flex-1 "+(set.paper===w?"text-white":"ghost")} style={set.paper===w?{background:set.accent}:{}}>{w}mm</button>)}</div></div></div>
<div className="card p-3 space-y-2"><b className="text-sm">Payment QR Code (QR Ph / GCash / Maya)</b>{set.qr&&<img src={set.qr} alt="Your payment QR" style={{maxHeight:200}} className="rounded-lg"/>}
<input type="file" accept="image/jpeg,image/png,image/webp" onChange={up} className="text-sm"/><p className="mu text-xs">Shown to customers at POS checkout when they pay by QR.</p></div></div>;}

let lastPay=0;
const PL={free:{n:"Free Starter",m:0,y:0,r:0,f:["30 products/SKUs","Unlimited POS checkout and QR scan","Basic payment QR display","1 Owner login (1 branch)","Basic daily sales total","Watermarked receipts"]},
lite:{n:"Negosyo Lite",m:199,y:1990,r:1,f:["300 products/SKUs","Customer “Utang” ledger + 1-tap reminder copy","Expense and Petty Cash tracker","True Net Profit (COGS)","Unbranded receipts","Excel/CSV export"]},
pro:{n:"Pro Seller",m:499,y:4990,r:2,pop:1,f:["Everything in Negosyo Lite","Unlimited products + bulk CSV/Excel import","Up to 5 staff/cashier accounts","Shift close and Z-Reading","Activity and void anti-theft log","Shopee / Lazada / TikTok order and SKU sync","Dead stock alerts"]},
multi:{n:"Multi-Branch",m:999,y:9990,r:3,f:["Everything in Pro Seller","Up to 3 branches/warehouses + stock transfers","Up to 15 staff/cashier accounts","Consolidated multi-branch profit report"]}};
const ADD=[{k:"add-branch",n:"Extra Branch",a:250,u:"/mo"},{k:"add-staff",n:"Extra 5 Staff Logins",a:150,u:"/mo"},{k:"add-dfy",n:"Done-For-You Product Upload",a:500,u:" one-time"}];
const fmtD=d=>new Date(d).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"});

function Upgrade({reason,onClose,store,rank,payments,setPayments,adminQr}){
const[ann,setAnn]=useState(false);const[key,setKey]=useState(null);const[ref,setRef]=useState("");const[shot,setShot]=useState("");const[sent,setSent]=useState(false);const[cp,setCp]=useState(false);
const opts=[...Object.entries(PL).filter(([k])=>k!=="free").flatMap(([k,p])=>[{key:k+"-m",label:p.n+" (Monthly)",amt:p.m,plan:k,days:30},{key:k+"-y",label:p.n+" (Annual)",amt:p.y,plan:k,days:365}]),...ADD.map(a=>({key:a.k,label:a.n,amt:a.a,plan:null,days:30}))];
const o=opts.find(x=>x.key===key);
const upl=async e=>{const fl=e.target.files[0];if(!fl)return;const bad=await checkImage(fl);if(bad){alert(bad);e.target.value="";return}const r=new FileReader();r.onload=()=>setShot(r.result);r.readAsDataURL(fl)};
const copy=()=>{try{navigator.clipboard.writeText("+639692692760")}catch(e){}setCp(true);setTimeout(()=>setCp(false),1500)};
const submit=async()=>{const w=Math.ceil((lastPay+60000-Date.now())/1000);if(w>0)return alert("Please wait "+w+"s before submitting another payment proof.");lastPay=Date.now();if(live){try{await cloud.submitPayment({o,ref,shot})}catch(e){return alert(e.message.includes("reference")?"That reference number was already used.":e.message)}setSent(true);return}setPayments([{id:Date.now(),store,storeId:"me",item:o.label,plan:o.plan,days:o.days,amt:o.amt,ref,shot,status:"pending"},...payments]);setSent(true)};
if(sent)return <Modal title="Payment submitted" onClose={onClose}><div className="text-center space-y-2"><div className="flex justify-center"><CheckCircle2 size={48} color="#0F766E"/></div><p>Salamat! Your payment for <b>{o.label}</b> ({peso(o.amt)}) is <b>pending</b>.</p><p className="mu text-sm">The Super Admin will verify your reference number and activate your plan.</p><button className="btn w-full text-white" style={{background:"#0F766E"}} onClick={onClose}>Done</button></div></Modal>;
if(o)return <Modal title="Pay via QR Ph / Maya" onClose={onClose}><div className="space-y-3">
<button className="text-sm mu" onClick={()=>setKey(null)}><ArrowLeft size={14} className="inline -mt-0.5 mr-1.5"/>Back to plans</button>
{adminQr?<img src={adminQr} alt="PalawanPay QR Ph" className="mx-auto rounded-lg" style={{maxHeight:240}}/>:<div className="card p-5 text-center mu text-sm">PalawanPay QR Ph not uploaded yet. Super Admin can add it in the Admin tab.</div>}
<p className="mu text-xs text-center">Scan with PalawanPay, Maya, GCash, or any QR Ph bank app.</p>
<div className="card p-3 space-y-1 text-sm"><div className="mu text-xs">Maya / PalawanPay Number</div><div className="flex items-center justify-between"><b className="text-lg">+639692692760</b><button className="btn ghost" onClick={copy}>{cp?<><Check size={14} className="inline -mt-0.5 mr-1.5"/>Copied</>:<><Copy size={14} className="inline -mt-0.5 mr-1.5"/>Copy Number</>}</button></div><div className="mu text-xs">Account Name / Initials</div><b>R A B</b></div>
<label className="block text-xs mu">Plan / billing cycle<select className="inp mt-1" value={key} onChange={e=>setKey(e.target.value)}>{opts.map(x=><option key={x.key} value={x.key}>{x.label} – {peso(x.amt)}</option>)}</select></label>
<div className="card p-3 text-center"><div className="mu text-xs">AMOUNT TO PAY</div><div className="text-2xl font-bold">{peso(o.amt)}</div></div>
<label className="block text-xs mu">Transaction Reference Number<input className="inp mt-1" maxLength={40} value={ref} onChange={e=>setRef(e.target.value.replace(/[^A-Za-z0-9-]/g,"").slice(0,40))}/></label>
<label className="block text-xs mu">Payment Screenshot<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upl} className="block mt-1 text-sm"/></label>
{shot&&<img src={shot} alt="Payment screenshot" style={{maxHeight:120}} className="rounded-lg"/>}
<button disabled={ref.trim().length<4||!shot} className="btn w-full text-white disabled:opacity-40" style={{background:"#0F766E"}} onClick={submit}>Submit Payment</button></div></Modal>;
return <Modal title="Upgrade to A’s Negosyo POS" onClose={onClose}><div className="space-y-3">
{reason&&<div className="card p-2 text-sm"><Lock size={14} className="inline -mt-0.5 mr-1.5" style={{color:"#D97706"}}/><b>{reason}</b> needs a higher plan.</div>}
<div className="flex gap-2">{[["Monthly",false],["Annual (2 months free)",true]].map(([l,v])=><button key={l} onClick={()=>setAnn(v)} className={"btn flex-1 text-xs "+(ann===v?"text-white":"ghost")} style={ann===v?{background:"#0F766E"}:{}}>{l}</button>)}</div>
{Object.entries(PL).map(([k,p])=><div key={k} className="card p-3 space-y-1" style={p.pop?{borderColor:"#D97706",borderWidth:2}:{}}>
{p.pop&&<span className="text-xs font-bold inline-flex items-center gap-1" style={{color:"#D97706"}}><Star size={12} fill="#D97706"/> MOST POPULAR</span>}
<div className="flex justify-between items-baseline"><b>{p.n}</b><span><b className="text-lg">₱{(ann?p.y:p.m).toLocaleString("en-PH")}</b><span className="mu text-xs">{p.m?(ann?"/yr":"/mo"):"/mo"}</span></span></div>
<ul className="text-xs mu list-disc pl-4">{p.f.map(f=><li key={f}>{f}</li>)}</ul>
{k!=="free"?<button disabled={p.r<rank} className={"btn w-full disabled:opacity-40 mt-1 "+(p.pop?"":"text-white")} style={{background:p.pop?"#D97706":"#0F766E",color:p.pop?"#0F172A":undefined}} onClick={()=>setKey(k+(ann?"-y":"-m"))}>{p.r===rank?"Renew":"Choose"} {p.n}</button>:<div className="text-xs mu">{rank===0?"Your current plan":"Included"}</div>}</div>)}
<b className="text-sm">Optional Add-Ons</b>
{ADD.map(a=><div key={a.k} className="card p-3 flex items-center justify-between text-sm"><span>{a.n}<div className="mu text-xs">₱{a.a}{a.u}</div></span><button className="btn ghost" onClick={()=>setKey(a.k)}>Buy</button></div>)}</div></Modal>;}

function PlansTab({plan,exp,rank,up}){const[m,setM]=useState("");
const F=[["Customer “Utang” Ledger",1],["Bulk CSV/Excel Import",2],["Shift Close and Z-Reading",2],["Activity and Void Anti-Theft Log",2],["Shopee / Lazada / TikTok Sync",2],["Dead Stock Alerts",2],["Branch Stock Transfers",3],["Consolidated Multi-Branch Report",3]];
return <div className="p-3 space-y-3"><div className="card p-3"><div className="mu text-xs">CURRENT PLAN</div><div className="text-xl font-bold">{PL[plan].n}</div>{exp&&<div className="mu text-sm">Expires {fmtD(exp)}</div>}
<button className="btn w-full text-white mt-2" style={{background:"#0F766E"}} onClick={()=>up("")}>Upgrade to A’s Negosyo POS</button></div>
<b>Features</b>{F.map(([n,r])=><button key={n} onClick={()=>rank<r?up(n):setM(n+" is unlocked on your plan (full module comes in a later build).")} className="card p-3 w-full flex justify-between text-sm text-left"><span>{n}</span><span className="inline-flex items-center gap-1">{rank<r?<><Lock size={13} style={{color:"#D97706"}}/>{["","Lite","Pro","Multi-Branch"][r]}</>:<Check size={16} color="#0F766E"/>}</span></button>)}
{m&&<p className="mu text-xs">{m}</p>}</div>;}

function Admin({stores,setStores,payments,setPayments,adminQr,setAdminQr}){
const eff=s=>s.expires&&new Date(s.expires)<new Date()?"free":s.plan;
const upl=async e=>{const fl=e.target.files[0];if(!fl)return;const bad=await checkImage(fl);if(bad){alert(bad);e.target.value="";return}const r=new FileReader();r.onload=async()=>{if(live){try{setAdminQr(await cloud.setAdminQr(r.result))}catch(e){alert(e.message)}}else setAdminQr(r.result)};r.readAsDataURL(fl)};
const act=async(p,days,ok)=>{if(live){try{await (ok?cloud.approve(p.id,days):cloud.reject(p.id));setPayments(await cloud.payments());setStores(await cloud.stores())}catch(e){alert(e.message)}return}setPayments(payments.map(x=>x.id===p.id?{...x,status:ok?"approved":"rejected"}:x));if(ok&&p.plan)setStores(ss=>ss.map(s=>s.id===p.storeId?{...s,plan:p.plan,expires:new Date(Date.now()+days*864e5).toISOString()}:s))};
const pend=payments.filter(p=>p.status==="pending"),rest=payments.filter(p=>p.status!=="pending");
return <div className="p-3 space-y-3"><b className="flex items-center gap-1"><ShieldCheck size={18}/> Super Admin</b>
<div className="card p-3 space-y-2"><b className="text-sm">PalawanPay QR Ph (shown at upgrade checkout)</b>{adminQr&&<img src={adminQr} alt="PalawanPay QR Ph" style={{maxHeight:180}} className="rounded-lg"/>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upl} className="text-sm"/><p className="mu text-xs">Uploaded QR Ph image is shown to users at plan upgrade checkout.</p></div>
<b className="text-sm">Pending payments ({pend.length})</b>{!pend.length&&<p className="mu text-sm">Nothing to review.</p>}
{pend.map(p=><div key={p.id} className="card p-3 space-y-2 text-sm"><div><b>{p.store}</b><div>{p.item} · {peso(p.amt)}</div><div className="mu text-xs">Ref: {p.ref}</div></div>{p.shot&&<img src={p.shot} alt="Payment screenshot" style={{maxHeight:160}} className="rounded-lg"/>}
{p.plan?<div className="flex gap-2"><button className="btn flex-1 text-white text-xs" style={{background:"#0F766E"}} onClick={()=>act(p,30,true)}>Approve and Activate (30 Days)</button><button className="btn flex-1 text-white text-xs" style={{background:"#0F766E"}} onClick={()=>act(p,365,true)}>(365 Days)</button></div>:<button className="btn w-full text-white" style={{background:"#0F766E"}} onClick={()=>act(p,30,true)}>Approve add-on</button>}
<button className="btn w-full ghost text-red-500" onClick={()=>act(p,0,false)}>Reject</button></div>)}
{rest.map(p=><div key={p.id} className="card p-2 text-xs flex justify-between"><span>{p.store} · {p.item}</span><b style={{color:p.status==="approved"?"#0F766E":"#ef4444"}}>{p.status}</b></div>)}
<b className="text-sm">Registered stores ({stores.length})</b>
{stores.map(s=><div key={s.id} className="card p-3 text-sm flex justify-between items-center"><div><b>{s.name}</b><div className="mu text-xs">{PL[eff(s)].n}{s.expires?" · expires "+fmtD(s.expires):""}</div></div>{s.expires&&<button className="btn ghost text-xs" onClick={()=>setStores(ss=>ss.map(x=>x.id===s.id?{...x,expires:new Date(Date.now()-1000).toISOString()}:x))}>Simulate expiry</button>}</div>)}
<p className="mu text-xs">Expired paid plans revert to Free Starter automatically.</p></div>;}

function ResetPassword({onDone}){const[a,setA]=useState("");const[b,setB]=useState("");const[err,setErr]=useState("");const[busy,setBusy]=useState(false);
const e1=!a?"":!/[A-Z]/.test(a)?"Add at least 1 UPPERCASE letter.":!/[^A-Za-z0-9\s]/.test(a)?"Add at least 1 special character (!@#$%^&*).":"";const ok=a&&!e1&&a===b;
const save=async()=>{setBusy(true);setErr("");try{await cloud.updatePassword(a);await onDone()}catch(e){setErr(friendly(e));setBusy(false)}};
return <div className="p-5 max-w-sm mx-auto pt-8"><div className="text-center mb-5"><img src="/logo-full.png" alt="A’s Negosyo PH" className="w-32 h-32 mx-auto rounded-2xl object-contain" /><h1 className="text-2xl font-bold mt-2">A’s Negosyo POS</h1></div>
<div className="card p-4 space-y-3"><b>Reset Password</b>
<PwField label="New Password" value={a} onChange={setA} maxLength={8} ac="new-password"/>{e1&&<div className="text-xs text-red-500">{e1}</div>}
<PwField label="Confirm New Password" value={b} onChange={setB} maxLength={8} ac="new-password"/>{b&&a!==b&&<div className="text-xs text-red-500">Passwords do not match.</div>}
<p className="mu text-xs">Max 8 characters, with 1 uppercase letter and 1 special character.</p>{err&&<div className="text-sm text-red-500">{err}</div>}
<button disabled={!ok||busy} className="btn w-full text-white disabled:opacity-40" style={{background:"#0F766E"}} onClick={save}>Save New Password</button></div></div>}

function App(){const[role,setRole]=useState("Owner");const[authed,setAuthed]=useState(false);const[tab,setTab]=useState("Dashboard");
const[products,setProducts]=useState(live?[]:seed);const[orders,setOrders]=useState([]);const[expenses,setExpenses]=useState([]);const[set,setSet]=useState(defSet);
const[stores,setStores]=useState([{id:"me",name:"",plan:"free",expires:null},{id:2,name:"Kuya Jun Sari-sari",plan:"pro",expires:new Date(Date.now()+20*864e5).toISOString()},{id:3,name:"Ate Mel Online Shop",plan:"lite",expires:new Date(Date.now()+5*864e5).toISOString()}]);
const[payments,setPayments]=useState([]);const[users,setUsers]=useState([]);const[adminQr,setAdminQr]=useState("");const[upg,setUpg]=useState(null);
const cash=role==="Cashier";const[adminOk,setAdminOk]=useState(false);const isAdmin=live?adminOk:role==="Super Admin";const me=stores.find(x=>x.id==="me");const plan=me.plan,exp=me.expires;PLAN=plan;const rank=PL[plan].r;const up=r=>setUpg(r||"");
const tabs=[["Dashboard",LayoutDashboard],["POS",ReceiptIcon],["Orders",Package],["Inventory",Tag],...(cash?[]:[["Settings",SettingsIcon],["Plans",Gem]]),...(isAdmin?[["Admin",ShieldCheck]]:[])];
useEffect(()=>{const t=()=>setStores(ss=>ss.some(x=>x.expires&&new Date(x.expires)<new Date())?ss.map(x=>x.expires&&new Date(x.expires)<new Date()?{...x,plan:"free",expires:null}:x):ss);t();const i=setInterval(t,4000);return()=>clearInterval(i)},[]);
useEffect(()=>{if((cash&&(tab==="Settings"||tab==="Plans"))||(!isAdmin&&tab==="Admin"))setTab("Dashboard")},[role,isAdmin]);
const[pre,setPre]=useState(false);const[recovery,setRecovery]=useState(()=>live&&/type=recovery/.test(window.location.hash));const[notice,setNotice]=useState("");
const wipe=()=>{setAuthed(false);setProducts(live?[]:seed);setOrders([]);setExpenses([]);setPayments([]);setAdminQr("");setUpg(null);setRole("Owner");setAdminOk(false);setTab("Dashboard");setSet(defSet);setStores([{id:"me",name:"",plan:"free",expires:null}])};
const refresh=async()=>{try{const d=await cloud.loadAll();if(!d){setAuthed(false);return}if(!d.profile){setPre(true);setAuthed(false);return}
setRole(d.profile.role==="super_admin"?"Super Admin":d.profile.role==="cashier"?"Cashier":"Owner");setProducts(d.products);setOrders(d.orders);setExpenses(d.expenses);setSet(d.set);setStores(d.stores);setPayments(d.payments);setAdminQr(d.adminQr);setAdminOk(d.profile.role==="super_admin");setPre(false);setAuthed(true)}catch(e){setAuthed(false)}};
useEffect(()=>{if(!live)return;refresh();const{data:l}=sb.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT")wipe();else if(ev==="PASSWORD_RECOVERY")setRecovery(true);else if(ev==="SIGNED_IN")setTimeout(refresh,0)});return()=>l.subscription.unsubscribe()},[]);
useEffect(()=>{if(!live||!authed||role==="Cashier")return;const t=setTimeout(()=>cloud.saveStore(set).catch(()=>{}),900);return()=>clearTimeout(t)},[set]);
if(recovery&&live)return <ResetPassword onDone={async()=>{await cloud.logout();wipe();setRecovery(false);setNotice("Password updated. Please log in with your new password.");window.history.replaceState(null,"",window.location.pathname)}}/>;
return <div className="max-w-xl mx-auto min-h-screen pb-20">
<div className="sticky top-0 z-40 px-3 py-2 flex items-center gap-2" style={{background:"var(--card)",borderBottom:"1px solid var(--bd)"}}>
<b className="flex-1 text-sm" style={{color:set.accent}}><img src="/logo.png" alt="A’s Negosyo PH" className="w-6 h-6 rounded-full object-cover inline -mt-0.5 mr-1.5" />A’s Negosyo POS</b>
{live||import.meta.env.PROD?<span className="text-xs mu">{role}</span>:<select className="inp" style={{width:130,padding:"6px 8px"}} value={role} onChange={e=>setRole(e.target.value)} aria-label="Demo role"><option>Owner</option><option>Cashier</option><option>Super Admin</option></select>}
{authed&&<button className="btn ghost py-1" onClick={async()=>{if(live)await cloud.logout();wipe()}}>Out</button>}</div>
{!authed?<Auth pre={pre} notice={notice} role={role} users={users} setUsers={setUsers} onIn={u=>{if(live){refresh();return}if(u&&u.shop)setSet(x=>({...x,name:u.shop}));setAuthed(true)}}/>:<>
<div className="px-3 pt-2 text-xs mu">Plan: <b>{PL[plan].n}</b>{exp?" · expires "+fmtD(exp):""}{plan==="free"&&!cash&&<button className="ml-2 font-bold" style={{color:"#D97706"}} onClick={()=>up("")}>Upgrade</button>}</div>
{tab==="Dashboard"&&<Dashboard {...{orders,products,expenses,setExpenses,role,set,rank,up}}/>}
{tab==="POS"&&<POS {...{products,setProducts,orders,setOrders,set,role,rank,up,goSettings:()=>setTab("Settings")}}/>}
{tab==="Orders"&&<Orders {...{orders,setOrders,set,rank,up}}/>}
{tab==="Inventory"&&<Inventory {...{products,setProducts,role,set,rank,up}}/>}
{tab==="Settings"&&!cash&&<Settings {...{set,setSet}}/>}
{tab==="Plans"&&!cash&&<PlansTab {...{plan,exp,rank,up}}/>}
{tab==="Admin"&&isAdmin&&<Admin {...{stores:stores.map(x=>x.id==="me"?{...x,name:set.name}:x),setStores,payments,setPayments,adminQr,setAdminQr}}/>}
{upg!==null&&<Upgrade {...{reason:upg,onClose:()=>setUpg(null),store:set.name,rank,payments,setPayments,adminQr}}/>}
<nav className="fixed bottom-0 left-0 right-0 z-40" style={{background:"var(--card)",borderTop:"1px solid var(--bd)",paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
<div className="max-w-xl mx-auto flex">{tabs.map(([t,Ic])=><button key={t} onClick={()=>setTab(t)} className="flex-1 py-2 text-xs" style={{color:tab===t?set.accent:"var(--mu)",fontWeight:tab===t?700:400}}><Ic size={20} className="mx-auto mb-0.5"/>{t}</button>)}</div></nav></>}
</div>;}
function ConfigError(){return <div className="card p-5 m-5 max-w-md mx-auto mt-16"><h1 className="text-lg font-bold">Setup required</h1><p className="mu text-sm mt-2">{envProblem||"This app is missing its Supabase configuration."}</p><p className="mu text-sm mt-2">In Vercel, open Settings, then Environment Variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (anon key only), then redeploy.</p></div>}
export default function Root(){if(import.meta.env.PROD&&!live)return <ConfigError/>;return <App/>}
