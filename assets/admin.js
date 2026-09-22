(()=>{
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const csrf=$('meta[name="csrf-token"]')?.content||'';
  const queue=$('#queue'), drawer=$('#drawer'), search=$('#request-search');
  if(!queue || !drawer) return;

  let rows=[], filter='all', query='', selected=null, loading=false;
  const activeStatuses=new Set(['received','in_service']);
  const statusLabel=s=>({new:'New',confirmed:'Confirmed',received:'Vehicle received',in_service:'In service',ready:'Ready for pickup',completed:'Completed',declined:'Declined'}[s]||s);
  const fmtDate=value=>{try{return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(value+'T12:00:00'))}catch{return value}};
  const fmtCreated=value=>{try{return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(value))}catch{return value||'—'}};
  const searchHaystack=r=>[r.reference,r.name,r.phone,r.email,r.vehicle_year,r.vehicle_make,r.vehicle_model,r.service,r.issue,r.preferred_date].join(' ').toLowerCase();

  function filteredRows(){
    return rows.filter(r=>{
      const byStatus=filter==='all' ? true : filter==='active' ? activeStatuses.has(r.status) : r.status===filter;
      const byQuery=!query || searchHaystack(r).includes(query);
      return byStatus && byQuery;
    });
  }

  function updateCounts(){
    $('#count-new').textContent=rows.filter(r=>r.status==='new').length;
    $('#count-confirmed').textContent=rows.filter(r=>r.status==='confirmed').length;
    $('#count-active').textContent=rows.filter(r=>activeStatuses.has(r.status)).length;
    $('#count-ready').textContent=rows.filter(r=>r.status==='ready').length;
  }

  function render(){
    const view=filteredRows();
    queue.innerHTML=view.length?view.map(r=>`
      <article class="request" data-id="${Number(r.id)}" tabindex="0" role="button" aria-label="Open ${esc(r.reference)}">
        <span class="id">#${Number(r.id)}</span>
        <div class="request-primary"><h3>${esc(r.name)}</h3><small>${esc(r.service)}</small><em>${esc(r.reference)}</em></div>
        <div class="vehicle">${esc(r.vehicle_year)} ${esc(r.vehicle_make)} ${esc(r.vehicle_model)}</div>
        <div class="date">${esc(fmtDate(r.preferred_date))}<br><small>${esc(r.preferred_window)}</small></div>
        <span class="status ${esc(r.status)}">${esc(statusLabel(r.status))}</span>
      </article>`).join(''):'<div class="empty">No requests match this view.</div>';
    updateCounts();
    $$('.request').forEach(el=>{
      const openIt=()=>open(Number(el.dataset.id));
      el.addEventListener('click',openIt);
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openIt();}});
    });
  }

  async function load(silent=false){
    if(loading) return;
    loading=true;
    if(!silent) $('#refresh')?.classList.add('loading');
    try{
      const r=await fetch('api.php',{headers:{'Accept':'application/json'},cache:'no-store'});
      const j=await r.json();
      if(!r.ok||!j.ok) throw new Error(j.message||'Could not load requests.');
      rows=j.appointments||[];
      render();
      if(selected){selected=rows.find(r=>Number(r.id)===Number(selected.id))||null;if(selected&&drawer.classList.contains('open'))open(Number(selected.id));}
    }catch(e){if(!silent) queue.innerHTML=`<div class="empty">${esc(e.message)}</div>`;}
    finally{loading=false;$('#refresh')?.classList.remove('loading');}
  }

  function actionButtons(r){
    const buttons=[];
    if(r.status==='new') buttons.push(['confirmed','Confirm request']);
    if(r.status==='confirmed') buttons.push(['received','Vehicle received']);
    if(r.status==='received') buttons.push(['in_service','Start service']);
    if(r.status==='in_service') buttons.push(['ready','Mark ready']);
    if(r.status==='ready') buttons.push(['completed','Complete']);
    if(['completed','declined'].includes(r.status)) buttons.push(['new','Reopen as new']);
    if(r.status!=='declined'&&r.status!=='completed') buttons.push(['declined','Decline']);
    return buttons.map(([status,label],i)=>`<button data-status="${status}" class="${i===0?'primary':''}">${label}</button>`).join('');
  }

  function open(id){
    selected=rows.find(r=>Number(r.id)===id); if(!selected)return;
    const extras=[selected.needs_tow==='yes'?'Towing / recovery':null,selected.needs_replacement_vehicle==='yes'?'Replacement vehicle':null,selected.add_wash==='yes'?'Vehicle wash':null].filter(Boolean);
    $('#drawer-content').innerHTML=`
      <p class="eyebrow">SERVICE REQUEST</p>
      <h2>${esc(selected.name)}</h2>
      <div class="ref">${esc(selected.reference)} · ${esc(statusLabel(selected.status).toUpperCase())}</div>
      <div class="timeline-mini"><span>RECEIVED</span><b>${esc(fmtCreated(selected.created_at))}</b><span>LAST UPDATED</span><b>${esc(fmtCreated(selected.updated_at||selected.created_at))}</b></div>
      <div class="detail-grid">
        <div class="detail"><span>VEHICLE</span><b>${esc(selected.vehicle_year)} ${esc(selected.vehicle_make)} ${esc(selected.vehicle_model)}</b></div>
        <div class="detail"><span>SERVICE</span><b>${esc(selected.service)}</b></div>
        <div class="detail"><span>PREFERRED DATE</span><b>${esc(fmtDate(selected.preferred_date))}</b></div>
        <div class="detail"><span>WINDOW</span><b>${esc(selected.preferred_window)}</b></div>
        <div class="detail"><span>PHONE</span><b><a href="tel:${esc(selected.phone)}">${esc(selected.phone)}</a></b></div>
        <div class="detail"><span>EMAIL</span><b><a href="mailto:${esc(selected.email)}">${esc(selected.email)}</a></b></div>
        <div class="detail"><span>CONTACT VIA</span><b>${esc((selected.contact_preference||'phone').toUpperCase())}</b></div>
        <div class="detail"><span>ADD-ONS</span><b>${extras.length?extras.map(esc).join(' · '):'None requested'}</b></div>
      </div>
      <p class="eyebrow">CUSTOMER NOTES</p><div class="issue">${esc(selected.issue)}</div>
      <label>INTERNAL NOTE<textarea id="admin-note" maxlength="1000" placeholder="Visible only to staff">${esc(selected.admin_note)}</textarea></label>
      <div class="action-row">${actionButtons(selected)}</div>`;
    drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');
    $$('.action-row button').forEach(b=>b.addEventListener('click',()=>update(b.dataset.status)));
  }

  function close(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('drawer-open');selected=null;}

  async function update(status){
    if(!selected)return;
    const note=$('#admin-note')?.value||'';
    const buttons=$$('.action-row button');buttons.forEach(b=>b.disabled=true);
    try{
      const r=await fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({id:Number(selected.id),status,admin_note:note})});
      const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.message||'Update failed.');
      close();await load(true);
    }catch(e){alert(e.message||'Update failed.');buttons.forEach(b=>b.disabled=false);}
  }

  $$('.filters button').forEach(b=>b.addEventListener('click',()=>{$$('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;render();}));
  search?.addEventListener('input',()=>{query=search.value.trim().toLowerCase();render();});
  $('#refresh')?.addEventListener('click',()=>load());
  $('.drawer-close')?.addEventListener('click',close);
  drawer.addEventListener('click',e=>{if(e.target===drawer)close();});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))close();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load(true);});
  setInterval(()=>{if(document.visibilityState==='visible'&&!drawer.classList.contains('open'))load(true);},30000);
  load();
})();
