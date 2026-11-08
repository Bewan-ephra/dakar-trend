import { products as fallbackProducts } from '../data/products'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

function normalizeProduct(item) {
  const category = typeof item.category === 'string' ? item.category : item.category?.name
  const gallery = item.gallery?.length ? item.gallery : [item.image].filter(Boolean)
  return {
    ...item,
    id: item.sku || String(item.id),
    backendId: item.id,
    category,
    image: gallery[0],
    gallery,
    oldPrice: item.old_price ?? item.oldPrice,
    isFlash: item.is_flash ?? item.isFlash,
    specs: item.specifications ?? item.specs ?? [],
  }
}

export async function fetchCatalog() {
  try {
    const response = await fetch(`${API_URL}/products?per_page=48`)
    if (!response.ok) throw new Error(`Catalog API ${response.status}`)
    const payload = await response.json()
    const remoteProducts = (payload.data || []).map(normalizeProduct)
    return remoteProducts.length ? remoteProducts : fallbackProducts
  } catch (error) {
    console.warn('Backend Laravel indisponible, utilisation du catalogue local.', error)
    return fallbackProducts
  }
}

export async function createOrder(payload) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Impossible de créer la commande.')
  return data
}
