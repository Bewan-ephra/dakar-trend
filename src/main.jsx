import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BarChart3, BadgePercent, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, Clock3, CreditCard, Eye, Filter,
  Grid2X2, Heart, HelpCircle, Home, LayoutDashboard, LogOut, MapPin, Menu, MessageCircle,
  Minus, MoreHorizontal, Package, PanelLeftClose, PanelLeftOpen, Plus, RotateCcw, Search,
  ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles, Star, Store, Tags,
  Trash2, Truck, UserCheck, UsersRound, Wrench, X, Zap
} from 'lucide-react'
import { categories, formatPrice, products } from './data/products'
import { createOrder, fetchCatalog, fetchOrders, getCurrentUser, logoutAdmin, requireDepositForPhone, updateOrder } from './lib/api'
import { checkPaymentRule, deletePaymentRule, fetchPaymentRules, updatePaymentRule } from './lib/risk'
import './styles.css'

const navCategories = ['Femme', 'Homme', 'Enfant', 'Chaussures', 'Bijoux', 'Montres', 'Audio']
const heroSlides = [
  { eyebrow: 'DROP 01 / 2026', title: 'Le style qui\narrive avant toi.', copy: 'Nouveaux looks, prix doux. Jusqu’à -50% sur une sélection qui part vite.', cta: 'Shopper la sélection', filter: 'Vêtements', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=90&auto=format&fit=crop', tone: 'coral' },
  { eyebrow: 'FLASH WEEK', title: 'Les bons plans\nne patientent pas.', copy: 'Des pièces repérées, des quantités limitées et la livraison à Dakar dès 2 000 FCFA.', cta: 'Voir les ventes flash', filter: 'Tout', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=90&auto=format&fit=crop', tone: 'ink' },
  { eyebrow: 'TERANGA EDIT', title: 'Ton quotidien,\nmais en mieux.', copy: 'Mode, bijoux et tech : tout ce qu’il faut pour upgrader ton panier.', cta: 'Explorer Dakar Trend', filter: 'Tout', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=90&auto=format&fit=crop', tone: 'sand' },
]

const money = (value) => formatPrice(value)

function App() {
  const [path, setPath] = useState(window.location.pathname || '/')
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tout')
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [adminSection, setAdminSection] = useState('dashboard')
  const [catalogProducts, setCatalogProducts] = useState(products)
  const [adminAccess, setAdminAccess] = useState('idle')

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.title = path === '/admin' ? 'Admin — Dakar Trend' : 'Dakar Trend — Les looks qui partent vite'
  }, [path])

  useEffect(() => {
    let active = true
    fetchCatalog().then(items => { if (active) setCatalogProducts(items) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (path !== '/admin') { setAdminAccess('idle'); return undefined }
    setAdminAccess('checking')
    getCurrentUser().then(user => {
      if (user) setAdminAccess('authenticated')
      else window.location.href = 'http://localhost:8000/auth/login'
    }).catch(() => setAdminAccess('error'))
    return undefined
  }, [path])

  const navigate = (nextPath) => {
    const cleanPath = nextPath.split('?')[0]
    window.history.pushState({}, '', nextPath)
    setPath(cleanPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (cleanPath !== '/catalogue') setActiveCategory('Tout')
  }

  const notify = (message) => {
    setToast(message)
    window.clearTimeout(window.__dakartendToast)
    window.__dakartendToast = window.setTimeout(() => setToast(''), 2600)
  }

  const addToCart = (product, options = {}) => {
    setCart((current) => {
      const key = `${product.id}-${options.size || ''}-${options.color || ''}`
      const existing = current.find(item => item.key === key)
      if (existing) return current.map(item => item.key === key ? { ...item, quantity: Math.min(item.quantity + (options.quantity || 1), product.stock) } : item)
      return [...current, { key, product, quantity: options.quantity || 1, size: options.size || product.sizes[0], color: options.color || product.colors[0] }]
    })
    notify(`${product.name} ajouté au panier`)
    setCartOpen(true)
  }

  const updateQuantity = (key, delta) => {
    setCart(current => current.map(item => item.key === key ? { ...item, quantity: Math.max(1, Math.min(item.quantity + delta, item.product.stock)) } : item))
  }

  const removeFromCart = (key) => setCart(current => current.filter(item => item.key !== key))

  const toggleFavorite = (product) => {
    setFavorites(current => current.includes(product.id) ? current.filter(id => id !== product.id) : [...current, product.id])
    notify(favorites.includes(product.id) ? 'Retiré des favoris' : 'Ajouté aux favoris')
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const favoriteProducts = catalogProducts.filter(product => favorites.includes(product.id))
  const routeProduct = path.startsWith('/produit/') ? catalogProducts.find(product => product.id === path.split('/').pop()) : null

  const selectCategory = (category) => {
    setActiveCategory(category)
    navigate('/catalogue')
  }

  const renderPage = () => {
    if (path === '/admin') return adminAccess === 'authenticated' ? <AdminPage section={adminSection} setSection={setAdminSection} navigate={navigate} notify={notify} /> : <section className="container info-page"><span className="kicker">BACK OFFICE</span><h1>Vérification de la session…</h1><p>Redirection vers la connexion administrateur.</p></section>
    if (path === '/catalogue') return <CataloguePage products={catalogProducts} activeCategory={activeCategory} setActiveCategory={setActiveCategory} search={search} setSearch={setSearch} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} />
    if (path === '/favoris') return <FavoritesPage products={favoriteProducts} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} />
    if (path === '/panier') return <CartPage cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} cartTotal={cartTotal} navigate={navigate} />
    if (path === '/checkout') return <CheckoutPage cart={cart} cartTotal={cartTotal} setCart={setCart} orderPlaced={orderPlaced} setOrderPlaced={setOrderPlaced} orderResult={orderResult} setOrderResult={setOrderResult} navigate={navigate} notify={notify} />
    if (path === '/compte') return <AccountPage navigate={navigate} notify={notify} />
    if (routeProduct) return <ProductPage product={routeProduct} products={catalogProducts} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} />
    if (path !== '/') return <InfoPage path={path} navigate={navigate} />
    return <HomePage products={catalogProducts} selectCategory={selectCategory} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} />
  }

  return (
    <div className="app-shell">
      <AnnouncementBar />
      <Header path={path} search={search} setSearch={setSearch} navigate={navigate} cartCount={cartCount} favoriteCount={favorites.length} selectCategory={selectCategory} />
      <main>{renderPage()}</main>
      <Footer navigate={navigate} />
      <MobileNav path={path} navigate={navigate} cartCount={cartCount} favoriteCount={favorites.length} />
      <CartDrawer open={cartOpen} setOpen={setCartOpen} cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} cartTotal={cartTotal} navigate={navigate} />
      <button className="whatsapp-float" aria-label="Écrire sur WhatsApp" onClick={() => notify('WhatsApp : +221 77 000 00 00')}><MessageCircle size={21} /><span>Besoin d’aide ?</span></button>
      <button className="back-top" aria-label="Retour en haut" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={18} /></button>
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  )
}

function AnnouncementBar() {
  return <div className="announcement"><div className="announcement-track"><span><Truck size={14} /> Livraison à Dakar dès 2 000 FCFA</span><span><Zap size={14} /> Paiement Wave & Orange Money</span><span><Store size={14} /> Retrait gratuit au showroom</span><span><ShieldCheck size={14} /> Échange sous 7 jours</span><span><Truck size={14} /> Livraison à Dakar dès 2 000 FCFA</span></div></div>
}

function Header({ path, search, setSearch, navigate, cartCount, favoriteCount, selectCategory }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const submitSearch = (event) => {
    event.preventDefault()
    navigate('/catalogue')
  }
  return <>
    <header className="site-header">
      <div className="header-main container">
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">{menuOpen ? <X /> : <Menu />}</button>
        <button className="brand" onClick={() => navigate('/')} aria-label="Dakar Trend accueil"><span className="brand-mark">DT<span>•</span></span><span className="brand-copy">Dakar <b>Trend</b><small>DAKAR / ONLINE</small></span></button>
        <form className="search-form" onSubmit={submitSearch}><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une pièce, une vibe..." /><kbd>⌘ K</kbd></form>
        <div className="header-actions">
          <button className="icon-action" onClick={() => navigate('/compte')}><CircleUserRound size={20} /><span>Compte</span></button>
          <button className="icon-action" onClick={() => navigate('/favoris')}><span className="icon-badge"><Heart size={20} />{favoriteCount > 0 && <b>{favoriteCount}</b>}</span><span>Favoris</span></button>
          <button className="icon-action" onClick={() => navigate('/panier')}><span className="icon-badge"><ShoppingBag size={20} />{cartCount > 0 && <b>{cartCount}</b>}</span><span>Panier</span></button>
        </div>
      </div>
      <div className={`category-bar ${menuOpen ? 'open' : ''}`}><div className="container category-scroll"><button className={path === '/' ? 'active' : ''} onClick={() => navigate('/')}>Accueil</button>{navCategories.map(category => <button key={category} onClick={() => selectCategory(category === 'Audio' ? 'Audio & accessoires' : category)}>{category}</button>)}<button className="promo-link" onClick={() => selectCategory('Tout')}><BadgePercent size={15} /> Promos</button></div></div>
    </header>
  </>
}

