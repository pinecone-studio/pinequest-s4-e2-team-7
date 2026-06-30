'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/components/providers'

/**
 * Loads a PRIVATE (auth-scoped) image — fetches the byte stream with the Bearer
 * token, then renders it from a blob URL. A plain <img src> can't send the auth
 * header, so R2-backed screening photos (minors' images) go through here.
 */
export const AuthImage = ({ path, alt, className }: { path: string; alt: string; className?: string }) => {
  const { token } = useSession()
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!token) return
    let active = true
    let objectUrl: string | null = null
    setFailed(false)
    setUrl(null)
    fetch(path, { headers: { authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => active && setFailed(true))
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path, token])

  if (failed) {
    return (
      <div className={`${className ?? ''} flex items-center justify-center bg-surface-raised text-[12px] text-text-muted`}>
        Зураг ачаалж чадсангүй
      </div>
    )
  }
  if (!url) return <div className={`${className ?? ''} animate-pulse bg-surface-raised`} />
  return <img src={url} alt={alt} className={className} />
}
