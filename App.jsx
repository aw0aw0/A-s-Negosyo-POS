import {useState,useMemo,useEffect,useRef} from "react";
import {Html5Qrcode} from "html5-qrcode";
import {LayoutDashboard,Receipt as ReceiptIcon,Package,Tag,Settings as SettingsIcon,Gem,ShieldCheck,Store,ScanLine,Mail,Lock,Printer,Check,X,ArrowLeft,AlertTriangle,CheckCircle2,Star,Eye,EyeOff,Copy,Camera} from "lucide-react";
import {sb,live,cloud,envProblem,strip,clean,checkImage} from "./cloud.js";
const peso=n=>"₱"+Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const seed=[
{id:1,sku:"SKU-001",name:"Kape 3-in-1 (box)",price:120,cost:85,stock:40,shopee:"SP-KAPE",lazada:"",tiktok:"",category:"Beverages",unit:"box",description:"",image_url:""},
{id:2,sku:"SKU-002",name:"Dried Mangoes 200g",price:150,cost:95,stock:25,shopee:"SP-MANGO",lazada:"LZ-MANGO",tiktok:"",category:"Snacks",unit:"pack",description:"",image_url:""},
{id:3,sku:"SKU-003",name:"Barong Tee",price:450,cost:260,stock:12,shopee:"",lazada:"",tiktok:"TT-BAR",category:"Apparel",unit:"pc",description:"",image_url:""},
{id:4,sku:"SKU-004",name:"Tote Bag Abaca",price:299,cost:150,stock:6,shopee:"SP-TOTE",lazada:"",tiktok:"",category:"Apparel",unit:"pc",description:"",image_url:""},
{id:5,sku:"SKU-005",name:"Coco Soap",price:85,cost:40,stock:60,shopee:"",lazada:"LZ-SOAP",tiktok:"",category:"General",unit:"pc",description:"",image_url:""},
{id:6,sku:"SKU-006",name:"Bagoong Jar",price:110,cost:70,stock:3,shopee:"",lazada:"",tiktok:"",category:"Snacks",unit:"bottle",description:"",image_url:""}];
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
const friendly=e=>/rate|limit|429|too many|seconds/i.test((e&&e.message)||"")?"Too many requests. Please wait a minute and try again.":((e&&e.message)||"Something went wrong. Please try again.");
const RESERVED=["admin","owner","cashier","demo","superadmin"];

