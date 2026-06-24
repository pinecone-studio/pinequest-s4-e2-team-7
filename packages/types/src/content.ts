/**
 * Dentist-approved, versioned advice/education content. Apps pin a version so
 * parent-facing text stays consistent and reviewable. Never improvise this text.
 */
export interface ContentVersion {
  id: string
  /** Human label, e.g. "2026.1". */
  version: string
  locale: string
  publishedAt: string
  publishedById: string
}
