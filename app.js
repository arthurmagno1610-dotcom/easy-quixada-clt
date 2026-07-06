const icons = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>',
  heart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path></svg>',
  compass:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"></path></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"></path></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"></path></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>',
};

const categories = [
  { id: "todos", label: "Todos", symbol: "EQ", className: "repair" },
  { id: "alimentacao", label: "Alimentação", symbol: "AL", className: "food" },
  {
    id: "saude",
    label: "Saúde & Bem-estar",
    symbol: "SB",
    className: "health",
  },
  { id: "manutencao", label: "Manutenção", symbol: "MT", className: "repair" },
  { id: "academico", label: "Acadêmico", symbol: "AC", className: "school" },
  {
    id: "lazer",
    label: "Lazer & Entretenimento",
    symbol: "LZ",
    className: "leisure",
  },
];

const fallbackEstablishments = [];

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://easy-quixada-srv-1.onrender.com";

let establishments = fallbackEstablishments;
let activeCategory = "todos";
let searchTerm = "";

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryIdFromName(name) {
  const slug = slugify(name);

  if (slug.includes("alimentacao")) return "alimentacao";
  if (slug.includes("saude") || slug.includes("bem-estar")) return "saude";
  if (slug.includes("manutencao")) return "manutencao";
  if (slug.includes("academico")) return "academico";
  if (slug.includes("lazer") || slug.includes("entretenimento")) return "lazer";

  return slug || "todos";
}

function establishmentFromApi(item) {
  const categoryLabel = item.nome_categoria || "Estabelecimento";

  return {
    id: String(item.id_estabelecimento),
    name: item.nome || "Sem nome",
    category: categoryIdFromName(categoryLabel),
    categoryLabel,
    image:
      item.imagem ||
      "/uploads/estabelecimento-1783377106408-346549738.jpg",
    address: item.endereco || "QuixadÃ¡ - CE",
    phone: item.telefone || "",
    hours: "HorÃ¡rio nÃ£o informado",
    instagram: item.instagram || "",
    description:
      item.descricao || "Estabelecimento cadastrado no EasyQuixadÃ¡.",
  };
}

async function loadEstablishmentsFromDatabase() {
  try {
    const response = await fetch(`${API_URL}/estabelecimentos`);

    if (!response.ok) {
      throw new Error("Nao foi possivel carregar os estabelecimentos.");
    }

    const data = await response.json();

    console.log("Estabelecimentos carregados do banco de dados:", data);

    establishments = data.length
      ? data.map(establishmentFromApi)
      : fallbackEstablishments;
  } catch (error) {
    establishments = fallbackEstablishments;
  }
}

function renderHome() {
  const filtered = getFilteredEstablishments();

  document.querySelector("#app").innerHTML = `
    <section class="screen">
      <header class="topbar">
        <div class="brand-mark" aria-label="EasyQuixada"><img src="assets/logo-icon.png" alt=""></div>
        <div class="brand"><img src="assets/logo-wordmark.png" alt="EasyQuixadá"></div>
        <div class="avatar" aria-label="Perfil do usuário"></div>
      </header>

      <div class="hero-copy">
        <p>O que vamos descobrir hoje?</p>
      </div>

      <label class="search">
        ${icons.search}
        <input id="search-input" type="search" value="${escapeHtml(searchTerm)}" placeholder="Restaurantes, academias, farmácias..." />
      </label>  

      <div class="category-row" aria-label="Categorias">
        ${categories
          .slice(1)
          .map(
            (category) => `
              <button class="category-button ${category.id === activeCategory ? "is-active" : ""}" data-category="${category.id}" type="button">
                <span class="category-icon ${category.className}">${category.symbol}</span>
                <span>${category.label}</span>
              </button>
            `,
          )
          .join("")}
      </div>

      <h2 class="section-title" id="section-title">${getSectionTitle()}</h2>

      <div class="featured-list" id="featured-list">
        ${filtered.length ? renderCards(filtered) : '<div class="empty-state">Nenhum estabelecimento encontrado.</div>'}
      </div>
    </section>
    ${renderBottomNav("home")}
  `;

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory =
        activeCategory === button.dataset.category
          ? "todos"
          : button.dataset.category;
      renderHome();
    });
  });

  document.querySelector("#search-input").addEventListener("input", (event) => {
    searchTerm = event.target.value;
    updateResults();
  });

  bindCards();
}

