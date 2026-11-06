const imageSets = {
  clothing: [
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&q=85&auto=format&fit=crop',
  ],
  shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=900&q=85&auto=format&fit=crop',
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=85&auto=format&fit=crop',
  ],
  watch: [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844f02?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=900&q=85&auto=format&fit=crop',
  ],
  tech: [
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&q=85&auto=format&fit=crop',
  ],
}

const definitions = [
  ['Robe satinée Midnight', 'Vêtements', 'clothing', 18500, 25000, 'Nouveau', 'M', 'Satin premium'],
  ['Ensemble cargo Yoff', 'Vêtements', 'clothing', 22500, 32000, 'Best-seller', 'XL', 'Coton twill'],
  ['Chemise oversize Dakar', 'Vêtements', 'clothing', 14500, 19000, 'Nouveau', 'L', 'Coton respirant'],
  ['Top crochet Soleil', 'Vêtements', 'clothing', 9500, 14000, 'Petit prix', 'M', 'Maille douce'],
  ['Blazer rose Baobab', 'Vêtements', 'clothing', 29500, 42000, 'Édition limitée', 'S', 'Polyester premium'],
  ['Jean wide leg Ngor', 'Vêtements', 'clothing', 19900, 27000, 'Best-seller', 'L', 'Denim souple'],
  ['Jupe plissée Teranga', 'Vêtements', 'clothing', 16500, 22000, 'Nouveau', 'M', 'Viscose'],
  ['T-shirt graphique Plateau', 'Vêtements', 'clothing', 7900, 11000, 'Petit prix', 'XL', 'Coton bio'],
  ['Hoodie Wave 221', 'Vêtements', 'clothing', 24900, 35000, 'Stock limité', 'L', 'Molleton chaud'],
  ['Pantalon lin Almadies', 'Vêtements', 'clothing', 17900, 24000, 'Nouveau', 'M', 'Lin mélangé'],
  ['Baskets Cloud Dakar', 'Chaussures', 'shoes', 27900, 39000, 'Best-seller', '41', 'Mesh respirant'],
  ['Sneakers Sunset Gum', 'Chaussures', 'shoes', 32500, 45000, 'Nouveau', '39', 'Cuir vegan'],
  ['Sandales plates Saloum', 'Chaussures', 'shoes', 12900, 18000, 'Petit prix', '38', 'Simili cuir'],
  ['Mocassins City Black', 'Chaussures', 'shoes', 24500, 33000, 'Best-seller', '42', 'Cuir souple'],
  ['Running Teranga', 'Chaussures', 'shoes', 29900, 41000, 'Stock limité', '43', 'Semelle EVA'],
  ['Claquettes Piscine Pink', 'Chaussures', 'shoes', 6900, 9500, 'Petit prix', '40', 'EVA injecté'],
  ['Baskets Mini Dakar', 'Chaussures', 'shoes', 19900, 28000, 'Nouveau', '36', 'Toile canvas'],
  ['Bottines Night Out', 'Chaussures', 'shoes', 36900, 52000, 'Édition limitée', '38', 'Cuir synthétique'],
  ['Collier perles Ndar', 'Bijoux', 'jewelry', 8900, 13500, 'Nouveau', 'Unique', 'Acier inoxydable'],
  ['Créoles Soleil dorées', 'Bijoux', 'jewelry', 7500, 11000, 'Best-seller', 'Unique', 'Acier inoxydable'],
  ['Bracelet chaîne Fine', 'Bijoux', 'jewelry', 9900, 15000, 'Petit prix', 'M', 'Acier doré'],
  ['Bague Initiale', 'Bijoux', 'jewelry', 6500, 9000, 'Nouveau', '52', 'Argent 925'],
  ['Set bijoux Pearl Club', 'Bijoux', 'jewelry', 15900, 23000, 'Best-seller', 'Unique', 'Perles d’eau douce'],
  ['Chaîne homme Ébène', 'Bijoux', 'jewelry', 11900, 17000, 'Nouveau', '60 cm', 'Acier noir'],
  ['Boucles Mini Hoops', 'Bijoux', 'jewelry', 5900, 8500, 'Petit prix', 'Unique', 'Acier argenté'],
  ['Pendentif Cauri', 'Bijoux', 'jewelry', 10900, 16000, 'Stock limité', '45 cm', 'Laiton plaqué or'],
  ['Montre Gold Hour', 'Montres', 'watch', 34900, 49000, 'Best-seller', 'Unique', 'Garantie 12 mois'],
  ['Montre Classic Mesh', 'Montres', 'watch', 28900, 39000, 'Nouveau', 'Unique', 'Garantie 12 mois'],
  ['Montre Sport Pulse', 'Montres', 'watch', 42500, 58000, 'Stock limité', 'Unique', 'Garantie 24 mois'],
  ['Montre Mini Rose', 'Montres', 'watch', 23900, 33000, 'Petit prix', 'Unique', 'Garantie 6 mois'],
  ['Montre Urban Chrono', 'Montres', 'watch', 45900, 65000, 'Édition limitée', 'Unique', 'Garantie 24 mois'],
  ['AirPods Case Pearl', 'Audio & accessoires', 'tech', 5900, 8500, 'Petit prix', 'Unique', 'Silicone soft-touch'],
  ['Écouteurs Bass Pro', 'Audio & accessoires', 'tech', 18900, 26000, 'Best-seller', 'Unique', 'Garantie 6 mois'],
  ['Casque Studio Wave', 'Audio & accessoires', 'tech', 32900, 45000, 'Nouveau', 'Unique', 'Garantie 12 mois'],
  ['Chargeur rapide 25W', 'Audio & accessoires', 'tech', 7900, 12000, 'Petit prix', 'Unique', 'Garantie 3 mois'],
  ['Powerbank Pocket 10K', 'Audio & accessoires', 'tech', 14900, 21000, 'Best-seller', 'Unique', 'Garantie 6 mois'],
  ['Coque iPhone Chrome', 'Audio & accessoires', 'tech', 6900, 9500, 'Nouveau', 'Unique', 'TPU renforcé'],
  ['Enceinte Mini Baobab', 'Audio & accessoires', 'tech', 21900, 29000, 'Stock limité', 'Unique', 'Garantie 6 mois'],
  ['Câble tressé USB-C', 'Audio & accessoires', 'tech', 4900, 7000, 'Petit prix', 'Unique', 'Nylon tressé'],
  ['Support téléphone Mag', 'Audio & accessoires', 'tech', 12900, 18000, 'Nouveau', 'Unique', 'Aluminium'],
]