function HomePage({ products, selectCategory, addToCart, favorites, toggleFavorite, navigate }) {
  const [slide, setSlide] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setSlide(current => (current + 1) % heroSlides.length), 5600); return () => window.clearInterval(timer) }, [])
  const flash = products.filter(p => p.isFlash).slice(0, 5)
  const fresh = products.filter(p => p.badge === 'Nouveau').slice(0, 5)
  const best = products.filter(p => p.badge === 'Best-seller').slice(0, 5)
  const deals = products.filter(p => p.price < 15000).slice(0, 5)
  return <>
    <section className="hero container">
      <div className={`hero-main tone-${heroSlides[slide].tone}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(13,13,15,.87) 0%, rgba(13,13,15,.45) 48%, rgba(13,13,15,.06) 100%), url(${heroSlides[slide].image})` }}>
        <div className="hero-content"><span className="eyebrow">{heroSlides[slide].eyebrow}</span><h1>{heroSlides[slide].title.split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h1><p>{heroSlides[slide].copy}</p><button className="button button-light" onClick={() => selectCategory(heroSlides[slide].filter)}>{heroSlides[slide].cta}<ArrowRight size={16} /></button></div>
        <div className="hero-dots">{heroSlides.map((item, index) => <button key={item.eyebrow} className={index === slide ? 'active' : ''} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} />)}</div>
        <div className="hero-count">0{slide + 1}<span>/ 03</span></div>
      </div>
      <div className="hero-side"><button className="editorial-card editorial-order" onClick={() => navigate('/contact')}><span>PERSONNALISE</span><strong>Sur<br />commande</strong><ArrowUpRight /></button><button className="editorial-card editorial-browse" onClick={() => navigate('/catalogue')}><span>LA SÉLECTION DT</span><strong>Parcourir<br />les produits</strong><ArrowUpRight /></button></div>
    </section>
    <section className="trust-strip"><div className="container trust-items"><span><Truck /> Livraison rapide à Dakar <small>en 24–48h</small></span><span><Store /> Retrait showroom <small>gratuit aux Almadies</small></span><span><ShieldCheck /> Paiement sécurisé <small>Wave, Orange Money</small></span><span><RotateCcw /> Échanges faciles <small>sous 7 jours</small></span></div></section>
    <FlashCountdown products={flash} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} />
    <ProductRail title="Nouveautés" kicker="DROP FRESH" products={fresh} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} action="Voir tout" />
    <CategoryTiles selectCategory={selectCategory} />
    <ProductRail title="Meilleures ventes" kicker="VU SUR DAKAR" products={best} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} action="Les best-sellers" dark />
    <ProductRail title="Bons plans à petit prix" kicker="MOINS DE 15 000 FCFA" products={deals} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} action="Tout à petit prix" />
    <section className="story-banner container"><div><span className="eyebrow">Dakar Trend / Studio</span><h2>Pas besoin d’attendre<br /><em>pour être remarquable.</em></h2><p>Une sélection pensée pour ton quotidien, tes envies et ton budget. Choisis ton rythme : livraison, retrait, ou commande personnalisée.</p><button className="button button-dark" onClick={() => navigate('/a-propos')}>Notre histoire <ArrowRight size={16} /></button></div><div className="story-stamp">DT<br /><small>TERANGA<br />EDIT</small></div></section>
  </>
}

function FlashCountdown({ products, addToCart, favorites, toggleFavorite, navigate }) {
  return <section className="section container flash-section"><div className="section-head"><div><span className="kicker"><Zap size={14} /> LIVE NOW</span><h2>Ventes flash</h2><p>Les quantités ne sont pas timides. Ton panier non plus.</p></div><div className="countdown"><span>Se termine dans</span><b>08</b><i>:</i><b>42</b><i>:</i><b>17</b></div><button className="text-link" onClick={() => navigate('/catalogue')}>Tout voir <ArrowRight size={16} /></button></div><div className="flash-pills"><span><span className="pulse-dot" /> Offre active</span><span>Jusqu’à -50%</span><span>Stock limité</span></div><div className="flash-products">{products.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} isFavorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} navigate={navigate} />)}</div></section>
}

function ProductRail({ title, kicker, products, addToCart, favorites, toggleFavorite, navigate, action, dark = false }) {
  return <section className={`section container product-section ${dark ? 'section-dark' : ''}`}><div className="section-head"><div><span className="kicker">{kicker}</span><h2>{title}</h2></div><button className="text-link" onClick={() => navigate('/catalogue')}>{action} <ArrowRight size={16} /></button></div><div className="product-rail">{products.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} isFavorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} navigate={navigate} />)}</div></section>
}

