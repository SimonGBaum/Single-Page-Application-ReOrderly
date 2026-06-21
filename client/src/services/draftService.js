const DRAFT_PREFIX = 'reorderly_draft_'

export function saveDraft(userId, formData) {
  localStorage.setItem(`${DRAFT_PREFIX}${userId}`, JSON.stringify(formData))
}

export function getDraft(userId) {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDraft(userId) {
  localStorage.removeItem(`${DRAFT_PREFIX}${userId}`)
}
