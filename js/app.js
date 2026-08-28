const SECTION_META = {
  work: { title: "شغلنا", empty: "لم تتم إضافة صورة لشغلنا بعد." },
  offers: { title: "آخر العروض", empty: "لم تتم إضافة صورة للعروض بعد." },
  latest: { title: "آخر الإضافات", empty: "لم تتم إضافة صورة للإضافات بعد." }
};

function setupLinks() {
  document.querySelectorAll("[data-link]").forEach(a => {
    const type = a.dataset.link;
    const value = {
      whatsapp: `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent("السلام عليكم، محتاج استفسار من موقع MAGHRABY STORE")}`,
      phone: `tel:+${SITE_CONFIG.phone}`,
      landline: `tel:+20${SITE_CONFIG.landline.replace(/^0/, "")}`,
      facebook: SITE_CONFIG.facebook,
      instagram: SITE_CONFIG.instagram,
      telegram: SITE_CONFIG.telegram,
      maps: SITE_CONFIG.maps
    }[type];
    if (value) a.href = value;
  });
}

function renderStaticContent() {
  const services = [
    ["🔧", "صيانة احترافية", "فحص وصيانة أجهزة الكونسول وإكسسواراتها بخبرة واهتمام بالتفاصيل."],
    ["🎮", "بيع أجهزة Console", "أجهزة كونسول وإكسسوارات مختارة بعناية للاستخدام المنزلي واللاعبين."],
    ["💾", "تنزيل ألعاب", "تجهيز وتنزيل الألعاب والخدمات المتاحة على أجهزتك."],
    ["🛒", "إكسسوارات", "يد تحكم، كابلات، شواحن، سماعات وملحقات متنوعة."]
  ];
  document.getElementById("servicesGrid").innerHTML = services.map(s => `<article class="service-card"><div class="service-icon">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join("");

  document.getElementById("address").textContent = SITE_CONFIG.address;
  document.getElementById("year").textContent = new Date().getFullYear();
}

function renderMediaCards(rows) {
  const byId = Object.fromEntries(rows.map(r => [r.section, r]));
  ["work", "offers", "latest"].forEach(section => {
    const el = document.querySelector(`[data-media="${section}"]`);
    const row = byId[section];
    if (!el) return;
    if (row?.image_url) {
      el.innerHTML = `<img src="${row.image_url}" alt="${SECTION_META[section].title}" loading="lazy"><div class="media-caption"><span>${SECTION_META[section].title}</span><b>MAGHRABY STORE</b></div>`;
    } else {
      el.innerHTML = `<div class="media-empty"><span>＋</span><b>${SECTION_META[section].title}</b><small>${SECTION_META[section].empty}</small></div>`;
    }
  });
}

async function loadMedia() {
  if (!supabaseClient) {
    renderMediaCards([]);
    return;
  }
  const { data, error } = await supabaseClient.from("site_sections").select("section,image_url");
  if (error) {
    console.error(error);
    renderMediaCards([]);
    return;
  }
  renderMediaCards(data || []);
}

function setupSocials() {
  const socials = document.getElementById("platformButtons");
  const items = [
    ["facebook", "📘", "فيسبوك"],
    ["instagram", "📸", "إنستجرام"],
    ["telegram", "✈️", "تليجرام"],
    ["maps", "📍", "الموقع على الخريطة"]
  ];
  socials.innerHTML = items.map(([key, icon, label]) => `<a class="social-btn" data-link="${key}" target="_blank" rel="noopener">${icon} ${label}</a>`).join("");
  setupLinks();
}

renderStaticContent();
setupSocials();
setupLinks();
loadMedia();
