(function(){
'use strict';

/* ---------- helpers ---------- */
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-3);
const clone=o=>JSON.parse(JSON.stringify(o));
const ICONS={
  code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
  check:'<path d="M5 12l5 5L20 7"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  back:'<path d="M15 6l-6 6 6 6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/>'
};
const ic=(n,s)=>{s=s||18;return n==='play'?`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8V4z"/></svg>`:`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||''}</svg>`};
const fmtDate=t=>{try{return new Date(t).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}catch(e){return ''}};
const stars=n=>{n=Math.round(n)||0;return `<span class="stars" role="img" aria-label="${n} out of 5">${'★'.repeat(n)}${'☆'.repeat(5-n)}</span>`};
function rich(t){return String(t||'').split(/\n{2,}/).filter(Boolean).map(p=>{const e=esc(p).replace(/`([^`]+)`/g,'<code>$1</code>');if(/^- /.test(p))return '<ul>'+e.split('\n').map(l=>'<li>'+l.replace(/^- /,'')+'</li>').join('')+'</ul>';return '<p>'+e.replace(/\n/g,'<br>')+'</p>'}).join('')}
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},3200)}

/* ---------- site content defaults ---------- */
const DEF_SETTINGS={
  brand:'BuildLab',
  currency:'$',
  heroBadge:'Built for engineers',
  heroTitle:'Learn AI engineering by building real things.',
  heroSub:'Short lessons, hands-on labs you run in the browser, and a community to ask questions. Go from how LLMs work to shipping full websites and apps with AI.',
  tracksEyebrow:'Learning tracks',
  tracksTitle:'Three tracks. One path from prompt to product.',
  tracksSub:'Take them in order, or jump to the one you need. Every track ends with a project you can ship.',
  methodTitle:'Read it. Run it. Discuss it. Ship it.',
  projectsTitle:'Build things worth putting in a portfolio.',
  catalogTitle:'Pick a course. Or take the whole path.',
  catalogSub:'Start free with the foundations. Buy a course when you are ready to build agents, RAG systems and full sites with AI.',
  ctaTitle:'Start with your first lab today.',
  ctaSub:'Pick a track, run your first code, and leave a comment on any lesson.'
};
const SETTING_FIELDS=[
  ['brand','Site name'],['currency','Currency symbol'],['heroBadge','Hero badge'],['heroTitle','Hero heading'],['heroSub','Hero text','area'],
  ['tracksEyebrow','Tracks label'],['tracksTitle','Tracks heading'],['tracksSub','Tracks text','area'],
  ['methodTitle','How-it-works heading'],['projectsTitle','Projects heading'],
  ['catalogTitle','Courses page heading'],['catalogSub','Courses page text','area'],
  ['ctaTitle','Closing banner heading'],['ctaSub','Closing banner text','area']
];
const TRACKS={
  foundations:{name:'AI Foundations',no:'Track 01',level:'Beginner',blurb:'The mental models behind modern AI, so you can reason about what these systems can and cannot do.',pts:['How LLMs actually work','Tokens, embeddings, context','Data skills for AI work','Judging model output']},
  genai:{name:'Generative AI',no:'Track 02',level:'Intermediate',blurb:'Design, evaluate and ship LLM features: from prompts to retrieval, agents and guardrails.',pts:['Prompt design and structured output','RAG pipelines and vector search','Agents and tool use','Evals, safety and cost control'],hl:1},
  build:{name:'Build with AI',no:'Track 03',level:'All levels',blurb:'Use AI as your pair-programmer to design, build and deploy real websites and mobile apps.',pts:['Prompt-to-UI workflows','AI coding assistants in practice','Auth, data and APIs','Deploy, test and iterate']}
};
const PROJECTS=[
  ['GENERATIVE AI','Chatbot over your own documents','Chunk, embed and retrieve, then answer with citations.',['JavaScript','Vector search','RAG']],
  ['GENERATIVE AI','Support-ticket triage agent','An agent that reads tickets, calls tools and routes them with evals.',['Agents','Tool use','Evals']],
  ['BUILD WITH AI','Marketing site from a prompt','Generate, refine and deploy a responsive site, then review it for accessibility.',['HTML','CSS','Deploy']],
  ['BUILD WITH AI','Mobile app with an AI backend','Ship a cross-platform app with auth, a database and an LLM-powered feature.',['Mobile','Auth','API']]
];
const T=(name,expr)=>({name,expr});
const R=String.raw;
const DEF_COURSES=[
 {id:'llms',title:'How LLMs actually work',track:'foundations',level:'Beginner',price:0,published:true,summary:'Tokens, attention, context windows and why models sometimes get things wrong.',lessons:[
  {id:'l1',type:'lesson',preview:true,minutes:9,title:'Tokens and context windows',content:'A language model never sees your text as words. It sees tokens: small pieces of text, often a word or part of a word. Every model has a context window, the maximum number of tokens it can read and write in one go.\n\nThis matters in practice. Long prompts cost more, slow responses down, and can push important instructions out of the window.\n\nKey ideas:\n- Text is split into tokens before the model reads it\n- The context window limits input and output together\n- Shorter, clearer prompts usually work better'},
  {id:'l2',type:'lab',minutes:15,title:'Lab: Count your tokens',content:'Real tokenizers are learned from data, but you can build a simple one to get a feel for it. Write countTokens so it counts lowercase words, treating punctuation as a separator. An apostrophe stays inside a word, so "it\'s" is one token.',hint:'Use a regular expression such as /[a-z0-9\']+/g on the lowercased text, and return the number of matches (or 0 when there are none).',starter:R`function countTokens(text) {
  // TODO: count the words in text (lowercase, ignore punctuation)
  return 0;
}

console.log(countTokens("Hello, world!"));`,tests:[T('counts two words',R`countTokens("Hello, world!")===2`),T('empty text is zero',R`countTokens("")===0`),T('keeps apostrophes inside words',R`countTokens("It's a test, a test.")===5`)]},
  {id:'l3',type:'lesson',minutes:8,title:'Why models get things wrong',content:'Models predict likely text. They do not look facts up. When a question sits outside what the model has seen, it can still produce a fluent answer that is wrong. This is often called hallucination.\n\nYou can reduce it by giving the model the facts it needs in the prompt, asking it to say when it is unsure, and checking important answers yourself.'}]},
 {id:'data',title:'Data skills for AI engineers',track:'foundations',level:'Beginner',price:0,published:true,summary:'The JSON, text and data handling you need for model APIs. Nothing more.',lessons:[
  {id:'l1',type:'lesson',preview:true,minutes:8,title:'JSON is the language of model APIs',content:'Almost every model API takes JSON in and returns JSON out. Being fluent with objects, arrays and nested fields saves hours of debugging.\n\nWhen a response is large, pick only the fields you need before logging, storing or sending it on.'},
  {id:'l2',type:'lab',minutes:12,title:'Lab: Pick fields from an object',content:'Write pick(obj, keys). It returns a new object containing only the listed keys that exist on obj. Keys that are missing are skipped.',hint:'Loop over keys and copy a key only when it is in obj, for example with Object.prototype.hasOwnProperty.call or the in operator.',starter:R`function pick(obj, keys) {
  const out = {};
  // TODO: copy only the listed keys that exist on obj
  return out;
}

console.log(pick({ a: 1, b: 2, c: 3 }, ["a", "c"]));`,tests:[T('keeps listed keys',R`JSON.stringify(pick({a:1,b:2,c:3},["a","c"]))==='{"a":1,"c":3}'`),T('skips missing keys',R`Object.keys(pick({a:1},["z"])).length===0`),T('does not change the input',R`(function(){const o={a:1,b:2};pick(o,["a"]);return Object.keys(o).length===2})()`)]},
  {id:'l3',type:'lesson',minutes:7,title:'Cleaning text before you embed it',content:'Embeddings capture meaning, but they also capture noise. Strip navigation text, repeated headers and stray markup before you split documents into chunks.\n\nClean input gives you cleaner search results later.'}]},
 {id:'prompts',title:'Prompt design in practice',track:'genai',level:'Beginner to intermediate',price:19,published:true,summary:'Structured output, few-shot patterns and prompts you can test and version.',lessons:[
  {id:'l1',type:'lesson',preview:true,minutes:10,title:'Anatomy of a good prompt',content:'A strong prompt states the task, lists constraints, and shows an example or two of the output you want. Treat it like a small spec.\n\nKey ideas:\n- Say what the model should do before how\n- Put constraints in a list, one per line\n- Examples teach format better than adjectives'},
  {id:'l2',type:'lab',minutes:20,title:'Lab: Build a prompt template',content:'Write buildPrompt({ task, constraints, examples }). It returns a string with a "# Task" section, then a "# Constraints" section (one "- " line per constraint) only when there are constraints, then an "# Examples" section only when there are examples. Each example has an input and an output and is written as "Input: ..." and "Output: ..." lines. Separate sections with a blank line.',hint:'Start with let out = "# Task\\n" + task, then append the other sections only when their arrays are not empty.',starter:R`function buildPrompt({ task, constraints = [], examples = [] }) {
  // TODO: add the Constraints and Examples sections
  return "# Task\n" + task;
}

console.log(buildPrompt({ task: "Summarize the text", constraints: ["Be brief"] }));`,tests:[T('starts with the task',R`buildPrompt({task:"Summarize"}).startsWith("# Task\nSummarize")`),T('lists constraints as bullets',R`buildPrompt({task:"A",constraints:["Be brief","Use plain words"]}).includes("# Constraints\n- Be brief\n- Use plain words")`),T('omits empty constraints',R`!buildPrompt({task:"A"}).includes("# Constraints")`),T('formats examples',R`buildPrompt({task:"A",examples:[{input:"2+2",output:"4"}]}).includes("# Examples\nInput: 2+2\nOutput: 4")`)]},
  {id:'l3',type:'lesson',minutes:9,title:'Testing prompts like code',content:'Keep a small set of inputs with the output you expect, and run your prompt against them every time you change it. A prompt that passes ten checks is far easier to trust than one that looked good once.'}]},
 {id:'rag',title:'RAG systems from scratch',track:'genai',level:'Intermediate',price:29,published:true,summary:'Chunking, embeddings, retrieval and evals, ending in a chatbot with citations.',lessons:[
  {id:'l1',type:'lesson',preview:true,minutes:9,title:'What retrieval fixes (and does not)',content:'Retrieval-augmented generation looks up relevant text and gives it to the model along with the question. It helps with private or fresh facts. It does not fix a vague question or a badly written prompt.\n\nThe pipeline has four steps: split documents into chunks, turn chunks into embeddings, find the closest ones to the question, then answer using them.'},
  {id:'l2',type:'lab',minutes:25,title:'Lab: Chunking strategies',content:'Chunks that cut a sentence in half hurt retrieval. Add an overlap parameter to the chunker: each chunk starts size minus overlap characters after the previous one, and the last chunk ends at the end of the text.',hint:'Loop i from 0 while i < text.length, step by size - overlap, push text.slice(i, i + size), and stop once a chunk reaches the end of the text.',starter:R`function split(text, size = 10, overlap = 0) {
  const step = size - overlap;
  const chunks = [];
  // TODO: slide the window by step and collect chunks
  return chunks;
}

console.log(split("abcdefghijklmnopqrstuvwxyz", 10, 3));`,tests:[T('chunks are at most size',R`split("abcdefghijklmnopqrstuvwxyz",10,3).every(c=>c.length<=10)`),T('first chunk',R`split("abcdefghijklmnopqrstuvwxyz",10,3)[0]==="abcdefghij"`),T('second chunk starts 7 characters in',R`split("abcdefghijklmnopqrstuvwxyz",10,3)[1]==="hijklmnopq"`),T('last chunk reaches the end',R`split("abcdefghijklmnopqrstuvwxyz",10,3).slice(-1)[0].endsWith("z")`),T('works with no overlap',R`split("abcdef",3,0).join("")==="abcdef"`)]},
  {id:'l3',type:'lab',minutes:25,title:'Lab: Rank by similarity',content:'Retrieval compares the question embedding with each chunk embedding. Cosine similarity measures the angle between two vectors: 1 means the same direction, 0 means unrelated. Write cosine(a, b).',hint:'Cosine is the dot product of a and b divided by the length of a times the length of b.',starter:R`function cosine(a, b) {
  // TODO: dot product divided by the product of the lengths
  return 0;
}

console.log(cosine([1, 2, 3], [2, 4, 6]));`,tests:[T('same direction is 1',R`Math.abs(cosine([1,0],[1,0])-1)<1e-9`),T('perpendicular is 0',R`Math.abs(cosine([1,0],[0,1]))<1e-9`),T('scale does not matter',R`Math.abs(cosine([1,2,3],[2,4,6])-1)<1e-9`)]},
  {id:'l4',type:'lesson',minutes:10,title:'Evaluating retrieval',content:'Write down 20 questions and the chunk that should answer each. Measure how often the right chunk appears in the top three results. That number is your hit rate, and it tells you whether a change to chunking or embeddings actually helped.'}]},
 {id:'agents',title:'Building AI agents',track:'genai',level:'Advanced',price:39,published:true,summary:'Tool use, planning loops, memory and guardrails for agents you can trust.',lessons:[
  {id:'l1',type:'lesson',preview:true,minutes:10,title:'The agent loop',content:'An agent is a loop. The model decides on an action, your code runs the matching tool, the result goes back to the model, and the loop repeats until the model gives a final answer.\n\nThe model never runs anything itself. Your code is always in control of what actually happens.'},
  {id:'l2',type:'lab',minutes:25,title:'Lab: Dispatch a tool call',content:'Write runTool(tools, call). tools is an object of functions, and call looks like { name, args } with args as an array. Return { ok: true, result } on success. For an unknown tool return { ok: false, error: "Unknown tool: NAME" }. If the tool throws, return { ok: false, error: the error message }.',hint:'Check whether tools[call.name] is a function, then call it inside try and catch with ...call.args.',starter:R`function runTool(tools, call) {
  // TODO: find the tool, run it, and return the result object
  return { ok: false, error: "Not implemented" };
}

console.log(runTool({ add: (a, b) => a + b }, { name: "add", args: [2, 3] }));`,tests:[T('runs a tool',R`runTool({add:(a,b)=>a+b},{name:"add",args:[2,3]}).result===5`),T('reports success',R`runTool({add:(a,b)=>a+b},{name:"add",args:[2,3]}).ok===true`),T('rejects unknown tools',R`runTool({},{name:"nope",args:[]}).error==="Unknown tool: nope"`),T('catches tool errors',R`runTool({boom:()=>{throw new Error("bad")}},{name:"boom",args:[]}).error==="bad"`)]},
  {id:'l3',type:'lesson',minutes:9,title:'Guardrails you can trust',content:'Limit which tools an agent can call, cap how many loop steps it may take, and require approval before anything that cannot be undone, such as sending email or spending money. Log every tool call so you can see what happened.'}]},
 {id:'website',title:'Ship a website with AI',track:'build',level:'All levels',price:24,published:true,summary:'Prompt, refine, review for accessibility and deploy a real responsive site.',lessons:[
  {id:'l1',type:'lesson',preview:true,minutes:9,title:'From prompt to page',content:'Start with a clear brief: who the site is for, the one thing it should do, and the sections you need. Generate a first version, then refine it in small steps rather than rewriting the whole prompt.\n\nAlways read the code you are given. You are the reviewer.'},
  {id:'l2',type:'lab',minutes:15,title:'Lab: Escape HTML',content:'Never put user text into a page unescaped. Write escapeHtml(str) so it replaces & with &amp;, < with &lt;, > with &gt;, double quote with &quot; and single quote with &#39;.',hint:'Chain replace calls, and handle the ampersand first so you do not escape your own output.',starter:R`function escapeHtml(str) {
  // TODO: replace & < > " and ' with their HTML entities
  return str;
}

console.log(escapeHtml("<b>Tom & Jerry</b>"));`,tests:[T('escapes tags and ampersands',R`escapeHtml("<b>Tom & Jerry</b>")==="&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;"`),T('escapes double quotes',R`escapeHtml('say "hi"')==="say &quot;hi&quot;"`),T('escapes single quotes',R`escapeHtml("it's")==="it&#39;s"`)]},
  {id:'l3',type:'lesson',minutes:8,title:'Review for accessibility',content:'Check that every control can be reached with the keyboard, every image has a text alternative, and text has enough contrast against its background. Run these checks on every AI-generated page before you publish it.'}]}
];

/* ---------- storage layer (shared db when available, else this browser) ---------- */
const Store=(()=>{
  let db=null,mode='local';
  let data={};try{data=JSON.parse(localStorage.getItem('bl_data')||'{}')}catch(e){}
  const L={};
  const save=()=>{try{localStorage.setItem('bl_data',JSON.stringify(data))}catch(e){}};
  const fire=c=>{(L[c]||[]).slice().forEach(f=>f())};
  const listen=(c,f)=>{(L[c]=L[c]||[]).push(f);setTimeout(f,0);return()=>{L[c]=(L[c]||[]).filter(x=>x!==f)}};
  return{
    get mode(){return mode},
    async init(){try{const d=await(window.claude&&window.claude.use?window.claude.use('db'):null);if(d){db=d;mode='db'}}catch(e){}},
    empty(c){return !data[c]||!Object.keys(data[c]).length},
    col(c,cb){
      if(db)return db.collection(c).onSnapshot(s=>cb(s.docs.map(d=>Object.assign({},d.data(),{id:d.id})),!!(s.metadata&&s.metadata.fromCache)),()=>{});
      return listen(c,()=>cb(Object.entries(data[c]||{}).map(([id,v])=>Object.assign({},v,{id}))));
    },
    doc(c,id,cb){
      if(db)return db.doc(c+'/'+id).onSnapshot(s=>cb(s.exists?s.data():null,!!(s.metadata&&s.metadata.fromCache)),()=>{});
      return listen(c,()=>cb((data[c]||{})[id]||null));
    },
    async put(c,id,obj){
      const body=clone(obj);delete body.id;
      if(db){await db.doc(c+'/'+id).set(body);return}
      (data[c]=data[c]||{})[id]=body;save();fire(c);
    },
    async del(c,id){
      if(db){await db.doc(c+'/'+id).delete();return}
      if(data[c])delete data[c][id];save();fire(c);
    }
  };
})();

/* ---------- state ---------- */
const S={
  ready:false,settings:Object.assign({},DEF_SETTINGS),courses:[],feedback:[],comments:[],purchases:[],progress:{done:{}},certs:[],certsLoaded:false,certBusy:{},adminRef:null,adminRefLoaded:false,adminUnlocked:false,attempts:0,lockUntil:0,
  user:null,role:'user',pendingRole:'user',canEdit:false,authMode:'login',flash:'',filter:'all',adminTab:'courses',
  draft:null,openLesson:null,armed:null,modal:null,code:{},labRes:{},hintShown:{},fbFilter:'all',seeded:false
};
const app=$('#app');
let pending=false;
function queueRender(){
  const a=document.activeElement;
  if(a&&app.contains(a)&&/^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName)){pending=true;return}
  render();
}
document.addEventListener('focusout',()=>{if(pending){setTimeout(()=>{const a=document.activeElement;if(!(a&&app.contains(a)&&/^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName))){pending=false;render()}},0)}});

/* ---------- accounts (kept in this browser) ---------- */
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const accounts=()=>{try{return JSON.parse(lsGet('bl_accounts','[]'))}catch(e){return[]}};
async function hashPw(salt,pw){
  try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pw));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
  catch(e){let h=0;const s=salt+pw;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return 'x'+h}
}
async function register(name,email,pw){
  name=name.trim();email=email.trim().toLowerCase();
  if(name.length<2)return'Enter your name.';
  if(!/^\S+@\S+\.\S+$/.test(email))return'Enter a valid email address.';
  if(pw.length<6)return'Use a password with at least 6 characters.';
  const all=accounts();
  if(all.some(a=>a.email===email))return'An account with this email already exists. Log in instead.';
  const salt=uid(),acc={id:uid(),name,email,salt,hash:await hashPw(salt,pw)};
  all.push(acc);lsSet('bl_accounts',JSON.stringify(all));
  setUser(acc);return'';
}
async function login(email,pw){
  email=email.trim().toLowerCase();
  const acc=accounts().find(a=>a.email===email);
  if(!acc||acc.hash!==await hashPw(acc.salt,pw))return'Email or password is not correct.';
  setUser(acc);return'';
}
function setUser(acc){S.user={id:acc.id,name:acc.name,email:acc.email};lsSet('bl_session',acc.id);S.role='user';S.pendingRole='user';lsSet('bl_role','user');subProgress()}
function logout(){S.user=null;S.role='user';S.adminUnlocked=false;lsSet('bl_session','');lsSet('bl_role','user');subProgress();go('#home')}
async function refHash(salt,code){
  const enc=new TextEncoder(),k=await crypto.subtle.importKey('raw',enc.encode(code),'PBKDF2',false,['deriveBits']);
  const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:150000,hash:'SHA-256'},k,256);
  return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
}
/* A certificate is issued automatically once every lesson of a course is complete. */
function checkCerts(){
  if(!S.user||!S.certsLoaded||S.role==='admin')return;
  for(const c of S.courses){
    if(c.published===false||!c.lessons.length||pct(c)<100)continue;
    const id=S.user.id+'_'+c.id;
    if(S.certs.some(x=>x.id===id)||S.certBusy[id])continue;
    S.certBusy[id]=1;
    Store.put('certificates',id,{acct:S.user.id,name:S.user.name,courseId:c.id,courseTitle:c.title,at:Date.now(),serial:'BL-'+uid().toUpperCase().slice(0,8)})
      .then(()=>toast('Course complete! Your certificate is ready in Achievements.'))
      .catch(()=>{delete S.certBusy[id]});
  }
}
let unProg=null;
function subProgress(){
  if(unProg){unProg();unProg=null}
  S.progress={done:{}};
  if(S.user)unProg=Store.doc('progress',S.user.id,d=>{S.progress=d&&d.done?d:{done:{}};checkCerts();queueRender()});
}

/* ---------- derived ---------- */
const course=id=>S.courses.find(c=>c.id===id);
const isAdmin=()=>S.role==='admin'&&S.canEdit&&S.adminUnlocked;
const owns=c=>!!S.user&&S.purchases.some(p=>p.acct===S.user.id&&p.courseId===c.id);
const free=c=>!(Number(c.price)>0);
const canAccess=(c,l)=>!!S.user&&(isAdmin()||free(c)||owns(c)||!!l.preview);
const price=c=>free(c)?'Free':S.settings.currency+Number(c.price);
const done=(c,l)=>!!(S.progress.done&&S.progress.done[c.id+'_'+l.id]);
const doneCount=c=>c.lessons.filter(l=>done(c,l)).length;
const pct=c=>c.lessons.length?Math.round(doneCount(c)/c.lessons.length*100):0;
const visible=()=>S.courses.filter(c=>c.published!==false||isAdmin()).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)||a.title.localeCompare(b.title));
const fbFor=id=>S.feedback.filter(f=>f.courseId===id).sort((a,b)=>b.at-a.at);
const avg=id=>{const f=fbFor(id);return f.length?f.reduce((s,x)=>s+Number(x.rating||0),0)/f.length:0};
const labCount=c=>c.lessons.filter(l=>l.type==='lab').length;
const myCert=c=>S.user?S.certs.find(x=>x.acct===S.user.id&&x.courseId===c.id):null;

/* ---------- routing ---------- */
const go=h=>{if(location.hash===h)render();else location.hash=h};
function route(){
  const h=(location.hash||'#home').slice(1);
  let m;
  if((m=h.match(/^c-([a-z0-9]+)$/)))return{n:'course',id:m[1]};
  if((m=h.match(/^l-([a-z0-9]+)-([a-z0-9]+)$/)))return{n:'lesson',cid:m[1],lid:m[2]};
  if((m=h.match(/^cert-([a-z0-9]+)$/)))return{n:'cert',id:m[1]};
  return{n:['home','courses','login','role','dashboard','admin'].includes(h)?h:'home'};
}

/* ---------- shared pieces ---------- */
function nav(r){
  const u=S.user;
  const home=r.n==='home';
  return `<header class="top"><div class="wrap bar">
    <a class="brand" href="#home"><span class="logo">${ic('code',17)}</span>${esc(S.settings.brand)}</a>
    <nav class="links" aria-label="Main">
      <a href="#courses" class="${r.n==='courses'?'on':''}">Courses</a>
      ${home?`<button class="lnk" data-act="scroll" data-v="method">How it works</button>`:`<a href="#home">Home</a>`}
      ${u?`${isAdmin()?`<a href="#admin" class="${r.n==='admin'?'on':''}">Admin</a>`:`<a href="#dashboard" class="${r.n==='dashboard'?'on':''}">My learning</a>`}
        ${S.canEdit?`<span class="pill">${isAdmin()?'Admin':'Student'}</span>`:''}
        ${S.canEdit?`<a href="#role">Switch role</a>`:''}
        <button class="lnk" data-act="logout">Log out</button>`
      :`<a href="#login" data-act="to-login" data-v="login">Log in</a>
        <a class="btn primary sm" href="#login" data-act="to-login" data-v="register">Start free</a>`}
    </nav></div></header>`;
}
function footer(){
  return `<footer class="foot"><div class="wrap"><span class="mono" style="color:var(--fg)">${esc(S.settings.brand)}</span><span>© ${new Date().getFullYear()} ${esc(S.settings.brand)}</span></div></footer>`;
}
function courseCard(c){
  const own=owns(c);
  return `<a class="card ccard" href="#c-${c.id}">
    <div class="row" style="justify-content:space-between"><span class="mono" style="font-size:12px;color:var(--cyan)">${esc((TRACKS[c.track]||{}).name||c.track).toUpperCase()}</span>
    ${own?'<span class="chip ac">Owned</span>':free(c)?'<span class="chip ac">Free</span>':`<span class="chip" style="color:var(--fg)">${esc(price(c))}</span>`}${c.published===false?'<span class="chip">Hidden</span>':''}${myCert(c)?'<span class="chip cy">Completed</span>':''}</div>
    <h3>${esc(c.title)}</h3><p class="muted" style="font-size:14px">${esc(c.summary)}</p>
    <div class="ft"><span>${esc(c.level)}</span><span>${c.lessons.length} lessons · ${labCount(c)} labs</span></div></a>`;
}
function emptyCatalog(){
  return `<div class="empty"><h3>No courses yet</h3><p>${S.canEdit?'Add the first course from the admin area, or load the sample courses.':'The admin has not published any courses yet. Check back soon.'}</p>
  ${S.canEdit?`<div class="row" style="justify-content:center"><button class="btn primary" data-act="seed">Load sample courses</button></div>`:''}</div>`;
}

/* ---------- views ---------- */
function homeView(){
  const s=S.settings,cs=visible();
  return `<div class="wrap hero"><div>
      <div class="badge"><i></i>${esc(s.heroBadge)}</div>
      <h1>${esc(s.heroTitle)}</h1><p class="lead">${esc(s.heroSub)}</p>
      <div class="row" style="margin-bottom:28px">
        <a class="btn primary" style="min-height:52px;padding:0 26px" href="${S.user?'#courses':'#login'}" ${S.user?'':'data-act="to-login" data-v="register"'}>Start learning ${ic('arrow')}</a>
        <a class="btn" style="min-height:52px;padding:0 26px" href="#courses">Browse courses</a></div>
      <div class="row" style="gap:10px">${Object.values(TRACKS).map(t=>`<span class="chip">${esc(t.name)}</span>`).join('')}</div>
    </div>
    <div><div class="win"><div class="h"><i></i><i></i><i></i><span style="margin-left:10px">lab · chunking strategies</span></div>
      <pre><span style="color:var(--cyan)">function</span> <span style="color:var(--accent)">split</span>(text, size, overlap) {
  <span style="color:var(--cyan)">const</span> step = size - overlap;
  <span style="opacity:.8">// your turn: slide the window</span>
}</pre>
      <div class="h" style="border-top:1px solid var(--line);border-bottom:0;justify-content:space-between"><span class="ok">4 of 5 checks passing</span><span style="color:var(--cyan)">Run it in your browser</span></div></div></div></div>
  <section class="sec alt"><div class="wrap">
    <div class="eyebrow">${esc(s.tracksEyebrow)}</div><h2 class="big">${esc(s.tracksTitle)}</h2><p class="sub">${esc(s.tracksSub)}</p>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))">${Object.entries(TRACKS).map(([k,t])=>`
      <div class="card tcard ${t.hl?'hl':''}"><div class="row" style="justify-content:space-between"><span class="mono muted" style="font-size:13px">${esc(t.no.toUpperCase())}</span><span class="chip cy">${esc(t.level)}</span></div>
      <h3>${esc(t.name)}</h3><p class="muted">${esc(t.blurb)}</p><ul>${t.pts.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
      <button class="tlink" data-act="filter" data-v="${k}">View courses ${ic('arrow',16)}</button></div>`).join('')}</div></div></section>
  <section class="sec" id="method"><div class="wrap"><div class="eyebrow">How you learn</div><h2 class="big" style="margin-bottom:44px">${esc(s.methodTitle)}</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))">
      ${[['doc','1 · Short lessons','Focused written lessons you can finish in minutes. One idea at a time.'],['code','2 · Browser labs','Write and run code right on the page. No setup and no installs.'],['spark','3 · Check yourself','Automatic checks tell you whether your code works, and a hint is always one click away.'],['layers','4 · Real projects','Each track ends with something you can ship, plus comments and feedback from other learners.']].map(x=>`<div class="how"><span style="color:var(--accent)">${ic(x[0],28)}</span><h3>${x[1]}</h3><p class="muted">${x[2]}</p></div>`).join('')}</div></div></section>
  <section class="sec alt"><div class="wrap"><div class="eyebrow">Courses</div><h2 class="big" style="margin-bottom:36px">Popular right now</h2>
    ${cs.length?`<div class="grid">${cs.slice(0,3).map(courseCard).join('')}</div><div style="margin-top:28px"><a class="btn" href="#courses">See all courses ${ic('arrow',16)}</a></div>`:emptyCatalog()}</div></section>
  <section class="sec"><div class="wrap"><div class="eyebrow">Projects</div><h2 class="big" style="margin-bottom:44px">${esc(s.projectsTitle)}</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">${PROJECTS.map(p=>`<div class="card"><div class="mono" style="font-size:12px;color:var(--cyan);margin-bottom:14px">${p[0]}</div><h3 style="font-size:24px;margin-bottom:8px">${esc(p[1])}</h3><p class="muted" style="margin-bottom:18px">${esc(p[2])}</p><div class="row" style="gap:8px">${p[3].map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div></div>`).join('')}</div></div></section>
  <section class="sec"><div class="wrap"><div class="cta"><div style="flex:1 1 420px"><h2>${esc(s.ctaTitle)}</h2><p>${esc(s.ctaSub)}</p></div>
    <a class="btn" style="min-height:54px;padding:0 28px" href="${S.user?'#courses':'#login'}" ${S.user?'':'data-act="to-login" data-v="register"'}>${S.user?'Browse courses':'Create free account'} ${ic('arrow')}</a></div></div></section>`;
}

function coursesView(){
  const s=S.settings,all=visible(),list=all.filter(c=>S.filter==='all'||c.track===S.filter);
  return `<div class="wrap"><div class="pagehead"><div class="eyebrow">Courses</div><h1>${esc(s.catalogTitle)}</h1>
    <p class="muted" style="font-size:19px;max-width:640px;margin-bottom:30px">${esc(s.catalogSub)}</p>
    <div class="row" style="gap:10px" role="group" aria-label="Filter by track">
      <button class="filt ${S.filter==='all'?'on':''}" data-act="filter" data-v="all" aria-pressed="${S.filter==='all'}">All courses</button>
      ${Object.entries(TRACKS).map(([k,t])=>`<button class="filt ${S.filter===k?'on':''}" data-act="filter" data-v="${k}" aria-pressed="${S.filter===k}">${esc(t.name)}</button>`).join('')}</div></div>
    <div style="padding-bottom:90px">${list.length?`<div class="grid">${list.map(courseCard).join('')}</div>`:all.length?`<div class="empty"><h3>Nothing in this track yet</h3><p>Try another track.</p></div>`:emptyCatalog()}</div></div>`;
}

function courseView(id){
  const c=course(id);
  if(!c||(c.published===false&&!isAdmin()))return `<div class="wrap" style="padding-block:80px"><div class="empty"><h3>Course not found</h3><p>It may have been removed.</p><a class="btn" href="#courses">Back to courses</a></div></div>`;
  const own=owns(c),has=!!S.user&&(isAdmin()||free(c)||own),next=c.lessons.find(l=>!done(c,l))||c.lessons[0];
  const fb=fbFor(c.id),a=avg(c.id),t=TRACKS[c.track]||{name:c.track};
  const cert=myCert(c),certCard=cert?`<div class="card" style="margin-top:16px;border-color:var(--accent);display:grid;gap:12px"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="medal" style="width:42px;height:42px">${ic('shield',20)}</span><div><b>Achievement unlocked</b><div class="muted" style="font-size:13px">Course completed ${fmtDate(cert.at)}</div></div></div><a class="btn primary sm" href="#cert-${c.id}">View certificate</a></div>`:'';
  const side=`<div class="card">${has?`
      <div class="row" style="justify-content:space-between;margin-bottom:10px;font-size:14px"><b>Your progress</b><span class="mono muted" style="font-size:13px">${pct(c)}%</span></div>
      <div class="bar8" style="margin-bottom:20px"><i style="width:${pct(c)}%"></i></div>
      ${next?`<a class="btn primary" style="width:100%" href="#l-${c.id}-${next.id}">${ic('play',16)} ${doneCount(c)?'Continue':'Start'}: ${esc(next.title)}</a>`:''}`
    :`<div style="font:700 42px var(--display);letter-spacing:-.02em;margin-bottom:6px">${esc(price(c))}</div><p class="muted" style="margin-bottom:18px;font-size:14px">One-time purchase. Lifetime access to every lesson and lab.</p>
      ${S.user?`<button class="btn primary" style="width:100%" data-act="buy" data-v="${c.id}">Buy this course</button>`:`<a class="btn primary" style="width:100%" href="#login" data-act="to-login" data-v="register">Log in to buy</a>`}
      <p class="muted" style="font-size:13px;margin-top:12px;text-align:center">Lessons marked Preview are open to everyone with an account.</p>`}
    ${isAdmin()?`<button class="btn sm" style="width:100%;margin-top:14px" data-act="course-edit" data-v="${c.id}">${ic('edit',15)} Edit this course</button>`:''}</div>`;
  const fbForm=S.user?`<form data-form="feedback" data-cid="${c.id}" class="form" style="margin-top:18px">
      <label class="f"><span>Your rating</span><select class="in" name="rating" id="fb-rating"><option value="5">5 · Excellent</option><option value="4">4 · Good</option><option value="3">3 · Okay</option><option value="2">2 · Poor</option><option value="1">1 · Bad</option></select></label>
      <label class="f"><span>Your feedback</span><textarea class="in" name="text" id="fb-text" maxlength="1000" placeholder="What worked, and what could be better?" required></textarea></label>
      <div><button class="btn primary" type="submit">Send feedback</button></div></form>`
    :`<p class="muted" style="margin-top:14px"><a href="#login" data-act="to-login" data-v="login" style="color:var(--accent)">Log in</a> to leave feedback.</p>`;
  return `<div class="chead"><div class="wrap"><div class="main">
      <div class="crumb"><a href="#courses">Courses</a> / <span style="color:var(--fg)">${esc(c.title)}</span></div>
      <div class="row" style="gap:10px"><span class="chip cy">${esc(t.name)}</span><span class="chip">${esc(c.level)}</span>${a?`<span class="chip">${stars(a)} ${a.toFixed(1)} (${fb.length})</span>`:''}</div>
      <h1>${esc(c.title)}</h1><p class="muted" style="font-size:18px;max-width:640px;margin-bottom:24px">${esc(c.summary)}</p>
      <div class="row muted" style="gap:24px;font-size:14px"><span class="row" style="gap:8px">${ic('layers')}${c.lessons.length} lessons</span><span class="row" style="gap:8px">${ic('code')}${labCount(c)} hands-on labs</span></div>
    </div><div class="side">${side}${certCard}</div></div></div>
  <div class="wrap cols"><div class="l"><h2 style="font-size:28px;margin-bottom:22px">Curriculum</h2>
    <div class="mod">${c.lessons.length?c.lessons.map(l=>{const ok=canAccess(c,l),d=done(c,l);return `<a class="lrow" href="#l-${c.id}-${l.id}">
      ${d?`<span class="ok">${ic('check')}</span>`:ok?`<span style="color:var(--accent)">${ic(l.type==='lab'?'code':'play',17)}</span>`:`<span>${ic('lock')}</span>`}
      <span class="t">${esc(l.title)}${l.preview&&!free(c)?' <span class="chip" style="margin-left:6px;padding:4px 8px">Preview</span>':''}</span><small>${l.type==='lab'?'Lab':'Lesson'} · ${Number(l.minutes)||0} min</small></a>`}).join(''):`<div class="lrow">No lessons yet.</div>`}</div>
    <h2 style="font-size:28px;margin:56px 0 8px">Feedback</h2>
    <div class="row" style="gap:12px;margin-bottom:6px">${a?`${stars(a)}<span class="muted">${a.toFixed(1)} from ${fb.length} ${fb.length===1?'review':'reviews'}</span>`:'<span class="muted">No feedback yet. Be the first to share yours.</span>'}</div>
    ${fb.map(f=>`<div class="fb"><div class="row" style="justify-content:space-between;gap:8px"><b>${esc(f.name||'Learner')}</b>${stars(f.rating)}</div><p>${esc(f.text)}</p><span class="muted" style="font-size:12px">${fmtDate(f.at)}</span></div>`).join('')}
    ${fbForm}</div>
    <div class="r"><div class="card"><h3 style="font-size:19px;margin-bottom:14px">What you will do</h3><ul class="pts">${c.lessons.filter(l=>l.type==='lab').map(l=>`<li>${esc(l.title.replace(/^Lab:\s*/,''))}</li>`).join('')||'<li>Learn through short lessons</li>'}</ul></div>
    <div class="card" style="display:flex;gap:14px;align-items:flex-start"><span style="color:var(--cyan)">${ic('spark',22)}</span><div><b>Discuss every lesson</b><p class="muted" style="font-size:14px;margin-top:4px">Ask questions and share what you built in the comments under each lesson.</p></div></div></div></div>`;
}

function lessonView(cid,lid){
  const c=course(cid);
  if(!c)return `<div class="wrap" style="padding-block:80px"><div class="empty"><h3>Course not found</h3><a class="btn" href="#courses">Back to courses</a></div></div>`;
  const i=c.lessons.findIndex(l=>l.id===lid);
  if(i<0){return `<div class="wrap" style="padding-block:80px"><div class="empty"><h3>Lesson not found</h3><a class="btn" href="#c-${c.id}">Back to course</a></div></div>`}
  const l=c.lessons[i],ok=canAccess(c,l),key=c.id+'_'+l.id,nx=c.lessons[i+1],pv=c.lessons[i-1];
  const outline=c.lessons.map(x=>{const a=canAccess(c,x),d=done(c,x);return `<a class="orow ${x.id===l.id?'cur':''}" href="#l-${c.id}-${x.id}" ${x.id===l.id?'aria-current="page"':''}>${d?`<span class="ok">${ic('check',16)}</span>`:a?`<span style="color:var(--accent)">${ic(x.type==='lab'?'code':'play',16)}</span>`:`<span>${ic('lock',16)}</span>`}<span>${esc(x.title)}</span></a>`}).join('');
  let center;
  if(!ok){
    center=`<div class="card" style="display:grid;gap:14px;justify-items:start"><span style="color:var(--accent)">${ic('lock',28)}</span><h2 style="font-size:26px">This lesson is part of the full course</h2><p class="muted">Buy ${esc(c.title)} for ${esc(price(c))} to unlock every lesson and lab.</p>
      <button class="btn primary" data-act="buy" data-v="${c.id}">Buy this course</button></div>`;
  }else{
    const isLab=l.type==='lab',code=S.code[key]!=null?S.code[key]:(lsGet('bl_code_'+S.user.id+'_'+key,null)||l.starter||''),res=S.labRes[key];
    let lab='';
    if(isLab){
      lab=`<div style="display:grid;gap:16px"><div class="pane"><div class="ph"><span>solution.js</span><span>JavaScript</span></div>
        <textarea class="code" id="code" data-key="${key}" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor">${esc(code)}</textarea></div>
        <div class="row"><button class="btn primary" data-act="run" data-v="run">${ic('play',16)} Run code</button><button class="btn" data-act="run" data-v="check">Run checks</button>
          <button class="btn ghost" data-act="hint">${S.hintShown[key]?'Hide hint':'Show hint'}</button><button class="btn ghost" data-act="reset">Reset code</button></div>
        ${S.hintShown[key]?`<div class="card" style="padding:16px;font-size:14px"><b style="color:var(--cyan)">Hint</b><p style="margin-top:6px">${esc(l.hint||'No hint for this lab.')}</p></div>`:''}
        <div class="two" style="gap:16px"><div class="pane"><div class="ph"><span>Output</span><span class="${res&&res.error?'bad':''}">${res?(res.running?'Running…':res.error?'Error':'Done'):'Not run yet'}</span></div>
          <pre>${res?esc((res.logs||[]).join('\n')||(res.error?'':'(no output)'))+(res.error?`<span class="bad">${esc(res.error)}</span>`:''):'Press Run code to see what your code prints.'}</pre></div>
        <div class="pane"><div class="ph"><span>Checks</span><span class="${res&&res.results&&res.results.length&&res.results.every(r=>r.ok)?'ok':''}">${res&&res.results&&res.results.length?res.results.filter(r=>r.ok).length+' of '+res.results.length+' passed':'Not run yet'}</span></div>
          <div style="padding:10px 14px">${res&&res.results&&res.results.length?res.results.map(r=>`<div class="test"><span class="${r.ok?'ok':'bad'}">${r.ok?ic('check',16):'✕'}</span><span>${esc(r.name)}${r.msg?`<br><span class="muted" style="font-size:12px">${esc(r.msg)}</span>`:''}</span></div>`).join(''):`<p class="muted" style="font-size:14px;padding:6px 0">${(l.tests||[]).length?'Press Run checks to test your solution.':'This lab has no automatic checks.'}</p>`}</div></div></div></div>`;
    }
    center=`<div><div class="eyebrow" style="margin-bottom:12px">${l.type==='lab'?'Lab':'Lesson'} · ${Number(l.minutes)||0} min</div><h1 style="font-size:clamp(26px,3.6vw,34px)">${esc(l.title)}</h1></div>
      <div class="prose">${rich(l.content)}</div>${lab}
      <div class="row" style="border-top:1px solid var(--line);padding-top:20px;justify-content:space-between">
        <div class="row">${pv?`<a class="btn" href="#l-${c.id}-${pv.id}">${ic('back',16)} Previous</a>`:''}
          ${done(c,l)?`<span class="chip ac">${ic('check',14)}&nbsp;Completed</span>`:`<button class="btn" data-act="complete">Mark as complete</button>`}</div>
        ${nx?`<a class="btn primary" href="#l-${c.id}-${nx.id}">Next lesson ${ic('arrow',16)}</a>`:`<a class="btn primary" href="#c-${c.id}">Finish course</a>`}</div>`;
  }
  const cm=S.comments.filter(x=>x.courseId===c.id&&x.lessonId===l.id).sort((a,b)=>a.at-b.at);
  const side=`<div class="row" style="gap:12px"><span class="logo" style="width:34px;height:34px">${ic('spark',18)}</span><div><b>Discussion</b><div class="muted" style="font-size:12px">${cm.length} ${cm.length===1?'comment':'comments'} on this lesson</div></div></div>
    <div>${cm.length?cm.map(x=>`<div class="cm"><div class="w"><span><b style="color:var(--fg)">${esc(x.name||'Learner')}</b> · ${fmtDate(x.at)}</span>${(S.user&&x.acct===S.user.id)||isAdmin()?`<button class="btn ghost sm" style="min-height:28px;padding:0 6px" data-act="cm-del" data-v="${x.id}" aria-label="Delete comment">${ic('trash',14)}</button>`:''}</div><p style="white-space:pre-wrap;word-break:break-word">${esc(x.text)}</p></div>`).join(''):'<p class="muted" style="font-size:14px">No comments yet. Ask a question or share your solution.</p>'}</div>
    ${S.user?`<form data-form="comment" data-cid="${c.id}" data-lid="${l.id}" style="display:grid;gap:10px"><label class="f"><span>Add a comment</span><textarea class="in" name="text" id="cm-text" maxlength="800" required placeholder="Write a comment"></textarea></label><div><button class="btn primary sm" type="submit">Post comment</button></div></form>`:`<p class="muted" style="font-size:14px"><a href="#login" data-act="to-login" data-v="login" style="color:var(--accent)">Log in</a> to comment.</p>`}`;
  return `<div class="wrap" style="padding-block:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:14px"><a href="#c-${c.id}" class="row muted" style="gap:6px">${ic('back',16)} ${esc(c.title)}</a><span style="color:var(--line2)">/</span><b>${esc(l.title)}</b>
    <div class="row" style="margin-left:auto;gap:12px;min-width:180px;flex:0 1 240px"><div class="bar8" style="flex:1"><i style="width:${pct(c)}%"></i></div><span class="mono muted" style="font-size:13px">${pct(c)}%</span></div></div>
    <div class="lshell"><aside class="o" aria-label="Course outline"><div class="mono muted" style="font-size:12px;padding:0 10px 12px">${esc(c.title.toUpperCase())}</div>${outline}</aside>
    <main class="m">${center}</main><aside class="c" aria-label="Discussion">${side}</aside></div>`;
}

function loginView(){
  const reg=S.authMode==='register';
  return `<div class="wrap"><div class="auth"><div class="eyebrow">${reg?'Create account':'Welcome back'}</div><h1 style="margin-top:12px">${reg?'Create your free account':'Log in to continue'}</h1>
    <p class="muted">${esc(S.flash||(reg?'Start with the free foundations courses.':'Pick up where you left off.'))}</p>
    <form class="form" data-form="auth" novalidate>
      ${reg?`<label class="f"><span>Name</span><input class="in" id="au-name" name="name" autocomplete="name" required></label>`:''}
      <label class="f"><span>Email</span><input class="in" id="au-email" name="email" type="email" autocomplete="email" required></label>
      <label class="f"><span>Password</span><input class="in" id="au-pw" name="pw" type="password" autocomplete="${reg?'new-password':'current-password'}" required minlength="6"></label>
      <div id="au-err" class="err" role="alert"></div>
      <button class="btn primary" type="submit">${reg?'Create account':'Log in'}</button>
    </form>
    <p class="muted" style="margin-top:18px">${reg?'Already have an account?':'New here?'} <button class="tlink" style="display:inline;padding:0" data-act="authmode" data-v="${reg?'login':'register'}">${reg?'Log in':'Create an account'}</button></p>
    <p class="muted" style="font-size:13px;margin-top:22px">Accounts are saved in this browser. Your progress, purchases, feedback and comments are saved to the shared site.</p></div></div>`;
}

function roleView(){
  const pr=S.pendingRole,has=!!S.adminRef,ld=S.adminRefLoaded;
  const form=pr==='admin'?`<form class="card form" data-form="adminlogin" style="margin-top:0">
    ${!ld?'<p class="muted">Checking admin settings…</p>':has?`<label class="f"><span>Admin reference code</span><input class="in" id="ad-code" name="code" type="password" autocomplete="off" required></label>`
    :`<p class="muted" style="font-size:14px">No reference code exists yet. Create one now. Every admin sign-in will ask for it.</p><label class="f"><span>Create reference code (at least 8 characters)</span><input class="in" id="ad-code" name="code" type="password" autocomplete="new-password" required minlength="8"></label><label class="f"><span>Repeat code</span><input class="in" id="ad-code2" name="code2" type="password" autocomplete="new-password" required></label>`}
    <div id="role-err" class="err" role="alert"></div><div><button class="btn primary" type="submit" ${ld?'':'disabled'}>Continue as admin ${ic('arrow')}</button></div></form>`
    :`<button class="btn primary" style="min-height:52px;padding:0 30px" data-act="role-go">Continue as student ${ic('arrow')}</button>`;
  return `<div class="wrap"><div class="auth" style="max-width:720px"><div class="eyebrow">Signed in as ${esc(S.user.name)}</div><h1 style="margin-top:12px">How do you want to continue?</h1>
    <p class="muted">Your account has edit access to this site, so you can also work as admin.</p>
    <div class="roles"><button class="role" data-act="role-pick" data-v="user" aria-pressed="${pr==='user'}"><h3><span style="color:var(--accent)">${ic('user',24)}</span>Student</h3><p class="muted">Browse and buy courses, learn, run code in labs, leave feedback and comment on lessons.</p></button>
    <button class="role" data-act="role-pick" data-v="admin" aria-pressed="${pr==='admin'}"><h3><span style="color:var(--cyan)">${ic('shield',24)}</span>Admin</h3><p class="muted">Add, edit and delete courses, read learner feedback and change the site headings. Needs the admin reference code.</p></button></div>
    ${form}</div></div>`;
}
function dashView(){
  const first=S.user.name.split(' ')[0],cs=visible();
  const mine=cs.filter(c=>owns(c)||(free(c)&&doneCount(c)>0));
  let cont=null;
  for(const c of mine){const l=c.lessons.find(x=>!done(c,x));if(l){cont={c,l};break}}
  if(!cont){const c=cs.find(x=>free(x));if(c&&c.lessons[0])cont={c,l:c.lessons.find(x=>!done(c,x))||c.lessons[0],fresh:true}}
  const more=cs.filter(c=>!mine.includes(c)).slice(0,4);
  const ach=S.certs.filter(x=>x.acct===S.user.id).sort((a,b)=>b.at-a.at);
  return `<div class="wrap dash"><div><div class="mono muted" style="font-size:13px;margin-bottom:8px">${new Date().toLocaleDateString(undefined,{weekday:'long'}).toUpperCase()}</div><h1>Welcome back, ${esc(first)}. Pick up where you left off.</h1></div>
    ${cont?`<div class="card" style="display:flex;flex-wrap:wrap;gap:24px;align-items:center"><div style="flex:1 1 360px;min-width:0"><div class="row" style="gap:10px;margin-bottom:14px"><span class="chip ac">${cont.fresh?'START HERE':'CONTINUE'}</span><span class="mono muted" style="font-size:13px">${esc(cont.c.title)}</span></div>
      <h2 style="font-size:28px;margin-bottom:8px">${esc(cont.l.title)}</h2>
      <div class="row" style="gap:14px;margin:18px 0 22px"><div class="bar8" style="flex:1"><i style="width:${pct(cont.c)}%"></i></div><span class="mono muted" style="font-size:13px">${pct(cont.c)}%</span></div>
      <a class="btn primary" href="#l-${cont.c.id}-${cont.l.id}">${ic('play',16)} ${cont.fresh?'Start learning':'Resume'}</a></div></div>`
    :`<div class="empty"><h3>No courses to continue yet</h3><a class="btn primary" href="#courses">Browse courses</a></div>`}
    <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:16px"><h3 style="font-size:19px">Achievements</h3><span class="chip cy">${ach.length} earned</span></div>${ach.length?`<div class="grid" style="gap:12px">${ach.map(x=>`<a class="li" href="#cert-${x.courseId}"><span class="medal" style="width:44px;height:44px">${ic('shield',20)}</span><div class="t"><b>${esc(x.courseTitle)}</b><div class="muted" style="font-size:13px">Completed ${fmtDate(x.at)} · View certificate</div></div>${ic('arrow',16)}</a>`).join('')}</div>`:'<p class="muted">Finish every lesson in a course to earn a certificate. It appears here automatically.</p>'}</div>
    <div class="two"><div class="card"><h3 style="font-size:19px;margin-bottom:18px">My courses</h3>${mine.length?`<div style="display:grid;gap:18px">${mine.map(c=>`<a href="#c-${c.id}" style="display:block"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b style="font-weight:500">${esc(c.title)}</b><span class="mono muted" style="font-size:13px">${pct(c)===100?'complete':pct(c)+'%'}</span></div><div class="bar8"><i style="width:${pct(c)}%"></i></div></a>`).join('')}</div>`:'<p class="muted">Courses you buy or start will show up here.</p>'}</div>
    <div><h3 style="font-size:19px;margin-bottom:16px">Explore more</h3>${more.length?`<div style="display:grid;gap:12px">${more.map(c=>`<a class="li" href="#c-${c.id}"><span class="logo" style="width:44px;height:44px;border-radius:10px;background:var(--panel2);color:var(--cyan)">${ic('layers',20)}</span><div class="t"><b>${esc(c.title)}</b><div class="muted" style="font-size:13px">${esc(c.level)} · ${esc(price(c))}</div></div>${ic('arrow',16)}</a>`).join('')}</div>`:'<p class="muted">You have joined every course.</p>'}</div></div></div>`;
}

/* ---------- certificates ---------- */
const fit=(t,max)=>Math.max(22,Math.min(max,Math.floor(1000/(Math.max(String(t).length,1)*0.56))));
function certSvg(x){
  const e=esc,f="font-family=\"Space Grotesk, Arial, sans-serif\" text-anchor=\"middle\"";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#0E1013"/><rect x="30" y="30" width="1140" height="790" rx="24" fill="none" stroke="#B8F04A" stroke-width="4"/>
<text x="600" y="140" ${f} font-size="32" font-weight="700" fill="#B8F04A">${e(S.settings.brand)}</text>
<text x="600" y="250" ${f} font-size="56" font-weight="700" fill="#ECEEF1">Certificate of Completion</text>
<text x="600" y="330" ${f} font-size="26" fill="#A0A9B6">This certifies that</text>
<text x="600" y="425" ${f} font-size="${fit(x.name,64)}" font-weight="700" fill="#ECEEF1">${e(x.name)}</text>
<text x="600" y="500" ${f} font-size="26" fill="#A0A9B6">has successfully completed</text>
<text x="600" y="580" ${f} font-size="${fit(x.courseTitle,44)}" font-weight="700" fill="#B8F04A">${e(x.courseTitle)}</text>
<text x="600" y="710" ${f} font-size="22" fill="#A0A9B6">Issued ${e(fmtDate(x.at))}  ·  Certificate ID ${e(x.serial)}</text></svg>`;
}
function certView(id){
  const cert=S.certs.find(x=>x.acct===S.user.id&&x.courseId===id),c=course(id);
  if(!cert)return `<div class="wrap" style="padding-block:80px"><div class="empty"><h3>No certificate yet</h3><p>Finish every lesson in the course to earn it.</p><a class="btn primary" href="${c?'#c-'+c.id:'#courses'}">${c?'Back to the course':'Browse courses'}</a></div></div>`;
  return `<div class="wrap dash"><a href="#dashboard" class="row muted" style="gap:6px">${ic('back',16)} Back to dashboard</a>
    <div class="cert"><span class="medal">${ic('shield',30)}</span><div class="eyebrow">${esc(S.settings.brand)} · Certificate of completion</div><p class="muted">This certifies that</p><div class="nm">${esc(cert.name)}</div><p class="muted">has successfully completed</p><div class="ct">${esc(cert.courseTitle)}</div>
    <p class="muted" style="font-size:14px">Issued ${fmtDate(cert.at)} · Certificate ID <span class="mono">${esc(cert.serial)}</span></p></div>
    <div class="row" style="justify-content:center"><button class="btn primary" data-act="cert-dl" data-v="${esc(id)}">Download certificate</button><a class="btn" href="#dashboard">Back to dashboard</a></div></div>`;
}

/* ---------- admin ---------- */
function adminView(){
  const tab=S.adminTab;
  return `<div class="wrap dash"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">Admin</div><h1 style="margin-top:10px">Manage ${esc(S.settings.brand)}</h1></div></div>
    <div class="tabs" role="tablist">${[['courses','Courses'],['feedback','Feedback & comments'],['site','Site headings']].map(t=>`<button role="tab" aria-selected="${tab===t[0]}" data-act="admin-tab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
    ${tab==='courses'?(S.draft?editorView():adminCourses()):tab==='feedback'?adminFeedback():adminSite()}</div>`;
}
function adminCourses(){
  const cs=visible(),ratings=S.feedback.length?(S.feedback.reduce((s,f)=>s+Number(f.rating||0),0)/S.feedback.length).toFixed(1):'–';
  return `<div class="stats"><div class="stat"><span class="muted" style="font-size:13px">Courses</span><b>${cs.length}</b></div><div class="stat"><span class="muted" style="font-size:13px">Purchases</span><b>${S.purchases.length}</b></div><div class="stat"><span class="muted" style="font-size:13px">Feedback</span><b>${S.feedback.length}</b></div><div class="stat"><span class="muted" style="font-size:13px">Average rating</span><b>${ratings}</b></div><div class="stat"><span class="muted" style="font-size:13px">Certificates issued</span><b>${S.certs.length}</b></div></div>
  <div class="row" style="justify-content:space-between"><h2 style="font-size:24px">All courses</h2><button class="btn primary" data-act="course-new">${ic('plus',16)} Add course</button></div>
  ${cs.length?`<div class="tw"><table><thead><tr><th>Course</th><th>Track</th><th>Price</th><th>Lessons</th><th>Buyers</th><th>Rating</th><th></th></tr></thead><tbody>${cs.map(c=>`<tr><td><b>${esc(c.title)}</b>${c.published===false?' <span class="chip" style="margin-left:6px;padding:4px 8px">Hidden</span>':''}</td><td>${esc((TRACKS[c.track]||{}).name||c.track)}</td><td class="num">${esc(price(c))}</td><td class="num">${c.lessons.length}</td><td class="num">${S.purchases.filter(p=>p.courseId===c.id).length}</td><td class="num">${fbFor(c.id).length?avg(c.id).toFixed(1):'–'}</td>
    <td><div class="row" style="gap:8px;flex-wrap:nowrap;justify-content:flex-end"><button class="btn sm" data-act="course-edit" data-v="${c.id}">${ic('edit',15)} Edit</button>
    ${S.armed===c.id?`<button class="btn sm danger" data-act="course-del" data-v="${c.id}">Confirm delete</button><button class="btn sm ghost" data-act="disarm">Cancel</button>`:`<button class="btn sm danger" data-act="course-del" data-v="${c.id}" aria-label="Delete ${esc(c.title)}">${ic('trash',15)} Delete</button>`}</div></td></tr>`).join('')}</tbody></table></div>`:emptyCatalog()}`;
}
function editorView(){
  const d=S.draft,L=d.lessons;
  return `<div class="row" style="justify-content:space-between"><h2 style="font-size:24px">${d.isNew?'Add course':'Edit course'}</h2><button class="btn ghost" data-act="course-cancel">${ic('back',16)} Back to courses</button></div>
  <div class="card"><div class="fgrid">
    <label class="f wide"><span>Title</span><input class="in" id="d-title" data-f="title" value="${esc(d.title)}"></label>
    <label class="f wide"><span>Summary</span><textarea class="in" id="d-summary" data-f="summary">${esc(d.summary)}</textarea></label>
    <label class="f"><span>Track</span><select class="in" id="d-track" data-f="track">${Object.entries(TRACKS).map(([k,t])=>`<option value="${k}" ${d.track===k?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>
    <label class="f"><span>Level</span><input class="in" id="d-level" data-f="level" value="${esc(d.level)}"></label>
    <label class="f"><span>Price (${esc(S.settings.currency)}, 0 for free)</span><input class="in" id="d-price" data-f="price" type="number" min="0" step="1" value="${esc(d.price)}"></label>
    <label class="chk"><input type="checkbox" id="d-pub" data-f="published" ${d.published!==false?'checked':''}> Visible to students</label></div></div>
  <div class="row" style="justify-content:space-between"><h3 style="font-size:20px">Lessons (${L.length})</h3><button class="btn sm" data-act="lesson-add">${ic('plus',15)} Add lesson</button></div>
  <div style="display:grid;gap:12px">${L.map((l,i)=>`<details class="ls" ${S.openLesson===l.id?'open':''}><summary><span class="mono muted" style="font-size:12px">${i+1}</span><span style="flex:1;min-width:0">${esc(l.title||'Untitled lesson')}</span><span class="chip">${l.type==='lab'?'Lab':'Lesson'}</span></summary>
    <div class="body"><div class="fgrid"><label class="f wide"><span>Lesson title</span><input class="in" id="l${i}-title" data-lf="${i}:title" value="${esc(l.title)}"></label>
      <label class="f"><span>Type</span><select class="in" id="l${i}-type" data-lf="${i}:type"><option value="lesson" ${l.type!=='lab'?'selected':''}>Lesson (reading)</option><option value="lab" ${l.type==='lab'?'selected':''}>Lab (code)</option></select></label>
      <label class="f"><span>Minutes</span><input class="in" id="l${i}-min" type="number" min="0" data-lf="${i}:minutes" value="${esc(l.minutes)}"></label>
      <label class="chk"><input type="checkbox" id="l${i}-prev" data-lf="${i}:preview" ${l.preview?'checked':''}> Free preview</label></div>
      <label class="f"><span>Content (blank line starts a new paragraph, lines starting with "- " make a list)</span><textarea class="in" id="l${i}-content" style="min-height:160px" data-lf="${i}:content">${esc(l.content)}</textarea></label>
      ${l.type==='lab'?`<label class="f"><span>Starter code (JavaScript)</span><textarea class="in" id="l${i}-starter" style="min-height:180px;font-family:var(--mono);font-size:13px" spellcheck="false" data-lf="${i}:starter">${esc(l.starter)}</textarea></label>
      <label class="f"><span>Checks, one per line as: name :: JavaScript expression that is true when the code is right</span><textarea class="in" id="l${i}-tests" style="min-height:130px;font-family:var(--mono);font-size:13px" spellcheck="false" data-lf="${i}:testsText">${esc(l.testsText)}</textarea></label>
      <label class="f"><span>Hint</span><input class="in" id="l${i}-hint" data-lf="${i}:hint" value="${esc(l.hint)}"></label>`:''}
      <div class="row"><button class="btn sm" data-act="lesson-up" data-v="${i}" ${i===0?'disabled':''}>Move up</button><button class="btn sm" data-act="lesson-down" data-v="${i}" ${i===L.length-1?'disabled':''}>Move down</button><button class="btn sm danger" data-act="lesson-del" data-v="${i}">${ic('trash',15)} Remove lesson</button></div></div></details>`).join('')}</div>
  <div class="row"><button class="btn primary" data-act="course-save">Save course</button><button class="btn" data-act="course-cancel">Cancel</button></div>`;
}
function adminFeedback(){
  const cs=visible(),f=S.feedback.filter(x=>S.fbFilter==='all'||x.courseId===S.fbFilter).sort((a,b)=>b.at-a.at);
  const cm=S.comments.slice().sort((a,b)=>b.at-a.at).slice(0,40);
  const cname=id=>(course(id)||{}).title||'Deleted course';
  return `<div class="row" style="justify-content:space-between"><h2 style="font-size:24px">Course feedback</h2>
    <label class="f" style="grid-auto-flow:column;align-items:center;gap:10px"><span>Show</span><select class="in" id="fb-filter" style="width:auto;min-width:200px" data-act="fb-filter"><option value="all">All courses</option>${cs.map(c=>`<option value="${c.id}" ${S.fbFilter===c.id?'selected':''}>${esc(c.title)}</option>`).join('')}</select></label></div>
  ${f.length?`<div class="card" style="padding:8px 24px">${f.map(x=>`<div class="fb"><div class="row" style="justify-content:space-between"><span><b>${esc(x.name||'Learner')}</b> <span class="muted">on ${esc(cname(x.courseId))}</span></span>${stars(x.rating)}</div><p>${esc(x.text)}</p><div class="row" style="justify-content:space-between"><span class="muted" style="font-size:12px">${fmtDate(x.at)}</span><button class="btn sm danger" data-act="fb-del" data-v="${x.id}">${ic('trash',14)} Delete</button></div></div>`).join('')}</div>`:`<div class="empty"><h3>No feedback yet</h3><p>Learner feedback from course pages appears here.</p></div>`}
  <h2 style="font-size:24px;margin-top:16px">Latest lesson comments</h2>
  ${cm.length?`<div class="card" style="padding:8px 24px">${cm.map(x=>{const c=course(x.courseId),l=c&&c.lessons.find(y=>y.id===x.lessonId);return `<div class="fb"><div class="row" style="justify-content:space-between"><span><b>${esc(x.name||'Learner')}</b> <span class="muted">on ${esc(c?c.title:'Deleted course')}${l?' · '+esc(l.title):''}</span></span><span class="muted" style="font-size:12px">${fmtDate(x.at)}</span></div><p style="white-space:pre-wrap;word-break:break-word">${esc(x.text)}</p><div><button class="btn sm danger" data-act="cm-del" data-v="${x.id}">${ic('trash',14)} Delete</button></div></div>`}).join('')}</div>`:`<div class="empty"><h3>No comments yet</h3><p>Comments from lesson pages appear here.</p></div>`}`;
}
function adminSite(){
  const s=S.settings;
  return `<div><h2 style="font-size:24px;margin-bottom:6px">Site headings</h2><p class="muted">Change the main headings and text on the home and courses pages.</p></div>
  <form class="card form" data-form="settings" style="margin-top:0"><div class="fgrid">${SETTING_FIELDS.map(f=>`<label class="f ${f[2]==='area'||f[0].match(/Title|heroBadge/)?'wide':''}"><span>${f[1]}</span>${f[2]==='area'?`<textarea class="in" id="s-${f[0]}" name="${f[0]}">${esc(s[f[0]])}</textarea>`:`<input class="in" id="s-${f[0]}" name="${f[0]}" value="${esc(s[f[0]])}">`}</label>`).join('')}</div>
    <div class="row"><button class="btn primary" type="submit">Save headings</button><button class="btn" type="button" data-act="site-reset">Restore defaults</button></div></form>
  <form class="card form" data-form="adminref" style="margin-top:0"><div><h3 style="font-size:19px">Admin reference code</h3><p class="muted" style="font-size:14px;margin-top:6px">Everyone who signs in as admin must enter this code. Keep it private. A new code applies immediately.</p></div>
    <div class="fgrid"><label class="f"><span>New reference code (at least 8 characters)</span><input class="in" id="ar-code" name="code" type="password" autocomplete="new-password"></label><label class="f"><span>Repeat new code</span><input class="in" id="ar-code2" name="code2" type="password" autocomplete="new-password"></label></div>
    <div id="ar-err" class="err" role="alert"></div><div><button class="btn primary" type="submit">Save reference code</button></div></form>`;
}

/* ---------- render ---------- */
function render(){
  if(!S.ready)return;
  const r=route();
  if(['dashboard','role','admin','lesson','cert'].includes(r.n)&&!S.user){S.flash='Log in to continue.';S.authMode='login';if(location.hash!=='#login'){location.hash='#login';return}r.n='login'}
  if(r.n==='role'&&!S.canEdit){location.hash='#dashboard';return}
  if(r.n==='admin'&&!isAdmin()){location.hash='#role';return}
  if(r.n==='dashboard'&&S.role==='admin'){/* admins may still view the student dashboard */}
  let body='';
  switch(r.n){
    case'home':body=homeView();break;
    case'courses':body=coursesView();break;
    case'course':body=courseView(r.id);break;
    case'lesson':body=lessonView(r.cid,r.lid);break;
    case'cert':body=certView(r.id);break;
    case'login':body=loginView();break;
    case'role':body=roleView();break;
    case'dashboard':body=dashView();break;
    case'admin':body=adminView();break;
  }
  const sc=window.scrollY;
  app.innerHTML=nav(r)+'<main>'+body+'</main>'+footer()+(S.modal?modalView():'');
  window.scrollTo(0,sc);
  if(S.modal){const b=$('.dlg button');if(b)b.focus()}
}
function modalView(){
  const c=course(S.modal.id);if(!c)return'';
  return `<div class="ov" data-act="close-modal" data-bg="1"><div class="dlg" role="dialog" aria-modal="true" aria-label="Checkout"><h3>Buy ${esc(c.title)}</h3>
    <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding-block:14px"><span class="muted">Total</span><b style="font:700 26px var(--display)">${esc(price(c))}</b></div>
    <p class="muted" style="font-size:14px">This is a demo checkout. No real payment is taken. Confirming records the purchase and unlocks every lesson and lab.</p>
    <div class="row"><button class="btn primary" data-act="buy-confirm" data-v="${c.id}">Confirm purchase</button><button class="btn" data-act="close-modal">Cancel</button></div></div></div>`;
}

/* ---------- code runner ---------- */
const WORKER_SRC=`
self.onmessage=function(e){
  var d=e.data,logs=[];
  function fmt(a){if(typeof a==='string')return a;try{return JSON.stringify(a)}catch(x){return String(a)}}
  var con={log:function(){logs.push([].map.call(arguments,fmt).join(' '))},error:function(){logs.push('error: '+[].map.call(arguments,fmt).join(' '))},warn:function(){logs.push('warn: '+[].map.call(arguments,fmt).join(' '))}};
  var error=null;
  try{new Function('console',d.code)(con)}catch(err){error=String(err&&err.message||err)}
  var results=[];
  if(d.mode==='check'&&!error){
    results=d.tests.map(function(t){
      try{var quiet={log:function(){},error:function(){},warn:function(){}};var ok=!!(new Function('console',d.code+'\\n;return ('+t.expr+');'))(quiet);return{name:t.name,ok:ok}}
      catch(err){return{name:t.name,ok:false,msg:String(err&&err.message||err)}}
    });
  }
  self.postMessage({logs:logs,error:error,results:results});
};`;
function runWorker(code,tests,mode){
  return new Promise(res=>{
    let w,url;
    try{url=URL.createObjectURL(new Blob([WORKER_SRC],{type:'text/javascript'}));w=new Worker(url)}
    catch(e){res({logs:[],error:'Running code is not available in this view.',results:[]});return}
    const t=setTimeout(()=>{w.terminate();URL.revokeObjectURL(url);res({logs:[],error:'Stopped: the code ran for more than 3 seconds. Check for an infinite loop.',results:[]})},3000);
    w.onmessage=e=>{clearTimeout(t);w.terminate();URL.revokeObjectURL(url);res(e.data)};
    w.onerror=e=>{clearTimeout(t);w.terminate();URL.revokeObjectURL(url);res({logs:[],error:e.message||'The code could not run.',results:[]})};
    w.postMessage({code,tests,mode});
  });
}

/* ---------- actions ---------- */
async function safe(fn,msg){try{await fn()}catch(e){toast(msg||'Could not save. You may not have permission to do this.')}}
function currentLesson(){const r=route();if(r.n!=='lesson')return null;const c=course(r.cid);if(!c)return null;const l=c.lessons.find(x=>x.id===r.lid);return l?{c,l,key:c.id+'_'+l.id}:null}
async function markDone(c,l){
  if(!S.user||done(c,l))return;
  const dn=Object.assign({},S.progress.done||{});dn[c.id+'_'+l.id]=true;
  S.progress={done:dn};
  await safe(()=>Store.put('progress',S.user.id,{done:dn}));
  checkCerts();
}
function newDraft(){return{isNew:true,id:uid(),title:'',summary:'',track:'genai',level:'Beginner',price:'0',published:true,lessons:[]}}
function toDraft(c){
  const d=clone(c);d.price=String(c.price||0);
  d.lessons=d.lessons.map(l=>Object.assign({},l,{minutes:String(l.minutes||0),starter:l.starter||'',hint:l.hint||'',content:l.content||'',testsText:(l.tests||[]).map(t=>t.name+' :: '+t.expr).join('\n')}));
  return d;
}
function fromDraft(d){
  const lessons=d.lessons.map(l=>{
    const o={id:l.id,type:l.type==='lab'?'lab':'lesson',title:(l.title||'').trim()||'Untitled lesson',minutes:Number(l.minutes)||0,content:l.content||''};
    if(l.preview)o.preview=true;
    if(o.type==='lab'){o.starter=l.starter||'';o.hint=l.hint||'';o.tests=String(l.testsText||'').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const k=x.indexOf('::');return k<0?{name:x,expr:x}:{name:x.slice(0,k).trim()||'Check',expr:x.slice(k+2).trim()}})}
    return o;
  });
  return{title:d.title.trim(),summary:d.summary.trim(),track:d.track,level:d.level.trim()||'All levels',price:Math.max(0,Number(d.price)||0),published:d.published!==false,lessons,createdAt:d.createdAt||Date.now()};
}
async function seedDefaults(){
  S.seeded=true;
  await Store.put('settings','site',DEF_SETTINGS);
  let i=0;
  for(const c of DEF_COURSES){await Store.put('courses',c.id,Object.assign({},c,{createdAt:Date.now()+(i++)}))}
}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t)return;
  const a=t.dataset.act,v=t.dataset.v;
  if(t.dataset.bg&&e.target!==t)return;
  switch(a){
    case'scroll':{const el=document.getElementById(v);if(el)el.scrollIntoView({behavior:'smooth'});break}
    case'to-login':S.authMode=v==='register'?'register':'login';S.flash='';if(location.hash==='#login')render();break;
    case'authmode':S.authMode=v;S.flash='';render();break;
    case'logout':logout();break;
    case'filter':S.filter=v;if(route().n!=='courses')go('#courses');else render();break;
    case'role-pick':S.pendingRole=v;render();break;
    case'role-go':S.role='user';S.adminUnlocked=false;go('#dashboard');break;
    case'buy':S.modal={id:v};render();break;
    case'close-modal':S.modal=null;render();break;
    case'buy-confirm':{const c=course(v);if(!c||!S.user)break;S.modal=null;safe(async()=>{await Store.put('purchases',S.user.id+'_'+c.id,{acct:S.user.id,courseId:c.id,price:Number(c.price)||0,at:Date.now()});toast('Purchase complete. Every lesson is unlocked.')},'Could not record the purchase. Try again.');render();break}
    case'complete':{const x=currentLesson();if(x){markDone(x.c,x.l).then(()=>{toast('Lesson marked complete');render()})}break}
    case'hint':{const x=currentLesson();if(x){const ta=$('#code');if(ta)S.code[x.key]=ta.value;S.hintShown[x.key]=!S.hintShown[x.key];render()}break}
    case'reset':{const x=currentLesson();if(x){S.code[x.key]=x.l.starter||'';lsSet('bl_code_'+S.user.id+'_'+x.key,x.l.starter||'');S.labRes[x.key]=null;render();toast('Code reset to the starter')}break}
    case'run':{
      const x=currentLesson();if(!x)break;
      const ta=$('#code'),code=ta?ta.value:(S.code[x.key]||'');
      S.code[x.key]=code;lsSet('bl_code_'+S.user.id+'_'+x.key,code);
      S.labRes[x.key]={running:true,logs:[],results:[]};render();
      runWorker(code,x.l.tests||[],v).then(r=>{
        S.labRes[x.key]=r;
        if(v==='check'&&!r.error&&r.results.length&&r.results.every(q=>q.ok)){markDone(x.c,x.l);toast('All checks passed. Lab complete!')}
        else if(v==='check'&&r.error)toast('Fix the error first, then run the checks.');
        render();
      });break}
    case'cert-dl':{const x=S.user&&S.certs.find(q=>q.acct===S.user.id&&q.courseId===v);if(!x)break;(async()=>{try{const d=await window.claude.use('downloads');if(!d){toast('Downloads are not available here.');return}await d.save({filename:'certificate-'+String(x.courseTitle||'course').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.svg',data:certSvg(x)});toast('Certificate saved')}catch(e){if(!e||e.code!=='declined')toast('Could not save the certificate.')}})();break}
    case'admin-tab':S.adminTab=v;S.draft=null;render();break;
    case'seed':safe(seedDefaults,'Could not load sample courses.').then(()=>toast('Sample courses loaded'));break;
    case'course-new':S.draft=newDraft();S.openLesson=null;S.adminTab='courses';render();break;
    case'course-edit':{const c=course(v);if(c){S.draft=toDraft(c);S.openLesson=null;S.adminTab='courses';if(route().n!=='admin')go('#admin');else render()}break}
    case'course-cancel':S.draft=null;render();break;
    case'course-del':
      if(S.armed===v){safe(async()=>{await Store.del('courses',v);toast('Course deleted')});S.armed=null}else{S.armed=v}
      render();break;
    case'disarm':S.armed=null;render();break;
    case'lesson-add':{const id=uid();S.draft.lessons.push({id,type:'lesson',title:'',minutes:'10',preview:false,content:'',starter:'',hint:'',testsText:''});S.openLesson=id;render();break}
    case'lesson-del':S.draft.lessons.splice(Number(v),1);render();break;
    case'lesson-up':{const i=Number(v),L=S.draft.lessons;if(i>0){[L[i-1],L[i]]=[L[i],L[i-1]];S.openLesson=L[i-1].id;render()}break}
    case'lesson-down':{const i=Number(v),L=S.draft.lessons;if(i<L.length-1){[L[i+1],L[i]]=[L[i],L[i+1]];S.openLesson=L[i+1].id;render()}break}
    case'course-save':{
      const d=S.draft;
      if(!d.title.trim()){toast('Add a course title first.');$('#d-title')&&$('#d-title').focus();break}
      if(!d.summary.trim()){toast('Add a short summary first.');$('#d-summary')&&$('#d-summary').focus();break}
      const obj=fromDraft(d);
      safe(async()=>{await Store.put('courses',d.id,obj);S.draft=null;toast('Course saved');render()});break}
    case'fb-del':safe(()=>Store.del('feedback',v));break;
    case'cm-del':safe(()=>Store.del('comments',v));break;
    case'site-reset':safe(async()=>{await Store.put('settings','site',DEF_SETTINGS);toast('Headings restored')});break;
  }
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.f&&S.draft){S.draft[t.dataset.f]=t.type==='checkbox'?t.checked:t.value;return}
  if(t.dataset&&t.dataset.lf&&S.draft){const p=t.dataset.lf.split(':'),l=S.draft.lessons[Number(p[0])];if(l){l[p[1]]=t.type==='checkbox'?t.checked:t.value;if(p[1]==='type'){S.openLesson=l.id;render()}}return}
  if(t.id==='code'&&t.dataset.key){S.code[t.dataset.key]=t.value;if(S.user)lsSet('bl_code_'+S.user.id+'_'+t.dataset.key,t.value)}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='fb-filter'){S.fbFilter=t.value;render()}
});
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(e.key==='Escape'&&S.modal){S.modal=null;render();return}
  if(t.id==='code'&&e.key==='Tab'){e.preventDefault();const s=t.selectionStart;t.setRangeText('  ',s,t.selectionEnd,'end');t.dispatchEvent(new Event('input',{bubbles:true}))}
});
document.addEventListener('submit',async e=>{
  const f=e.target.closest('form[data-form]');if(!f)return;
  e.preventDefault();
  const kind=f.dataset.form,fd=new FormData(f);
  if(kind==='auth'){
    const err=S.authMode==='register'?await register(String(fd.get('name')||''),String(fd.get('email')||''),String(fd.get('pw')||'')):await login(String(fd.get('email')||''),String(fd.get('pw')||''));
    if(err){const el=$('#au-err');if(el)el.textContent=err;return}
    S.flash='';go(S.canEdit?'#role':'#dashboard');
  }else if(kind==='feedback'&&S.user){
    const text=String(fd.get('text')||'').trim();if(!text)return;
    safe(async()=>{await Store.put('feedback',uid(),{acct:S.user.id,name:S.user.name,courseId:f.dataset.cid,rating:Number(fd.get('rating'))||5,text,at:Date.now()});toast('Thanks for your feedback');render()},'Could not send feedback. Try again.');
  }else if(kind==='comment'&&S.user){
    const text=String(fd.get('text')||'').trim();if(!text)return;
    safe(async()=>{await Store.put('comments',uid(),{acct:S.user.id,name:S.user.name,courseId:f.dataset.cid,lessonId:f.dataset.lid,text,at:Date.now()});toast('Comment posted');render()},'Could not post your comment. Try again.');
  }else if(kind==='adminlogin'&&S.canEdit){
    const el=$('#role-err'),code=String(fd.get('code')||''),fail=m=>{if(el)el.textContent=m};
    if(Date.now()<S.lockUntil){fail('Too many attempts. Wait '+Math.ceil((S.lockUntil-Date.now())/1000)+' seconds and try again.');return}
    try{
      if(S.adminRef){
        if(await refHash(S.adminRef.salt,code)!==S.adminRef.hash){S.attempts++;if(S.attempts>=5){S.lockUntil=Date.now()+30000;S.attempts=0}fail('That reference code is not correct.');return}
      }else{
        if(code.length<8){fail('Use at least 8 characters.');return}
        if(code!==String(fd.get('code2')||'')){fail('The two codes do not match.');return}
        const salt=uid()+uid(),hash=await refHash(salt,code);
        await Store.put('settings','adminref',{salt,hash});S.adminRef={salt,hash};
      }
    }catch(err){fail('Could not check the code. Your account may not have edit access to this site.');return}
    S.attempts=0;S.adminUnlocked=true;S.role='admin';go('#admin');
  }else if(kind==='adminref'&&isAdmin()){
    const el=$('#ar-err'),code=String(fd.get('code')||''),fail=m=>{if(el)el.textContent=m};
    if(code.length<8){fail('Use at least 8 characters.');return}
    if(code!==String(fd.get('code2')||'')){fail('The two codes do not match.');return}
    try{const salt=uid()+uid(),hash=await refHash(salt,code);await Store.put('settings','adminref',{salt,hash});S.adminRef={salt,hash};toast('Reference code updated');render()}
    catch(err){fail('Could not save the code. Try again.')}
  }else if(kind==='settings'&&isAdmin()){
    const o={};SETTING_FIELDS.forEach(x=>{o[x[0]]=String(fd.get(x[0])||'').trim()||DEF_SETTINGS[x[0]]});
    safe(async()=>{await Store.put('settings','site',o);toast('Headings saved')});
  }
});
window.addEventListener('hashchange',()=>{S.modal=null;S.armed=null;render();window.scrollTo(0,0)});

/* ---------- start ---------- */
async function start(){
  await Store.init();
  let cap=null;
  try{cap=await(window.claude&&window.claude.use?window.claude.use('user'):null)}catch(e){}
  if(Store.mode==='local')S.canEdit=true;
  else{try{S.canEdit=cap?!!(await cap.canEdit()):false}catch(e){S.canEdit=false}}
  // restore session and role
  const sid=lsGet('bl_session','');
  if(sid){const a=accounts().find(x=>x.id===sid);if(a){S.user={id:a.id,name:a.name,email:a.email};S.role='user'}}
  if(Store.mode==='local'&&Store.empty('courses')){await seedDefaults()}
  let first={courses:true,settings:true};
  Store.col('courses',(arr,cached)=>{
    S.courses=arr.map(c=>Object.assign({lessons:[]},c));checkCerts();
    if(first.courses&&!cached){first.courses=false;if(Store.mode==='db'&&S.canEdit&&!arr.length&&!S.seeded){seedDefaults().catch(()=>{})}}
    queueRender();
  });
  Store.doc('settings','site',d=>{S.settings=Object.assign({},DEF_SETTINGS,d||{});queueRender()});
  Store.col('feedback',a=>{S.feedback=a;queueRender()});
  Store.col('comments',a=>{S.comments=a;queueRender()});
  Store.col('purchases',a=>{S.purchases=a;queueRender()});
  Store.col('certificates',(a,cached)=>{S.certs=a;if(!cached)S.certsLoaded=true;checkCerts();queueRender()});
  Store.doc('settings','adminref',(d,cached)=>{S.adminRef=d&&d.hash?d:null;if(!cached)S.adminRefLoaded=true;queueRender()});
  subProgress();
  S.ready=true;render();
}
start();
})();
