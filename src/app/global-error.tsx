'use client'

/**
 * Last-resort page when the site layout itself fails (e.g. Site settings can't be read because the
 * database is down). It replaces the whole document, so it has no site styles, dictionary or language
 * context: plain inline styles, all three languages, and a colour scheme that follows the device.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="hy">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', colorScheme: 'light dark' }}>
        <title>Avenue Real Estate</title>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Ինչ-որ բան այն չէ · Something went wrong · Что-то пошло не так</p>
            <p style={{ opacity: 0.75, marginTop: 12 }}>
              Խնդրում ենք փորձել մի փոքր ուշ։ Please try again in a moment. Попробуйте ещё раз чуть позже.
            </p>
            <button
              type="button"
              onClick={() => retry()}
              style={{ marginTop: 24, padding: '12px 22px', fontSize: 15, fontWeight: 600, border: 0, borderRadius: 6, background: '#0c4a60', color: '#fff', cursor: 'pointer' }}
            >
              Փորձել կրկին · Try again · Повторить
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
