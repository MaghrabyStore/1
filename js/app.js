const SECTION_META = {
  work: { title: "شغلنا", empty: "لم تتم إضافة صور لشغلنا بعد." },
  offers: { title: "آخر العروض", empty: "لم تتم إضافة صور للعروض بعد." },
  latest: { title: "آخر الإضافات", empty: "لم تتم إضافة صور للإضافات بعد." }
};

function setupLinks() {
  document.querySelectorAll("[data-link]").forEach(a => {
    const value = {
      whatsapp: `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent("السلام عليكم، محتاج استفسار من موقع MAGHRABY STORE")}`,
      phone: `tel:+${SITE_CONFIG.phone}`,
      landline: `tel:+20${SITE_CONFIG.landline.replace(/^0/, "")}`,
      facebook: SITE_CONFIG.facebook, instagram: SITE_CONFIG.instagram,
      telegram: SITE_CONFIG.telegram, maps: SITE_CONFIG.maps
    }[a.dataset.link];
    if (value) a.href = value;
  });
}

function renderStaticContent(){
  const services=[
    ["🔧","صيانة احترافية","فحص وصيانة أجهزة الكونسول وإكسسواراتها بخبرة واهتمام بالتفاصيل."],
    ["🎮","بيع أجهزة Console","أجهزة كونسول وإكسسوارات مختارة بعناية للاستخدام المنزلي واللاعبين."],
    ["💾","تنزيل ألعاب","تجهيز وتنزيل الألعاب والخدمات المتاحة على أجهزتك."],
    ["🛒","إكسسوارات","يد تحكم، كابلات، شواحن، سماعات وملحقات متنوعة."]
  ];
  document.getElementById("servicesGrid").innerHTML=services.map(s=>`<article class="service-card"><div class="service-icon">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join("");
  document.getElementById("address").textContent=SITE_CONFIG.address;
  document.getElementById("year").textContent=new Date().getFullYear();
}

function renderMediaCards(rows){
  const grouped={work:[],offers:[],latest:[]};
  (rows||[]).forEach(r=>{if(grouped[r.section]) grouped[r.section].push(r)});
  Object.keys(grouped).forEach(section=>{
    const el=document.querySelector(`[data-media="${section}"]`); if(!el)return;
    const items=grouped[section];
    if(!items.length){el.innerHTML=`<div class="media-empty"><span>＋</span><b>${SECTION_META[section].title}</b><small>${SECTION_META[section].empty}</small></div>`;return;}
    el.innerHTML=`<div class="media-gallery">${items.map((r,i)=>`<figure class="media-item"><img src="${r.image_url}" alt="${SECTION_META[section].title} ${i+1}" loading="lazy"><figcaption><span>${SECTION_META[section].title}</span><b>${String(i+1).padStart(2,'0')}</b></figcaption></figure>`).join('')}</div>`;
  });
}
async function loadMedia(){
  if(!supabaseClient){renderMediaCards([]);return;}
  const {data,error}=await supabaseClient.from("media_items").select("id,section,image_url,image_path,sort_order,created_at").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){console.error(error);renderMediaCards([]);return;}
  renderMediaCards(data||[]);
}

function setupSocials(){
  const socials=document.getElementById("platformButtons");
  const items=[
    ["facebook","📘","فيسبوك","تابعنا على Facebook"],
    ["instagram","📸","إنستجرام","شوف آخر الصور"],
    ["telegram","✈️","تليجرام","تواصل معنا على Telegram"],
    ["maps","📍","موقع المحل","افتح Google Maps"]
  ];
  socials.innerHTML=items.map(([key,icon,label,sub])=>`<a class="platform-btn" data-link="${key}" target="_blank" rel="noopener"><span class="platform-icon">${icon}</span><span class="platform-copy"><b>${label}</b><small>${sub}</small></span><span class="platform-arrow">←</span></a>`).join("");
  setupLinks();
}
renderStaticContent();setupSocials();setupLinks();loadMedia();