const colorSets = {
  clothing: ['Noir', 'Rose poudré', 'Écru'],
  shoes: ['Blanc', 'Noir', 'Rose'],
  jewelry: ['Doré', 'Argenté', 'Acier'],
  watch: ['Or', 'Argent', 'Noir'],
  tech: ['Noir', 'Blanc', 'Rose'],
}

export const products = definitions.map(([name, category, kind, price, oldPrice, badge, defaultSize, material], index) => {
  const images = imageSets[kind]
  const discount = Math.round((1 - price / oldPrice) * 100)
  const rating = Number((4.2 + ((index * 7) % 8) / 10).toFixed(1))
  return {
    id: `PRD-${String(index + 1).padStart(3, '0')}`,
    name,
    category,
    kind,
    price,
    oldPrice,
    discount,
    badge,
    rating,
    reviews: 12 + ((index * 17) % 89),
    image: images[index % images.length],
    gallery: [images[index % images.length], images[(index + 1) % images.length], images[(index + 2) % images.length]],
    colors: colorSets[kind],
    sizes: kind === 'shoes' ? ['36', '37', '38', '39', '40', '41', '42', '43'] : kind === 'clothing' ? ['XS', 'S', 'M', 'L', 'XL', 'XXL'] : [defaultSize],
    material,
    stock: 3 + ((index * 11) % 23),
    isFlash: index % 4 === 0 || badge === 'Stock limité',
    description: `${name} pensé pour les looks du quotidien à Dakar. Une pièce facile à porter, avec une finition soignée et un style qui se remarque sans en faire trop.`,
    specs: ['Expédition depuis Dakar', 'Contrôle qualité avant envoi', material, 'Échange sous 7 jours'],
  }
})

export const categories = [
  { name: 'Tout', slug: 'Tout', icon: '✦', count: products.length },
  { name: 'Vêtements', slug: 'Vêtements', icon: '◒', count: products.filter(p => p.category === 'Vêtements').length },
  { name: 'Chaussures', slug: 'Chaussures', icon: '⌁', count: products.filter(p => p.category === 'Chaussures').length },
  { name: 'Bijoux', slug: 'Bijoux', icon: '◇', count: products.filter(p => p.category === 'Bijoux').length },
  { name: 'Montres', slug: 'Montres', icon: '◷', count: products.filter(p => p.category === 'Montres').length },
  { name: 'Audio & accessoires', slug: 'Audio & accessoires', icon: '◉', count: products.filter(p => p.category === 'Audio & accessoires').length },
]

export const formatPrice = (value) => `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`
