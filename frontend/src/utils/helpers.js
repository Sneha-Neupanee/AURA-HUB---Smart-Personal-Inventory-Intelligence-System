/**
 * Turn axios/DRF API errors into a safe display string (never returns a plain object).
 * Handles the backend envelope { error, status_code, detail } and nested field errors.
 */
export function formatApiError(error) {
    const data = error?.response?.data
    if (!data) {
        if (error?.message === 'Network Error') {
            return 'Network error. Check your connection and try again.'
        }
        if (typeof error?.message === 'string') return error.message
        return 'Something went wrong. Please try again.'
    }

    const unwrap = (d) => {
        if (
            d &&
            typeof d === 'object' &&
            d.detail !== undefined &&
            (d.error === true || typeof d.status_code === 'number')
        ) {
            return d.detail
        }
        return d
    }

    const formatLeaf = (payload) => {
        if (payload == null) return ''
        if (typeof payload === 'string' || typeof payload === 'number') return String(payload)
        if (Array.isArray(payload)) {
            return payload.map((item) => formatLeaf(item)).filter(Boolean).join(' ')
        }
        if (typeof payload === 'object') {
            if (typeof payload.detail === 'string') return payload.detail
            if (Array.isArray(payload.detail)) return formatLeaf(payload.detail)
            const parts = []
            for (const [key, val] of Object.entries(payload)) {
                if (key === 'error' || key === 'status_code') continue
                if (val == null) continue
                const msgs = Array.isArray(val) ? val : [val]
                const text = msgs.map((m) => formatLeaf(m)).filter(Boolean).join(', ')
                if (text) parts.push(`${key}: ${text}`)
            }
            return parts.join('; ')
        }
        return ''
    }

    const message = formatLeaf(unwrap(data)).trim()
    return message || 'Something went wrong. Please try again.'
}

/** Unwrap nested API shapes such as { username: { username: 'x' } } to a plain string for JSX. */
export function normalizeAuthField(val) {
    let cur = val
    for (let depth = 0; depth < 10 && cur != null && typeof cur === 'object'; depth += 1) {
        if ('username' in cur && cur.username !== undefined) {
            cur = cur.username
            continue
        }
        if ('email' in cur && cur.email !== undefined) {
            cur = cur.email
            continue
        }
        break
    }
    if (cur == null) return ''
    if (typeof cur === 'string' || typeof cur === 'number') return String(cur)
    return ''
}

/** Ensure user fields used in React children are primitives, not nested objects. */
export function normalizeUser(raw) {
    if (!raw || typeof raw !== 'object') return raw
    const username = normalizeAuthField(raw.username)
    const email = normalizeAuthField(raw.email)
    let role = raw.role
    if (role != null && typeof role === 'object') role = normalizeAuthField(role)
    if (typeof role !== 'string' && typeof role !== 'number') role = 'user'
    return {
        ...raw,
        username,
        email,
        role: String(role),
    }
}

export function cn(...classes) {
    return classes.filter(Boolean).join(' ')
}

export function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(date)
}

export function formatCurrency(value) {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}
