// Products page — directory of our software. Each card supports a screenshot,
// a status, optional price, and an outbound link (free download or paid site).

import products from '../content/products.json';

export function ProductsPage() {
  const isExternal = (href) => /^https?:/i.test(href || '');
  return (
    <main className="zo-page">
      <header className="zo-page-header">
        <div className="zo-page-eyebrow">/ PRODUCTS</div>
        <h1 className="zo-page-title">ELEVATE YOUR WORKFLOWS.</h1>
      </header>

      <div className="zo-products">
        {products.map((p, i) =>
        <article key={p.name} className="zo-product">
            {p.image &&
          <div className="zo-product-shot">
                <img src={p.image} alt={`${p.name} screenshot`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
          }
            <div className="zo-product-head">
              <span className="zo-product-status">
                <span className="zo-status-dot" />
                {p.status}
              </span>
              {p.price && <span className="zo-product-price">{p.price}</span>}
              <span className="zo-product-index">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h2 className="zo-product-name">{p.name}</h2>
            <p className="zo-product-sub">{p.subtitle}</p>
            <p className="zo-product-desc">{p.description}</p>
            {p.href && p.type !== 'concept' &&
          <div className="zo-product-cta">
                <a
              className="zo-product-link"
              href={p.href}
              target={isExternal(p.href) ? '_blank' : undefined}
              rel={isExternal(p.href) ? 'noreferrer' : undefined}>

                  {p.cta}
                  <span className="zo-product-link-arrow">{isExternal(p.href) ? '↗' : '↓'}</span>
                </a>
              </div>
          }
          </article>
        )}
      </div>
    </main>);

}