function CategoryTiles({ selectCategory }) {
  const tileData = [
    ['Vêtements', 'Le look en premier', 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=85&auto=format&fit=crop'],
    ['Chaussures', 'Marche comme tu veux', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85&auto=format&fit=crop'],
    ['Bijoux', 'Le détail qui change tout', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=85&auto=format&fit=crop'],
    ['Tech', 'Ton quotidien, chargé', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&q=85&auto=format&fit=crop'],
  ]
  return <section className="section container categories-section"><div className="section-head"><div><span className="kicker">SHOP PAR UNIVERS</span><h2>Top catégories</h2></div><span className="section-note">Choisis ta vibe <Sparkles size={15} /></span></div><div className="category-tiles">{tileData.map(([name, tagline, image]) => <button className="category-tile" key={name} onClick={() => selectCategory(name === 'Tech' ? 'Audio & accessoires' : name)} style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,.02), rgba(10,10,10,.77)), url(${image})` }}><span>{tagline}</span><strong>{name}</strong><ArrowUpRight /></button>)}</div></section>
}

function ProductCard({ product, addToCart, isFavorite, toggleFavorite, navigate }) {
  return <article className="product-card" onClick={() => navigate(`/produit/${product.id}`)}><div className="product-image-wrap"><img src={product.image} alt={product.name} loading="lazy" /><div className="product-badges"><span className={product.badge === 'Petit prix' ? 'badge badge-green' : 'badge'}>{product.badge}</span>{product.discount > 20 && <span className="discount-badge">-{product.discount}%</span>}</div><button className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(product) }} aria-label="Ajouter aux favoris"><Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} /></button><button className="quick-add" onClick={(event) => { event.stopPropagation(); addToCart(product) }} aria-label="Ajouter rapidement au panier"><Plus size={18} /></button></div><div className="product-info"><div className="product-meta"><span>{product.category}</span><span>{product.stock < 8 ? 'Stock limité' : 'En stock'}</span></div><h3>{product.name}</h3><div className="rating"><span className="stars">{'★'.repeat(Math.round(product.rating))}</span><span>{product.rating}</span><small>({product.reviews})</small></div><div className="price-row"><strong>{money(product.price)}</strong><del>{money(product.oldPrice)}</del></div></div></article>
}

function CataloguePage({ products, activeCategory, setActiveCategory, search, setSearch, addToCart, favorites, toggleFavorite, navigate }) {
  const [sort, setSort] = useState('recommended')
  const [visible, setVisible] = useState(12)
  const [mobileFilters, setMobileFilters] = useState(false)
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    const result = products.filter(product => (activeCategory === 'Tout' || product.category === activeCategory || (activeCategory === 'Femme' && product.category === 'Vêtements') || (activeCategory === 'Homme' && product.category === 'Vêtements') || (activeCategory === 'Enfant' && product.category === 'Vêtements') || (activeCategory === 'Chaussures' && product.category === 'Chaussures') || (activeCategory === 'Audio' && product.category === 'Audio & accessoires')) && (!query || `${product.name} ${product.category}`.toLowerCase().includes(query)))
    return [...result].sort((a, b) => sort === 'price-up' ? a.price - b.price : sort === 'price-down' ? b.price - a.price : sort === 'new' ? (b.badge === 'Nouveau') - (a.badge === 'Nouveau') : b.rating - a.rating)
  }, [products, activeCategory, search, sort])
  const filterButtons = ['Tout', 'Vêtements', 'Chaussures', 'Bijoux', 'Montres', 'Audio & accessoires']
  return <section className="catalogue-page container"><div className="breadcrumbs"><button onClick={() => navigate('/')}>Accueil</button><ChevronRight size={14} /><span>Catalogue</span></div><div className="catalogue-head"><div><span className="kicker">SHOP THE DROP</span><h1>{activeCategory === 'Tout' ? 'Tous les produits' : activeCategory}</h1><p>{filtered.length} pièces sélectionnées pour toi</p></div><button className="button button-outline mobile-filter-button" onClick={() => setMobileFilters(true)}><SlidersHorizontal size={16} /> Filtres</button></div><div className="catalogue-layout"><aside className={`filters ${mobileFilters ? 'mobile-open' : ''}`}><div className="filter-mobile-head"><b>Filtrer par</b><button onClick={() => setMobileFilters(false)}><X size={19} /></button></div><div className="filter-group"><span className="filter-label">Catégories</span>{filterButtons.map(item => <button key={item} className={activeCategory === item ? 'filter-option active' : 'filter-option'} onClick={() => { setActiveCategory(item); setVisible(12); setMobileFilters(false) }}>{item}<small>{item === 'Tout' ? products.length : products.filter(p => p.category === item).length}</small></button>)}</div><div className="filter-group"><span className="filter-label">Prix</span><div className="price-inputs"><input placeholder="Min" /><span>—</span><input placeholder="Max" /></div><div className="range-line"><span /><i /><span /></div></div><div className="filter-group"><span className="filter-label">Disponibilité</span><label className="check-row"><input type="checkbox" defaultChecked /> En stock <small>39</small></label><label className="check-row"><input type="checkbox" /> Promotions <small>28</small></label></div><div className="filter-tip"><Sparkles size={17} /><b>Besoin d’aide ?</b><p>Notre équipe peut te conseiller par WhatsApp.</p><button onClick={() => setMobileFilters(false)}>Écrire à l’équipe <ArrowRight size={14} /></button></div></aside><div className="catalogue-results"><div className="catalogue-toolbar"><span><b>{filtered.length}</b> résultats</span><div className="sort-select"><span>Trier par</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommandés</option><option value="new">Nouveautés</option><option value="price-up">Prix croissant</option><option value="price-down">Prix décroissant</option><option value="popular">Popularité</option></select><ChevronDown size={15} /></div></div>{filtered.length === 0 ? <div className="empty-state"><Search size={34} /><h3>Aucune pièce trouvée</h3><p>Essaie avec un autre mot-clé ou retire un filtre.</p><button className="button button-dark" onClick={() => { setSearch(''); setActiveCategory('Tout') }}>Réinitialiser</button></div> : <><div className="product-grid">{filtered.slice(0, visible).map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} isFavorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} navigate={navigate} />)}</div>{visible < filtered.length && <button className="load-more" onClick={() => setVisible(value => value + 12)}>Voir plus de produits <ArrowDownIcon /></button>}</>}</div></div></section>
}

function ArrowDownIcon() { return <ChevronDown size={17} /> }

function ProductPage({ product, products, addToCart, favorites, toggleFavorite, navigate }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [size, setSize] = useState(product.sizes[0])
  const [color, setColor] = useState(product.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [detailsOpen, setDetailsOpen] = useState('description')
  const similar = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 4)
  return <section className="product-page container"><div className="breadcrumbs"><button onClick={() => navigate('/catalogue')}>Catalogue</button><ChevronRight size={14} /><span>{product.name}</span></div><div className="product-detail"><div className="product-gallery"><div className="thumbs">{product.gallery.map((image, index) => <button className={selectedImage === index ? 'active' : ''} key={image} onClick={() => setSelectedImage(index)}><img src={image} alt="" /></button>)}</div><div className="main-product-image"><img src={product.gallery[selectedImage]} alt={product.name} /><span className="zoom-hint"><Eye size={15} /> survolez pour zoomer</span></div></div><div className="product-detail-copy"><div className="product-meta"><span>{product.category}</span><span className="stock-live"><span /> {product.stock} en stock</span></div><h1>{product.name}</h1><div className="detail-rating"><span className="stars">★★★★★</span><b>{product.rating}</b><button>{product.reviews} avis</button><span className="ref">Réf. {product.id}</span></div><div className="detail-price"><strong>{money(product.price)}</strong><del>{money(product.oldPrice)}</del><span>-{product.discount}%</span></div><p className="detail-description">{product.description}</p><div className="variant-block"><div className="variant-head"><b>Couleur</b><span>{color}</span></div><div className="color-options">{product.colors.map(item => <button key={item} title={item} className={color === item ? 'active' : ''} onClick={() => setColor(item)}><span style={{ background: colorValue(item) }} /></button>)}</div></div><div className="variant-block"><div className="variant-head"><b>{product.kind === 'shoes' ? 'Pointure' : product.kind === 'clothing' ? 'Taille' : 'Format'}</b>{product.kind === 'clothing' && <button className="size-guide">Guide des tailles</button>}</div><div className="size-options">{product.sizes.map(item => <button key={item} className={size === item ? 'active' : ''} onClick={() => setSize(item)}>{item}</button>)}</div></div><div className="purchase-row"><div className="quantity-control"><button onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={16} /></button><b>{quantity}</b><button onClick={() => setQuantity(value => Math.min(product.stock, value + 1))}><Plus size={16} /></button></div><button className="button button-coral add-product" onClick={() => addToCart(product, { size, color, quantity })}>Ajouter au panier <Plus size={17} /></button><button className={`heart-detail ${favorites.includes(product.id) ? 'active' : ''}`} onClick={() => toggleFavorite(product)}><Heart fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button></div><div className="detail-benefits"><span><Truck size={18} /><b>Livraison Dakar</b><small>24–48h</small></span><span><Store size={18} /><b>Retrait showroom</b><small>gratuit</small></span><span><ShieldCheck size={18} /><b>Paiement local</b><small>Wave / OM</small></span></div></div></div><div className="product-tabs"><div className="tabs-nav"><button className={detailsOpen === 'description' ? 'active' : ''} onClick={() => setDetailsOpen('description')}>Description</button><button className={detailsOpen === 'specs' ? 'active' : ''} onClick={() => setDetailsOpen('specs')}>Détails & composition</button><button className={detailsOpen === 'reviews' ? 'active' : ''} onClick={() => setDetailsOpen('reviews')}>Avis clients <span>{product.reviews}</span></button></div><div className="tab-content">{detailsOpen === 'description' && <p>{product.description} Cette pièce est vérifiée par notre équipe avant expédition. Pour toute question sur la coupe, écris-nous directement sur WhatsApp.</p>}{detailsOpen === 'specs' && <div className="spec-list">{product.specs.map(spec => <span key={spec}><Check size={15} /> {spec}</span>)}</div>}{detailsOpen === 'reviews' && <div className="reviews-summary"><div><strong>{product.rating}</strong><span className="stars">★★★★★</span><small>Basé sur {product.reviews} avis</small></div><button className="button button-outline">Écrire un avis</button></div>}</div></div><ProductRail title="Tu pourrais aimer" kicker="À PORTÉE DE CLIC" products={similar} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} action="Voir plus" /></section>
}

function colorValue(color) {
  return { Noir: '#161619', 'Rose poudré': '#e8b7bd', Écru: '#e9dfcb', Blanc: '#f6f6f4', Rose: '#fa7893', Doré: '#d7a94f', Argenté: '#ccd1d8', Acier: '#88909a', Or: '#d7a94f', Argent: '#c8cbd1' }[color] || '#ff3b5c'
}

function CartDrawer({ open, setOpen, cart, updateQuantity, removeFromCart, cartTotal, navigate }) {
  const shippingLeft = Math.max(0, 50000 - cartTotal)
  return <div className={`drawer-layer ${open ? 'open' : ''}`}><div className="drawer-backdrop" onClick={() => setOpen(false)} /><aside className="cart-drawer"><div className="drawer-head"><div><span className="kicker">TON PANIER</span><h2>{cart.length} article{cart.length > 1 ? 's' : ''}</h2></div><button onClick={() => setOpen(false)}><X /></button></div>{cart.length === 0 ? <div className="drawer-empty"><ShoppingBag size={42} /><h3>Ton panier est vide</h3><p>Il y a sûrement une pièce qui t’attend quelque part.</p><button className="button button-dark" onClick={() => { setOpen(false); navigate('/catalogue') }}>Découvrir les produits</button></div> : <><div className="free-shipping">{shippingLeft > 0 ? <>Plus que <b>{money(shippingLeft)}</b> pour la livraison offerte</> : <><CheckCircle2 size={15} /> Livraison offerte débloquée</>}</div><div className="drawer-items">{cart.map(item => <div className="drawer-item" key={item.key}><img src={item.product.image} alt={item.product.name} /><div className="drawer-item-copy"><b>{item.product.name}</b><small>{item.color} · {item.size}</small><strong>{money(item.product.price)}</strong><div className="mini-quantity"><button onClick={() => updateQuantity(item.key, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.key, 1)}><Plus size={13} /></button></div></div><button className="remove-item" onClick={() => removeFromCart(item.key)}><Trash2 size={15} /></button></div>)}</div><div className="drawer-foot"><div className="drawer-total"><span>Sous-total</span><strong>{money(cartTotal)}</strong></div><small>Livraison calculée à l’étape suivante</small><button className="button button-coral full-width" onClick={() => { setOpen(false); navigate('/checkout') }}>Passer la commande <ArrowRight size={17} /></button><button className="continue-shopping" onClick={() => setOpen(false)}>Continuer mes achats</button></div></>}</aside></div>
}

function CartPage({ cart, updateQuantity, removeFromCart, cartTotal, navigate }) {
  return <section className="cart-page container"><div className="breadcrumbs"><button onClick={() => navigate('/')}>Accueil</button><ChevronRight size={14} /><span>Panier</span></div><div className="page-title-row"><div><span className="kicker">RÉCAP EXPRESS</span><h1>Ton panier</h1></div><span>{cart.length} ligne{cart.length > 1 ? 's' : ''}</span></div>{cart.length === 0 ? <div className="empty-page"><ShoppingBag size={45} /><h2>Ton panier attend son premier coup de cœur.</h2><button className="button button-dark" onClick={() => navigate('/catalogue')}>Parcourir les produits <ArrowRight size={16} /></button></div> : <div className="cart-layout"><div className="cart-list"><div className="cart-alert"><Truck size={18} /><span><b>Livraison offerte</b> dès 50 000 FCFA à Dakar</span></div>{cart.map(item => <div className="cart-line" key={item.key}><img src={item.product.image} alt={item.product.name} /><div className="cart-line-copy"><span>{item.product.category}</span><h3>{item.product.name}</h3><p>{item.color} · {item.size}</p><button onClick={() => removeFromCart(item.key)}><Trash2 size={14} /> Retirer</button></div><div className="cart-line-actions"><strong>{money(item.product.price * item.quantity)}</strong><div className="quantity-control"><button onClick={() => updateQuantity(item.key, -1)}><Minus size={15} /></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.key, 1)}><Plus size={15} /></button></div></div></div>)}</div><OrderSummary cartTotal={cartTotal} navigate={navigate} /></div>}</section>
}

function OrderSummary({ cartTotal, navigate }) {
  return <aside className="order-summary"><h2>Résumé de commande</h2><div><span>Sous-total</span><b>{money(cartTotal)}</b></div><div><span>Livraison</span><b>{cartTotal >= 50000 ? 'Offerte' : '2 000 FCFA'}</b></div><hr /><div className="summary-total"><span>Total estimé</span><strong>{money(cartTotal + (cartTotal >= 50000 ? 0 : 2000))}</strong></div><button className="button button-coral full-width" onClick={() => navigate('/checkout')}>Continuer <ArrowRight size={17} /></button><div className="secure-note"><ShieldCheck size={15} /> Paiement sécurisé et données protégées</div></aside>
}

function CheckoutPage({ cart, cartTotal, setCart, orderPlaced, setOrderPlaced, orderResult, setOrderResult, navigate, notify }) {
  const [mode, setMode] = useState('delivery')
  const [payment, setPayment] = useState('cod')
  const [form, setForm] = useState({ firstName: '', lastName: '', address: '', city: 'Dakar', phone: '' })
  const [error, setError] = useState('')
  const [paymentRule, setPaymentRule] = useState(null)
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  useEffect(() => {
    const phone = form.phone.trim()
    if (phone.replace(/\D/g, '').length < 8) { setPaymentRule(null); return undefined }
    const timer = setTimeout(() => checkPaymentRule(phone).then(result => { setPaymentRule(result); if (result.requires_deposit) setPayment('wave') }).catch(() => setPaymentRule(null)), 450)
    return () => clearTimeout(timer)
  }, [form.phone])
  const submit = async (event) => {
    event.preventDefault()
    if (!cart.length) return navigate('/catalogue')
    const required = mode === 'pickup' ? ['firstName', 'lastName', 'phone'] : ['firstName', 'lastName', 'address', 'city', 'phone']
    const missing = required.find(key => !form[key].trim())
    if (missing) { setError('Complète les champs obligatoires pour continuer.'); return }
    setError('')
    try {
      const result = await createOrder({ first_name: form.firstName, last_name: form.lastName, phone: form.phone, delivery_mode: mode, address: mode === 'delivery' ? form.address : null, city: mode === 'delivery' ? form.city : null, payment_method: payment, items: cart.map(item => ({ product_id: item.product.backendId || item.product.id, quantity: item.quantity, size: item.size, color: item.color })) })
      setOrderResult(result.order); setOrderPlaced(true); setCart([]); notify('Commande enregistrée')
    } catch (submissionError) { setError(submissionError.message || 'Impossible d’enregistrer la commande.') }
  }
  if (orderPlaced) return <section className="checkout-page container"><div className="success-page"><div className="success-icon"><CheckCircle2 size={42} /></div><span className="kicker">MERCI POUR TA CONFIANCE</span><h1>Commande confirmée.</h1><p>{orderResult?.payment_method === 'cod' ? <>Tu paieras <b>à la réception</b> de ta commande. Notre équipe te recontactera sur WhatsApp pour confirmer la livraison.</> : <>Ton lien de paiement pour l’acompte de 50 % sera envoyé par WhatsApp au <b>{form.phone}</b>.</>}</p><div className="success-card"><div><span>Référence</span><b>{orderResult?.reference || 'En cours de génération'}</b></div><div><span>{orderResult?.payment_method === 'cod' ? 'Paiement' : 'Acompte'}</span><b>{orderResult?.payment_method === 'cod' ? 'À la livraison' : money(orderResult?.deposit_amount || 0)}</b></div><div><span>Statut</span><b className="status-pill green">Commande enregistrée</b></div></div><button className="button button-dark" onClick={() => { setOrderPlaced(false); navigate('/') }}>Retourner à l’accueil <ArrowRight size={16} /></button></div></section>
  return <section className="checkout-page container"><div className="breadcrumbs"><button onClick={() => navigate('/panier')}>Panier</button><ChevronRight size={14} /><span>Paiement</span></div><div className="checkout-head"><div><span className="kicker">DERNIÈRE ÉTAPE</span><h1>Finaliser la commande</h1></div><span className="checkout-secure"><ShieldCheck size={16} /> Checkout sécurisé</span></div><form className="checkout-layout" onSubmit={submit}><div className="checkout-form"><div className="checkout-card"><div className="card-title"><span>01</span><div><h2>Contact</h2><p>Nous te contacterons sur WhatsApp pour confirmer la livraison.</p></div></div><div className="form-grid"><Field label="Prénom" value={form.firstName} onChange={value => update('firstName', value)} required /><Field label="Nom" value={form.lastName} onChange={value => update('lastName', value)} required /><Field label="Téléphone WhatsApp" value={form.phone} onChange={value => update('phone', value)} placeholder="+221 77 000 00 00" required wide /></div></div><div className="checkout-card"><div className="card-title"><span>02</span><div><h2>Mode de réception</h2><p>Choisis ce qui te convient le mieux.</p></div></div><div className="delivery-options"><button type="button" className={mode === 'delivery' ? 'delivery-option active' : 'delivery-option'} onClick={() => setMode('delivery')}><Truck /><span><b>Expédier ma commande</b><small>À partir de 2 000 FCFA · 24–48h</small></span><Check size={17} /></button><button type="button" className={mode === 'pickup' ? 'delivery-option active' : 'delivery-option'} onClick={() => setMode('pickup')}><Store /><span><b>Retrait au showroom</b><small>Gratuit · Almadies, Dakar</small></span><Check size={17} /></button></div>{mode === 'delivery' && <div className="form-grid address-grid"><Field label="Adresse de livraison" value={form.address} onChange={value => update('address', value)} placeholder="Quartier, rue, repère..." required wide /><Field label="Ville" value={form.city} onChange={value => update('city', value)} required /></div>}{mode === 'pickup' && <div className="pickup-note"><MapPin size={17} /><span>Showroom Dakar Trend<br /><small>Route des Almadies, Dakar · Lun–Sam 10h–19h</small></span></div>}</div><div className="checkout-card"><div className="card-title"><span>03</span><div><h2>Paiement</h2><p>Le paiement à la livraison est proposé par défaut.</p></div></div>{paymentRule?.requires_deposit && <div className="payment-rule-alert">Ce numéro doit régler un acompte de 50 % avant livraison. Choisis Wave ou Orange Money.</div>}<div className="payment-options"><button type="button" disabled={paymentRule?.requires_deposit} className={payment === 'cod' ? 'payment-option active' : 'payment-option'} onClick={() => setPayment('cod')}><span className="payment-logo cod">↓</span><span><b>Paiement à la livraison</b><small>Tu paies quand tu reçois ta commande</small></span><Check size={17} /></button><button type="button" className={payment === 'wave' ? 'payment-option active' : 'payment-option'} onClick={() => setPayment('wave')}><span className="payment-logo wave">W</span><span><b>Wave</b><small>Acompte de 50 % par lien WhatsApp</small></span><Check size={17} /></button><button type="button" className={payment === 'orange' ? 'payment-option active' : 'payment-option'} onClick={() => setPayment('orange')}><span className="payment-logo orange">OM</span><span><b>Orange Money</b><small>Acompte de 50 % par lien WhatsApp</small></span><Check size={17} /></button></div><button type="button" className="how-pay"><HelpCircle size={16} /> Un client peut être soumis à un acompte <ArrowRight size={14} /></button></div>{error && <div className="form-error"><Wrench size={16} /> {error}</div>}<button type="submit" className="button button-coral checkout-submit">Confirmer la commande <ArrowRight size={18} /></button></div><OrderSummary cartTotal={cartTotal} navigate={navigate} /></form></section>
}

function Field({ label, value, onChange, placeholder = '', required = false, wide = false }) { return <label className={`field ${wide ? 'wide' : ''}`}><span>{label} {required && <i>*</i>}</span><input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} required={required} /></label> }

function FavoritesPage({ products, addToCart, favorites, toggleFavorite, navigate }) {
  return <section className="favorites-page container"><div className="breadcrumbs"><button onClick={() => navigate('/')}>Accueil</button><ChevronRight size={14} /><span>Favoris</span></div><div className="page-title-row"><div><span className="kicker">TES COUPS DE CŒUR</span><h1>Favoris</h1></div><span>{products.length} pièce{products.length > 1 ? 's' : ''}</span></div>{products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} isFavorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} navigate={navigate} />)}</div> : <div className="empty-page"><Heart size={45} /><h2>Pas encore de favoris.</h2><p>Appuie sur le cœur des pièces qui te font de l’œil.</p><button className="button button-dark" onClick={() => navigate('/catalogue')}>Explorer la sélection <ArrowRight size={16} /></button></div>}</section>
}

function AccountPage({ navigate, notify }) {
  const [section, setSection] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('Awa Ndiaye')
  const [phone, setPhone] = useState('+221 77 000 00 00')
  const selectSection = (value) => setSection(value)
  return <section className="account-page container"><div className="breadcrumbs"><button onClick={() => navigate('/')}>Accueil</button><ChevronRight size={14} /><span>Mon compte</span></div><div className="account-hero"><div className="avatar">AN</div><div><span className="kicker">BIENVENUE À NOUVEAU</span><h1>{name}</h1><p>awa.ndiaye@email.com · Membre depuis mars 2026</p></div><button className="button button-outline" onClick={() => setEditing(value => !value)}><Wrench size={15} /> {editing ? 'Fermer' : 'Modifier le profil'}</button></div>{editing && <div className="account-edit-card"><div className="form-grid"><Field label="Nom complet" value={name} onChange={setName} /><Field label="Téléphone WhatsApp" value={phone} onChange={setPhone} /></div><button className="button button-coral" onClick={() => { setEditing(false); notify('Profil mis à jour') }}>Enregistrer les modifications <Check size={16} /></button></div>}<div className="account-layout"><aside className="account-nav"><button className={section === 'profile' ? 'active' : ''} onClick={() => selectSection('profile')}><CircleUserRound size={17} /> Profil</button><button className={section === 'orders' ? 'active' : ''} onClick={() => selectSection('orders')}><Package size={17} /> Mes commandes <span>3</span></button><button className={section === 'addresses' ? 'active' : ''} onClick={() => selectSection('addresses')}><MapPin size={17} /> Mes adresses</button><button className={section === 'favorites' ? 'active' : ''} onClick={() => navigate('/favoris')}><Heart size={17} /> Mes favoris</button><button onClick={() => notify('Vous êtes déjà connecté(e) à cet espace')}><LogOut size={17} /> Se déconnecter</button></aside><div className="account-content">{section === 'orders' ? <><div className="account-section-head"><div><span className="kicker">HISTORIQUE</span><h2>Mes commandes</h2></div></div><div className="order-history-card"><div className="order-history-top"><div><b>Commande #DT-2026-1008</b><span>12 octobre 2026 · 2 articles</span></div><span className="status-pill purple">Expédiée</span></div><div className="order-timeline"><TimelineItem label="En attente" done /><TimelineItem label="Confirmée" done /><TimelineItem label="Expédiée" done active /><TimelineItem label="Livrée" /></div><div className="order-history-foot"><span>Montant total <b>44 900 FCFA</b></span><button className="button button-outline" onClick={() => notify('Détail de la commande DT-2026-1008')}>Détails de la commande</button></div></div></> : section === 'addresses' ? <><div className="account-section-head"><div><span className="kicker">ADRESSES</span><h2>Mes adresses</h2></div><button className="button button-outline" onClick={() => notify('Formulaire d’adresse ouvert')}>Ajouter une adresse <Plus size={15} /></button></div><div className="account-info-grid"><div><MapPin size={20} /><b>Adresse principale</b><p>Route des Almadies, Dakar</p><button className="text-link" onClick={() => notify('Modification de l’adresse')}>Modifier <ArrowRight size={15} /></button></div></div></> : <><div className="account-section-head"><div><span className="kicker">DERNIÈRES COMMANDES</span><h2>Suivre mes commandes</h2></div><button className="text-link" onClick={() => selectSection('orders')}>Voir tout <ArrowRight size={15} /></button></div><div className="order-history-card"><div className="order-history-top"><div><b>Commande #DT-2026-1008</b><span>12 octobre 2026 · 2 articles</span></div><span className="status-pill purple">Expédiée</span></div><div className="order-timeline"><TimelineItem label="En attente" done /><TimelineItem label="Confirmée" done /><TimelineItem label="Expédiée" done active /><TimelineItem label="Livrée" /></div><div className="order-history-foot"><span>Montant total <b>44 900 FCFA</b></span><button className="button button-outline" onClick={() => selectSection('orders')}>Détails de la commande</button></div></div><div className="account-section-head compact"><div><span className="kicker">POUR TOI</span><h2>Infos pratiques</h2></div></div><div className="account-info-grid"><div><Truck size={20} /><b>Livraison suivie</b><p>On te prévient sur WhatsApp à chaque étape.</p></div><div><ShieldCheck size={20} /><b>Paiements sécurisés</b><p>Wave et Orange Money, sans prise de tête.</p></div><div><RotateCcw size={20} /><b>Échanges simples</b><p>Une taille ne va pas ? On trouve une solution.</p></div></div></>}</div></div></section>
}

function TimelineItem({ label, done, active }) { return <div className={`timeline-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}><span>{done ? <Check size={12} /> : ''}</span><small>{label}</small></div> }

function InfoPage({ path, navigate }) {
  const content = {
    '/a-propos': { kicker: 'DERRIÈRE LA VIBE', title: 'Dakar Trend, le style qui circule.', intro: 'On sélectionne des pièces tendance, accessibles et prêtes à vivre au rythme de Dakar.', sections: [['Une sélection qui bouge', 'Chaque semaine, notre équipe repère les silhouettes, accessoires et petits appareils qui ont le bon mix entre style, qualité et prix.'], ['Un commerce local, vraiment', 'Showroom aux Almadies, livraison partout dans Dakar et une équipe disponible sur WhatsApp : on reste proche, même quand la commande est en ligne.']] },
    '/contact': { kicker: 'ON EST LÀ', title: 'Parlons de ton prochain look.', intro: 'Une question sur une taille, une livraison ou une commande personnalisée ? Notre équipe répond du lundi au samedi.', sections: [['WhatsApp', '+221 77 000 00 00'], ['Showroom', 'Route des Almadies, Dakar — 10h à 19h'], ['Email', 'hello@dakartend.sn']] },
    '/faq': { kicker: 'QUESTIONS FRÉQUENTES', title: 'Les réponses, sans détour.', intro: 'Tout ce qu’il faut savoir avant de cliquer sur « ajouter au panier ».', sections: [['Quels sont les délais ?', 'À Dakar, compte 24 à 48h pour une livraison standard. Le retrait showroom est disponible gratuitement.'], ['Comment payer ?', 'Nous envoyons un lien de paiement Wave ou Orange Money par WhatsApp. Un acompte de 50 % confirme la commande.'], ['Puis-je échanger ?', 'Oui, sous 7 jours après réception, si la pièce est intacte et non portée.']] },
    '/cgv': { kicker: 'TRANSPARENCE', title: 'Les règles du jeu.', intro: 'Des conditions simples pour une expérience claire des deux côtés.', sections: [['Commande', 'Les prix sont affichés en FCFA et incluent les informations disponibles au moment de la commande.'], ['Paiement', 'La commande est réservée après réception de l’acompte confirmé par notre équipe.'], ['Données', 'Les données de contact servent uniquement à traiter et suivre la commande.']] },
    '/retours': { kicker: 'NO STRESS', title: 'Retours & échanges.', intro: 'Une taille ne va pas ou la couleur n’est pas celle imaginée ? On trouve une solution.', sections: [['Délai', 'Contacte-nous sous 7 jours après réception via WhatsApp avec ta référence de commande.'], ['État', 'La pièce doit être non portée, avec ses étiquettes et son emballage d’origine.'], ['Solution', 'Selon le stock, nous proposons un échange ou un avoir.']] },
  }[path] || { kicker: 'DAKAR TREND', title: 'Une page à la fois.', intro: 'Retrouve bientôt plus de contenus sur Dakar Trend.', sections: [] }
  return <section className="info-page container"><div className="info-hero"><span className="kicker">{content.kicker}</span><h1>{content.title}</h1><p>{content.intro}</p></div><div className="info-grid">{content.sections.map(([title, text], index) => <article key={title}><span className="info-index">0{index + 1}</span><h2>{title}</h2><p>{text}</p></article>)}</div><button className="button button-dark" onClick={() => navigate('/catalogue')}>Explorer la boutique <ArrowRight size={16} /></button></section>
}

function AdminPage({ section, setSection, navigate, notify }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menu = [['dashboard', 'Dashboard', LayoutDashboard], ['products', 'Produits', Tags], ['orders', 'Commandes', ShoppingCart], ['risk', 'Clients à risque', ShieldCheck], ['clients', 'Clients', UsersRound], ['content', 'Accueil & contenu', Wrench]]
  const handleLogout = async () => { await logoutAdmin(); notify('Déconnexion réussie'); window.location.href = '/' }
  return <section className="admin-page"><aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}><button className="admin-mobile-close" onClick={() => setSidebarOpen(false)}><PanelLeftClose size={18} /></button><div className="admin-brand"><span className="brand-mark">DT<span>•</span></span><div><b>DAKAR TREND</b><small>BACK OFFICE</small></div></div><div className="admin-menu">{menu.map(([key, label, Icon]) => <button className={section === key ? 'active' : ''} key={key} onClick={() => { setSection(key); setSidebarOpen(false) }}><Icon size={17} /> {label}{key === 'orders' && <em>↗</em>}</button>)}</div><div className="admin-user"><div className="avatar small">AM</div><div><b>Aminata Mbaye</b><small>Administratrice</small></div><button onClick={handleLogout} aria-label="Se déconnecter"><LogOut size={15} /></button></div></aside><div className="admin-main"><div className="admin-topbar"><div><button className="mobile-admin-menu" onClick={() => setSidebarOpen(true)}><PanelLeftOpen size={18} /></button><span className="kicker">BACK OFFICE / {section.toUpperCase()}</span><h1>{section === 'dashboard' ? 'Bonjour Aminata, voici la tendance.' : menu.find(item => item[0] === section)?.[1]}</h1></div><div className="admin-actions"><button onClick={() => navigate('/')}><Eye size={16} /> Voir la boutique</button><button className="admin-avatar" onClick={handleLogout} aria-label="Se déconnecter">AM</button></div></div>{section === 'dashboard' && <AdminDashboard setSection={setSection} />}{section === 'products' && <AdminProducts notify={notify} navigate={navigate} />}{section === 'orders' && <AdminOrders notify={notify} />}{section === 'risk' && <AdminRiskClients notify={notify} />}{section === 'clients' && <AdminClients notify={notify} />}{section === 'content' && <AdminContent notify={notify} />}</div></section>
}

function AdminDashboard({ setSection }) {
  const stats = [['Produits actifs', '40', '+8 ce mois', Tags, 'purple'], ['Commandes en attente', '08', '+3 aujourd’hui', ShoppingCart, 'coral'], ['Chiffre d’affaires', '2,84 M', '+18,4%', BarChart3, 'green'], ['Clients', '1 248', '+64 ce mois', UsersRound, 'blue']]
  return <div className="admin-content"><div className="stats-grid">{stats.map(([label, value, delta, Icon, tone]) => <div className={`stat-card ${tone}`} key={label}><div className="stat-top"><span>{label}</span><Icon size={19} /></div><strong>{value}</strong><small><span>↗</span> {delta}</small></div>)}</div><div className="admin-grid-main"><div className="admin-card sales-card"><div className="admin-card-head"><div><span className="kicker">PERFORMANCE</span><h2>Ventes des 30 derniers jours</h2></div><button onClick={() => setSection('orders')}>Voir les commandes <ChevronDown size={14} /></button></div><div className="sales-total"><strong>2 840 500 <small>FCFA</small></strong><span>+18,4% vs mois dernier</span></div><div className="fake-chart"><div className="chart-y"><span>400k</span><span>300k</span><span>200k</span><span>100k</span><span>0</span></div><div className="chart-area"><div className="chart-line" />{[28, 42, 34, 63, 54, 75, 50, 58, 77, 64, 85, 72, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}<div className="chart-x"><span>01 nov</span><span>08 nov</span><span>15 nov</span><span>22 nov</span><span>30 nov</span></div></div></div></div><div className="admin-card recent-card"><div className="admin-card-head"><div><span className="kicker">LIVE</span><h2>Dernières commandes</h2></div><button className="more-button" onClick={() => setSection('orders')}><MoreHorizontal size={18} /></button></div><div className="recent-orders"><RecentOrder name="Awa Ndiaye" ref="DT-1048" total="44 900 FCFA" status="À confirmer" tone="yellow" avatar="AN" /><RecentOrder name="Moussa Fall" ref="DT-1047" total="29 900 FCFA" status="Expédiée" tone="purple" avatar="MF" /><RecentOrder name="Fatou Diop" ref="DT-1046" total="18 500 FCFA" status="Livrée" tone="green" avatar="FD" /><RecentOrder name="Cheikh Ba" ref="DT-1045" total="69 800 FCFA" status="Confirmée" tone="blue" avatar="CB" /></div><button className="admin-link" onClick={() => setSection('orders')}>Voir toutes les commandes <ArrowRight size={14} /></button></div></div><div className="admin-card top-products-card"><div className="admin-card-head"><div><span className="kicker">BEST-SELLERS</span><h2>Produits qui partent le plus</h2></div><button className="admin-link" onClick={() => setSection('products')}>Voir le catalogue <ArrowRight size={14} /></button></div><div className="top-products">{products.slice(0, 4).map((product, index) => <div key={product.id}><span className="rank">0{index + 1}</span><img src={product.image} alt="" /><span className="top-product-name"><b>{product.name}</b><small>{product.category} · {product.reviews + 32} ventes</small></span><strong>{money(product.price)}</strong><span className="stock-dot">{product.stock} en stock</span></div>)}</div></div></div>
}

function RecentOrder({ name, ref: reference, total, status, tone, avatar }) { return <div className="recent-order"><div className="avatar mini">{avatar}</div><div><b>{name}</b><small>{reference} · {total}</small></div><span className={`status-pill ${tone}`}>{status}</span></div> }

function AdminProducts({ notify, navigate }) {
  const [query, setQuery] = useState('')
  const [limitedOnly, setLimitedOnly] = useState(false)
  const shown = products.filter(product => (!query || `${product.name} ${product.id} ${product.category}`.toLowerCase().includes(query.toLowerCase())) && (!limitedOnly || product.stock < 8))
  return <div className="admin-content"><div className="admin-toolbar"><div className="admin-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un produit..." /></div><button className="button button-coral" onClick={() => notify('Pour ajouter un produit, utilisez le formulaire catalogue Laravel à venir.')}><Plus size={16} /> Ajouter un produit</button></div><div className="admin-card table-card"><div className="admin-card-head"><div><span className="kicker">CATALOGUE</span><h2>{shown.length} produits affichés</h2></div><button className={`button ${limitedOnly ? 'button-coral' : 'button-outline'}`} onClick={() => setLimitedOnly(value => !value)}><Filter size={15} /> {limitedOnly ? 'Tous les produits' : 'Stock limité'}</button></div><div className="admin-table"><div className="table-row table-heading"><span>Produit</span><span>Référence</span><span>Prix</span><span>Stock</span><span>Statut</span><span /></div>{shown.slice(0, 20).map(product => <div className="table-row" key={product.id}><button className="table-product table-product-button" onClick={() => navigate(`/produit/${product.id}`)}><img src={product.image} alt="" /><b>{product.name}<small>{product.category}</small></b></button><span>{product.id}</span><span><b>{money(product.price)}</b><del>{money(product.oldPrice)}</del></span><span>{product.stock}</span><span><span className={`status-pill ${product.stock < 8 ? 'yellow' : 'green'}`}>{product.stock < 8 ? 'Limité' : 'Actif'}</span></span><button className="more-button" onClick={() => notify(`${product.name} · ${product.stock} en stock`)}><MoreHorizontal size={18} /></button></div>)}</div></div></div>
}

function AdminRiskClients({ notify }) {
  const [rules, setRules] = useState([])
  const [query, setQuery] = useState('')
  const load = () => fetchPaymentRules().then(payload => setRules(payload.data || [])).catch(error => notify(error.message))
  useEffect(() => { load() }, [])
  const editRule = async rule => { const phone = window.prompt('Numéro du client', rule.phone); if (!phone?.trim()) return; const reason = window.prompt('Motif', rule.reason || 'Commande non honorée à la livraison.'); if (!reason?.trim()) return; try { const updated = await updatePaymentRule(rule.id, { phone: phone.trim(), reason: reason.trim(), requires_deposit: true }); setRules(current => current.map(item => item.id === rule.id ? updated : item)); notify('Règle modifiée') } catch (error) { notify(error.message) } }
  const removeRule = async rule => { if (!window.confirm(`Supprimer la règle pour ${rule.phone} ?`)) return; try { await deletePaymentRule(rule.id); setRules(current => current.filter(item => item.id !== rule.id)); notify('Règle supprimée') } catch (error) { notify(error.message) } }
  const filtered = rules.filter(rule => `${rule.phone} ${rule.reason}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="admin-content"><div className="admin-card table-card"><div className="admin-card-head"><div><span className="kicker">PRÉVENTION</span><h2>Clients à risque ({filtered.length})</h2></div><div className="admin-head-actions"><div className="admin-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un numéro..." /></div><button className="button button-outline" onClick={load}><RotateCcw size={15} /> Actualiser</button></div></div><p className="admin-helper">Ces numéros doivent régler 50 % avant une prochaine livraison. La règle ne supprime pas le client.</p>{filtered.length === 0 ? <div className="admin-empty">Aucun numéro bloqué pour le moment.</div> : <div className="admin-table"><div className="table-row table-heading"><span>Numéro</span><span>Motif</span><span>Créé le</span><span>Statut</span><span /></div>{filtered.map(rule => <div className="table-row" key={rule.id}><span><b>{rule.phone}</b><small>Clé : {rule.phone_key}</small></span><span>{rule.reason || 'Acompte obligatoire'}</span><span>{new Date(rule.created_at).toLocaleDateString('fr-FR')}</span><span><span className="status-pill yellow">Acompte 50 %</span></span><span className="admin-row-actions"><button className="text-link" onClick={() => editRule(rule)}>Modifier</button><button className="text-link danger" onClick={() => removeRule(rule)}>Supprimer</button></span></div>)}</div>}</div></div>
}

function AdminOrders({ notify }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetchOrders().then(payload => setOrders(payload.data || [])).catch(error => { if (error.message === 'AUTH_REQUIRED') window.location.href = 'http://localhost:8000/auth/login'; else notify('Impossible de charger les commandes Laravel') }).finally(() => setLoading(false)) }, [])
  const tone = status => status === 'delivered' ? 'green' : status === 'shipped' ? 'purple' : status === 'confirmed' ? 'blue' : 'yellow'
  const label = status => ({ pending_confirmation: 'À confirmer', confirmed: 'Confirmée', processing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' }[status] || status)
  const changeStatus = async (order, value) => { try { await updateOrder(order.id, { order_status: value }); setOrders(current => current.map(item => item.id === order.id ? { ...item, order_status: value } : item)); notify('Statut de la commande mis à jour') } catch (error) { notify(error.message) } }
  const confirmPayment = async (order) => { const reference = window.prompt(`Référence ${order.payment_method === 'orange' ? 'Orange Money' : 'Wave'} pour ${order.reference}`); if (!reference?.trim()) return; try { await updateOrder(order.id, { payment_status: 'paid', payment_reference: reference.trim() }); setOrders(current => current.map(item => item.id === order.id ? { ...item, payment_status: 'paid' } : item)); notify('Acompte confirmé et référence enregistrée') } catch (error) { notify(error.message) } }
  const requireDeposit = async (order) => { const reason = window.prompt(`Pourquoi imposer un acompte à ${order.phone} ?`, 'Commande non honorée à la livraison.'); if (!reason?.trim()) return; try { await requireDepositForPhone(order.phone, reason.trim()); notify('Acompte obligatoire activé pour ce numéro') } catch (error) { notify(error.message) } }
  const requireDepositForPhoneFromAdmin = async () => { const phone = window.prompt('Numéro qui devra payer un acompte de 50 % :', '+221 '); if (!phone?.trim()) return; const reason = window.prompt('Motif de la règle :', 'Commande non honorée à la livraison.'); if (!reason?.trim()) return; try { await requireDepositForPhone(phone.trim(), reason.trim()); notify(`Acompte obligatoire activé pour ${phone.trim()}`) } catch (error) { notify(error.message) } }
  const preparePaymentLink = async (order) => { const link = window.prompt(`Collez le lien ${order.payment_method === 'orange' ? 'Orange Money' : 'Wave'} pour ${order.reference}`, order.payments?.[0]?.payment_link || 'https://'); if (!link?.trim() || link.trim() === 'https://') return; try { await updateOrder(order.id, { payment_status: 'link_sent', payment_link: link.trim() }); const text = `Bonjour ${order.first_name}, voici le lien pour régler l’acompte de ${money(order.deposit_amount)} de votre commande ${order.reference} : ${link.trim()}`; window.open(`https://wa.me/${String(order.phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer'); setOrders(current => current.map(item => item.id === order.id ? { ...item, payment_status: 'link_sent', payments: item.payments?.map((payment, index) => index === 0 ? { ...payment, status: 'link_sent', payment_link: link.trim() } : payment) } : item)); notify('Lien enregistré et message WhatsApp préparé') } catch (error) { notify(error.message) } }
  return <div className="admin-content"><div className="stats-grid compact-stats"><div className="stat-card coral"><div className="stat-top"><span>À traiter aujourd’hui</span><Clock3 size={19} /></div><strong>{orders.filter(order => order.order_status === 'pending_confirmation').length.toString().padStart(2, '0')}</strong><small>Commandes à confirmer</small></div><div className="stat-card green"><div className="stat-top"><span>Commandes reçues</span><CheckCircle2 size={19} /></div><strong>{orders.length}</strong><small>Depuis la base MySQL</small></div></div><div className="admin-card table-card"><div className="admin-card-head"><div><span className="kicker">OPERATIONS</span><h2>Commandes récentes</h2></div><div className="admin-head-actions"><button className="button button-outline" onClick={requireDepositForPhoneFromAdmin}>Acompte obligatoire</button><button className="button button-outline" onClick={() => fetchOrders().then(payload => setOrders(payload.data || []))}><RotateCcw size={15} /> Actualiser</button></div></div>{loading ? <div className="admin-empty">Chargement des commandes…</div> : orders.length === 0 ? <div className="admin-empty">Aucune commande enregistrée pour le moment.</div> : <div className="admin-table"><div className="table-row table-heading"><span>Client</span><span>Référence</span><span>Date</span><span>Total</span><span>Statut / paiement</span><span /></div>{orders.map(order => <div className="table-row" key={order.reference}><span><b>{order.first_name} {order.last_name}</b><small>{order.phone}</small></span><span>{order.reference}</span><span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span><span><b>{money(order.total)}</b><small>Acompte {money(order.deposit_amount)}</small></span><span><select className="admin-status-select" value={order.order_status} onChange={event => changeStatus(order, event.target.value)}><option value="pending_confirmation">À confirmer</option><option value="confirmed">Confirmée</option><option value="processing">En préparation</option><option value="shipped">Expédiée</option><option value="delivered">Livrée</option><option value="cancelled">Annulée</option></select><button className="text-link" onClick={() => preparePaymentLink(order)}><MessageCircle size={13} /> {order.payment_status === 'link_sent' ? 'Renvoyer le lien' : 'Préparer le lien'}</button><button className="text-link" onClick={() => confirmPayment(order)}>Confirmer l’acompte</button><button className="text-link" onClick={() => requireDeposit(order)}>Acompte obligatoire</button></span><button className="more-button" onClick={() => notify(`Paiement ${order.payment_method} · statut ${order.payment_status || 'pending'}`)}><MoreHorizontal size={18} /></button></div>)}</div>}</div></div>
}

function AdminClients({ notify }) {
  const [query, setQuery] = useState('')
  const rows = [['Awa Ndiaye','awa.ndiaye@email.com','3','128 400 FCFA','Actif'],['Moussa Fall','moussa.fall@email.com','8','342 900 FCFA','VIP'],['Fatou Diop','fatou.diop@email.com','2','54 500 FCFA','Actif'],['Cheikh Ba','cheikh.ba@email.com','1','69 800 FCFA','Actif']].filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase()))
  return <div className="admin-content"><div className="admin-card table-card"><div className="admin-card-head"><div><span className="kicker">CRM</span><h2>{rows.length} clients affichés</h2></div><div className="admin-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un client..." /></div></div><div className="admin-table"><div className="table-row table-heading"><span>Client</span><span>Contact</span><span>Commandes</span><span>Dépensé</span><span>Statut</span><span /></div>{rows.map(row => <div className="table-row" key={row[1]}><span className="table-product"><span className="avatar mini">{row[0].split(' ').map(x => x[0]).join('')}</span><b>{row[0]}<small>Depuis 2026</small></b></span><span>{row[1]}</span><span>{row[2]}</span><span><b>{row[3]}</b></span><span><span className={`status-pill ${row[4] === 'VIP' ? 'purple' : 'green'}`}>{row[4]}</span></span><button className="more-button" onClick={() => notify(`Fiche client ${row[0]} · ${row[2]} commandes`)}><MoreHorizontal size={18} /></button></div>)}</div></div></div>
}

function AdminContent({ notify }) { return <div className="admin-content"><div className="admin-content-grid"><div className="admin-card content-card"><div className="content-image" style={{ backgroundImage: `url(${heroSlides[0].image})` }}><span className="status-pill green">En ligne</span></div><div><span className="kicker">BANNIÈRE PRINCIPALE</span><h2>Le style qui arrive avant toi.</h2><p>Slide 01 · Dernière modification il y a 2 jours</p><button className="button button-outline" onClick={() => notify('Éditeur de bannière ouvert')}>Modifier <Wrench size={15} /></button></div></div><div className="admin-card content-card"><div className="content-image" style={{ backgroundImage: `url(${heroSlides[1].image})` }}><span className="status-pill yellow">Planifiée</span></div><div><span className="kicker">VENTE FLASH</span><h2>Flash Week — jusqu’à -50%</h2><p>Du 08 au 12 novembre 2026</p><button className="button button-outline" onClick={() => notify('Éditeur de campagne ouvert')}>Modifier <Wrench size={15} /></button></div></div></div><div className="admin-card sections-manager"><div className="admin-card-head"><div><span className="kicker">HOME BUILDER</span><h2>Sections de l’accueil</h2></div><button className="button button-coral" onClick={() => notify('Nouvelle section ajoutée')}><Plus size={15} /> Ajouter</button></div>{['Ventes flash', 'Nouveautés', 'Meilleures ventes', 'Bons plans à petit prix'].map((label, index) => <div className="section-manager-row" key={label}><span className="drag">⋮⋮</span><span className="manager-number">0{index + 1}</span><b>{label}</b><span className="manager-products">{index === 0 ? '12 produits' : index === 1 ? '8 produits' : '10 produits'}</span><span className="status-pill green">Active</span><button className="more-button" onClick={() => notify('Options de la section ouvertes')}><MoreHorizontal size={18} /></button></div>)}</div></div> }

function Footer({ navigate }) {
  return <footer className="site-footer"><div className="container footer-top"><div className="footer-brand"><button className="brand footer-brand-button" onClick={() => navigate('/')}><span className="brand-mark">DT<span>•</span></span><span className="brand-copy">Dakar <b>Trend</b><small>DAKAR / ONLINE</small></span></button><p>Le style qui circule. Mode, bijoux et tech tendance livrés à Dakar.</p><div className="socials"><span>ig</span><span>tk</span><span>wa</span></div></div><div className="footer-column"><b>Découvrir</b><button onClick={() => navigate('/catalogue')}>Nouveautés</button><button onClick={() => navigate('/catalogue')}>Best-sellers</button><button onClick={() => navigate('/catalogue')}>Ventes flash</button><button onClick={() => navigate('/catalogue')}>Toutes les catégories</button></div><div className="footer-column"><b>Besoin d’aide ?</b><button onClick={() => navigate('/contact')}>Contact</button><button onClick={() => navigate('/faq')}>FAQ</button><button onClick={() => navigate('/retours')}>Retours & échanges</button><button onClick={() => navigate('/contact')}>Livraison</button></div><div className="footer-column"><b>Dakar Trend</b><button onClick={() => navigate('/a-propos')}>Notre histoire</button><button onClick={() => navigate('/cgv')}>CGV</button><button onClick={() => navigate('/contact')}>Showroom</button><button onClick={() => navigate('/admin')}>Espace admin</button></div><div className="footer-newsletter"><span className="kicker">DROP ALERTS</span><h3>Les nouveautés,<br />sans le bruit.</h3><p>Une dose de tendances et de bons plans dans ta boîte.</p><div><input placeholder="Ton email" /><button aria-label="S’inscrire"><ArrowRight size={16} /></button></div></div></div><div className="container footer-bottom"><span>© 2026 Dakar Trend. Fait avec intention à Dakar.</span><span>Wave · Orange Money · Visa · Mastercard</span></div></footer>
}

function MobileNav({ path, navigate, cartCount, favoriteCount }) {
  return <nav className="mobile-nav"><button className={path === '/' ? 'active' : ''} onClick={() => navigate('/')}><Home size={19} /><span>Accueil</span></button><button className={path === '/catalogue' ? 'active' : ''} onClick={() => navigate('/catalogue')}><Grid2X2 size={19} /><span>Catégories</span></button><button className={path === '/favoris' ? 'active' : ''} onClick={() => navigate('/favoris')}><span className="mobile-nav-badge">{favoriteCount > 0 && favoriteCount}</span><Heart size={19} /><span>Favoris</span></button><button className={path === '/panier' ? 'active' : ''} onClick={() => navigate('/panier')}><span className="mobile-nav-badge">{cartCount > 0 && cartCount}</span><ShoppingBag size={19} /><span>Panier</span></button><button className={path === '/compte' ? 'active' : ''} onClick={() => navigate('/compte')}><CircleUserRound size={19} /><span>Compte</span></button></nav>
}

createRoot(document.getElementById('root')).render(<App />)