function PwField({label,value,onChange,maxLength,ac}){const[v,setV]=useState(false);const[fo,setFo]=useState(false);const show=fo||value.length>0;
return <div><div className="text-xs mu">{label}</div><div className="relative mt-1">
<input aria-label={label} className="inp" style={{paddingRight:show?46:12}} placeholder={label} type={v?"text":"password"} maxLength={maxLength} value={value} autoComplete={ac||"off"} onChange={e=>onChange(e.target.value)} onFocus={()=>setFo(true)} onBlur={()=>setFo(false)}/>
{show&&<button type="button" aria-label={v?"Hide password":"Show password"} onMouseDown={e=>e.preventDefault()} onClick={()=>setV(!v)} className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-2" style={{color:"var(--mu)"}}>{v?<EyeOff size={22}/>:<Eye size={22}/>}</button>}</div></div>}

function Auth({pre,role,users,setUsers,onIn}){
const[st,setSt]=useState("login");const[err,setErr]=useState("");
const[lid,setLid]=useState("");const[lpw,setLpw]=useState("");
const[em,setEm]=useState("");const[ch,setCh]=useState("");const[code,setCode]=useState("");const[inp,setInp]=useState("");
const[un,setUn]=useState("");const[pw,setPw]=useState("");const[pw2,setPw2]=useState("");const[shop,setShop]=useState("");const[prov,setProv]=useState("");
const[now,setNow]=useState(Date.now());useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[]);
const[until,setUntil]=useState(0);const[fails,setFails]=useState(0);const[lock,setLock]=useState(0);
const wait=Math.max(0,Math.ceil((until-now)/1000));const lockLeft=Math.max(0,Math.ceil((lock-now)/1000));
useEffect(()=>{if(pre&&(st==="login"||st==="signup")){setCh("oauth");setSt("creds")}},[pre]);
const G={background:"#0F766E"};
const reset=m=>{setSt("signup");setErr(m||"");setEm("");setCh("");setCode("");setInp("");setUn("");setPw("");setPw2("");setShop("");setProv("")};
const bad=()=>{const n=fails+1;setFails(n);if(n>=5)setLock(Date.now()+60000*Math.min(8,n-4));setErr("Incorrect username or password.")};
const login=async()=>{if(lockLeft>0)return setErr("Too many attempts. Try again in "+lockLeft+"s.");if(live){const r=await cloud.login(lid.trim(),lpw);if(r.error)return bad();setFails(0);setErr("");return onIn("live")}const k=lid.trim().toLowerCase();const u=users.find(u=>u.username.toLowerCase()===k||(u.email&&u.email.toLowerCase()===k));if(!u||u.pw!==lpw)return bad();setFails(0);setErr("");onIn(u)};
const send=async()=>{if(wait>0)return setErr("Please wait "+wait+"s before requesting another code.");if(live){try{await cloud.sendOtp("email",em.trim())}catch(e){return setErr(friendly(e))}}setUntil(Date.now()+60000);setCh("email");setCode(gen8());setInp("");setErr("");setSt("code")};
const emailOk=()=>{const m=validEmail(em.trim());if(m){setErr(m);return false}if(users.some(u=>u.email&&u.email.toLowerCase()===em.trim().toLowerCase())){setErr("This email is already registered.");return false}return true};
const startEmail=pv=>{if(!emailOk())return;setProv(pv);send()};
const verify=async()=>{let good=inp===code;if(live){try{await cloud.verifyOtp("email",em.trim(),inp);good=true}catch(e){good=false}}if(good){setErr("");setSt("creds")}else if(live){cloud.logout();reset("Wrong verification code. For your security, registration was restarted. Please start again.")}else reset("Wrong verification code. For your security, registration was restarted. Please start again.")};
const unOk=/^[a-zA-Z0-9]{1,8}$/.test(un);const taken=un&&(RESERVED.includes(un.toLowerCase())||users.some(u=>u.username.toLowerCase()===un.toLowerCase()));
const pwErr=!pw?"":!/[A-Z]/.test(pw)?"Add at least 1 UPPERCASE letter.":!/[^A-Za-z0-9\s]/.test(pw)?"Add at least 1 special character (!@#$%^&*).":"";
const match=pw.length>0&&pw===pw2;const credOk=unOk&&!taken&&pw&&!pwErr&&match;
const finish=async()=>{const u={username:un,pw,email:em.trim(),shop:clean(shop,30),provider:prov};if(live){try{await cloud.claim(un,clean(shop,30),pw)}catch(e){const m=String(e.message||e);setSt("creds");return setErr(m.includes("username")?"That username is already taken.":m)}}else setUsers([...users,u]);onIn(u)};
const Btn=({children,onClick,dis,ghost})=><button disabled={dis} onClick={onClick} className={"btn w-full disabled:opacity-40 "+(ghost?"ghost":"text-white")} style={ghost?{}:G}>{children}</button>;
const Err=()=>err?<div className="text-sm text-red-500">{err}</div>:null;
const Back=()=><button className="text-sm mu" onClick={()=>reset("")}><ArrowLeft size={14} className="inline -mt-0.5 mr-1.5"/>Back to sign-up options</button>;
return <div className="p-5 max-w-sm mx-auto pt-8">
<div className="text-center mb-5"><div className="flex justify-center"><Store size={48} color="#0F766E"/></div><h1 className="text-2xl font-bold mt-2">A’s Negosyo POS</h1><p className="mu text-sm">POS at inventory para sa Pinoy sellers</p></div>
<div className="card p-4 space-y-3">
{st==="login"&&<><b>Log In</b><input className="inp" placeholder={live?"Email":"Username or email"} value={lid} onChange={e=>setLid(e.target.value)}/><PwField label="Password" value={lpw} onChange={setLpw} ac="current-password"/><Err/>
<Btn onClick={login}>Log In</Btn><Btn ghost onClick={()=>reset("")}>Create an account</Btn>
{!live&&<button className="text-sm mu w-full" onClick={()=>onIn(null)}>Skip to demo store as {role}</button>}</>}
{st==="signup"&&<><b>Create your account</b><Err/>
<button className="btn ghost w-full" onClick={()=>{if(live)return cloud.oauth("google");setErr("");setEm("");setSt("google")}}><b style={{color:"#4285F4"}}>G</b> Continue with Google</button>
<button className="btn ghost w-full" onClick={()=>{setErr("");setEm("");setSt("email")}}><Mail size={18} className="inline -mt-0.5 mr-1.5"/>Use Other Email</button>
<button className="text-sm mu w-full" onClick={()=>{setErr("");setSt("login")}}>Already have an account? Log In</button></>}
{st==="google"&&<><Back/><b>Google account</b><p className="mu text-xs">Demo of <code>supabase.auth.signInWithOAuth({`{provider:"google"}`})</code>. Enter the account email to simulate the sign-in.</p>
<input className="inp" type="email" placeholder="you@gmail.com" value={em} onChange={e=>setEm(e.target.value)}/><Err/>
<Btn onClick={()=>startEmail("Google")}>Continue (email verification)</Btn></>}
{st==="email"&&<><Back/><b>Sign up with email</b><input className="inp" type="email" placeholder="you@example.com" value={em} onChange={e=>setEm(e.target.value)}/><p className="mu text-xs">Disposable or fake email addresses are blocked.</p><Err/><Btn onClick={()=>startEmail("Email")}>Send 6-digit code</Btn></>}
