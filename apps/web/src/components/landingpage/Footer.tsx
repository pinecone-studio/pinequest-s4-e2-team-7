'use client'

import { FooterCol } from './Helpers'

export function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '60px 40px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          className="grid-3"
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 60, marginBottom: 48 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <img
                src="/logoYellow.png"
                alt="Screener"
                style={{ width: 44, height: 44, objectFit: 'contain', display: 'block', borderRadius: 10 }}
              />
              <span style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 20 }}>
                Screener
              </span>
            </div>
            <p
              style={{
                fontSize: 17,
                color: 'rgba(244,239,230,0.65)',
                lineHeight: 1.7,
                maxWidth: 360,
              }}
            >
              Монголын сум, хөдөө орон нутагт зориулсан хүүхдийн шүдний AI шүүн таних оффлайн-first
              систем.
            </p>
          </div>
          <FooterCol
            title="Хэсгүүд"
            links={['Танилцуулга', 'Баг', 'Асуудал', 'Шийдэл', 'Систем']}
          />
          <FooterCol
            title="Холбоо"
            links={['hello@toothfairy.mn', '+976 88595353', 'Улаанбаатар, Монгол']}
          />
        </div>
        <div
          style={{
            borderTop: '1px solid rgba(244,239,230,0.15)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 17,
              color: 'rgba(244,239,230,0.45)',
              letterSpacing: '0.15em',
            }}
          >
            © 2026 Screener · ALL RIGHTS RESERVED
          </span>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 13,
              color: 'rgba(244,239,230,0.45)',
              letterSpacing: '0.15em',
            }}
          >
            MADE IN MONGOLIA 🇲🇳
          </span>
        </div>
      </div>
    </footer>
  )
}
