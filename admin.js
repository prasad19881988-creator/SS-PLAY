const cfg=window.SSPLAY_CONFIG;
let client=null,editingId=null;
const $=id=>document.getElementById(id);

if(cfg?.SUPABASE_URL?.startsWith('http')){
  client=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
}

async function init(){
  if(!client){
    $('loginMsg').textContent='Supabase configuration is missing.';
    return;
  }
  const {data:{session}}=await client.auth.getSession();
  if(session) showDashboard();
}

async function showDashboard(){
  $('loginBox').classList.add('hidden');
  $('dashboard').classList.remove('hidden');
  await loadContent();
}

$('login').onclick=async()=>{
  if(!client)return;
  $('loginMsg').textContent='Signing in...';
  const {error}=await client.auth.signInWithPassword({
    email:$('email').value.trim(),
    password:$('password').value
  });
  $('loginMsg').textContent=error?error.message:'';
  if(!error) showDashboard();
};

$('logout').onclick=async()=>{
  if(client) await client.auth.signOut();
  location.reload();
};

async function loadContent(){
  const {data,error}=await client.from('content').select('*').order('created_at',{ascending:false});
  if(error){$('contentList').textContent=error.message;return;}

  const list=data||[];
  $('published').textContent=list.filter(x=>x.status==='published').length;
  $('premium').textContent=list.filter(x=>x.is_premium===true).length;
  $('drafts').textContent=list.filter(x=>x.status==='draft').length;

  $('contentList').innerHTML=list.length
    ?list.map(x=>`<div class="item"><div><b>${esc(x.title)}</b><br><small>${esc(x.content_type)} · ${x.is_premium?'premium':'free'} · ${esc(x.status)}</small></div><button onclick="editItem('${x.id}')">Edit</button><span class="badge">${esc(x.genre||'')}</span></div>`).join('')
    :'<p>No content yet.</p>';
}

window.editItem=async id=>{
  const {data,error}=await client.from('content').select('*').eq('id',id).single();
  if(error||!data)return;
  editingId=id;
  $('title').value=data.title||'';
  $('type').value=data.content_type||'movie';
  $('genre').value=data.genre||'';
  $('poster').value=data.poster_url||'';
  $('video').value=data.video_url||'';
  $('access').value=data.is_premium?'premium':'free';
  $('status').value=data.status||'draft';
  $('description').value=data.description||'';
  scrollTo(0,document.body.scrollHeight);
};

$('newContent').onclick=()=>{
  editingId=null;
  clearForm();
  scrollTo(0,document.body.scrollHeight);
};

$('clear').onclick=()=>{
  editingId=null;
  clearForm();
};

function clearForm(){
  ['title','genre','poster','video','description'].forEach(x=>$(x).value='');
  $('type').value='movie';
  $('access').value='free';
  $('status').value='draft';
  $('saveMsg').textContent='';
}

$('save').onclick=async()=>{
  const payload={
    title:$('title').value.trim(),
    content_type:$('type').value,
    genre:$('genre').value.trim()||null,
    poster_url:$('poster').value.trim()||null,
    video_url:$('video').value.trim()||null,
    is_premium:$('access').value==='premium',
    status:$('status').value,
    description:$('description').value.trim()||null,
    updated_at:new Date().toISOString()
  };

  if(!payload.title){
    $('saveMsg').textContent='Title is required.';
    return;
  }

  $('saveMsg').textContent='Saving...';
  const q=editingId
    ?client.from('content').update(payload).eq('id',editingId)
    :client.from('content').insert(payload);

  const {error}=await q;
  $('saveMsg').textContent=error?error.message:'Saved successfully.';
  if(!error){
    editingId=null;
    clearForm();
    await loadContent();
  }
};

function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[m]));
}

init();
