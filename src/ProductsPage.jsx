// Products page — directory of our software. Each card supports a screenshot,
// a status, optional price, and an outbound link (free download or paid site).

function ProductsPage() {
  const products = window.PRODUCTS;
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
            {p.shotId &&
          <div className="zo-product-shot">
                <image-slot
              id={p.shotId}
              shape="rounded"
              radius="2"
              placeholder="Drop a screenshot"
              style={{ width: '100%', height: '100%' }}>
            </image-slot>
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

window.ProductsPage = ProductsPage;
