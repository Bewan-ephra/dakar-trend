const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

async function parse(response, fallback) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || fallback)
  return data
}

export async function checkPaymentRule(phone) {
  const response = await fetch(`${API_URL}/payment-rule-check?phone=${encodeURIComponent(phone)}`)
  return parse(response, 'Vérification du numéro impossible.')
}

export async function fetchPaymentRules() {
  const response = await fetch(`${API_URL}/admin/payment-rules?per_page=50`, { credentials: 'include', headers: { Accept: 'application/json' } })
  return parse(response, 'Impossible de charger les clients à risque.')
}

export async function updatePaymentRule(id, payload) {
  const response = await fetch(`${API_URL}/admin/payment-rules/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
  return parse(response, 'Impossible de modifier cette règle.')
}

export async function deletePaymentRule(id) {
  const response = await fetch(`${API_URL}/admin/payment-rules/${id}`, { method: 'DELETE', credentials: 'include', headers: { Accept: 'application/json' } })
  return parse(response, 'Suppression impossible.')
}