function getFilteredEstablishments() {
  return establishments.filter((item) => {
    const matchesCategory =
      activeCategory === "todos" || item.category === activeCategory;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      [item.name, item.categoryLabel, item.address, item.description]
        .join(" ")
        .toLowerCase()
        .includes(term);
    return matchesCategory && matchesSearch;
  });
}

function getSectionTitle() {
  return activeCategory === "todos" && !searchTerm.trim()
    ? "Destaques de Quixadá"
    : "Estabelecimentos encontrados";
}

function updateResults() {
  const filtered = getFilteredEstablishments();
  document.querySelector("#section-title").textContent = getSectionTitle();
  document.querySelector("#featured-list").innerHTML = filtered.length
    ? renderCards(filtered)
    : '<div class="empty-state">Nenhum estabelecimento encontrado.</div>';
  bindCards();
}

function bindCards() {
  document.querySelectorAll("[data-open]").forEach((card) => {
    card.addEventListener("click", () => {
      location.hash = `#/estabelecimento/${card.dataset.open}`;
    });
  });
}

function renderCards(items) {
  const [first, ...rest] = items;
  const compactRows = [];

  for (let index = 0; index < rest.length; index += 2) {
    const pair = rest.slice(index, index + 2);
    compactRows.push(
      `<div class="${pair.length === 2 ? "two-column" : ""}">${pair.map((item) => renderCard(item, true)).join("")}</div>`,
    );
  }

  return [renderCard(first), ...compactRows].join("");
}

function renderCard(item, compact = false) {
  return `
    <button class="establishment-card ${compact ? "compact" : ""}" data-open="${escapeHtml(item.id)}" type="button" aria-label="Ver detalhes de ${escapeHtml(item.name)}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
      <div class="card-info">
        <strong class="card-title">${escapeHtml(item.name)}</strong>
        <span class="card-cta">Ver detalhes</span>
      </div>
      ${compact ? `<span class="card-meta" aria-hidden="true">${icons.instagram}</span>` : ""}
    </button>
  `;
}

function renderDetails(id) {
  const item =
    establishments.find((establishment) => establishment.id === id) ||
    establishments[0];

  document.querySelector("#app").innerHTML = `
    <section class="screen">
      <div class="detail-hero">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
        <div class="hero-actions">
          <button class="icon-button" id="back-button" type="button" aria-label="Voltar">${icons.back}</button>
          <button class="icon-button" type="button" aria-label="Favoritar">${icons.heart}</button>
        </div>
        <div class="detail-title">
          <span class="badge">${item.categoryLabel}</span>
          <h1>${item.name}</h1>
          <p>${item.address}</p>
        </div>
      </div>

      <div class="detail-content">
        <section class="info-panel">
          <h2>Sobre o estabelecimento</h2>
          <p>${item.description}</p>
        </section>

        <section class="info-panel facts" aria-label="Informações do estabelecimento">
          <div class="fact">${icons.pin}<span>${item.address}</span></div>
          <div class="fact">${icons.clock}<span>${item.hours}</span></div>
          <div class="fact">${icons.phone}<span>${item.phone}</span></div>
          <div class="fact">${icons.instagram}<span>${item.instagram}</span></div>
        </section>

        <div class="action-row">
          <a class="primary-action" href="tel:${item.phone.replace(/\D/g, "")}">Ligar agora</a>
          <a class="secondary-action" href="#/">Ver lista</a>
        </div>
      </div>
    </section>
    ${renderBottomNav("guia")}
  `;

  document.querySelector("#back-button").addEventListener("click", () => {
    location.hash = "#/";
  });
}

function renderBottomNav(active) {
  return `
    <nav class="bottom-nav" aria-label="Navegação principal">
      <button class="nav-item" type="button" aria-label="Favoritos">${icons.heart}<span>Favoritos</span></button>
      <button class="nav-item ${active === "home" ? "is-active" : ""}" type="button" onclick="location.hash='#/'">${icons.home}<span>Home</span></button>
      <button class="nav-item ${active === "guia" ? "is-active" : ""}" type="button" onclick="location.hash='#/'">${icons.compass}<span>Guia</span></button>
    </nav>
  `;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function route() {
  const detailMatch = location.hash.match(/^#\/estabelecimento\/(.+)$/);
  if (detailMatch) {
    renderDetails(detailMatch[1]);
    return;
  }

  renderHome();
}

window.addEventListener("hashchange", route);
loadEstablishmentsFromDatabase().then(route);
