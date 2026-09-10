'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice, type Product } from '../../../lib/catalog';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | undefined>();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${params.slug}`, { cache: 'no-store' }).then((response) => response.ok ? response.json() : undefined).then((data) => setProduct(data)).catch(() => setProduct(undefined));
  }, [params.slug]);

  useEffect(() => {
    if (product) setSelectedSize(product.sizes[0]?.label ?? '');
  }, [product]);

  if (!product) {
    return <main className="detail-page"><div className="detail-shell"><h1>Loading product...</h1><a className="detail-button" href="/#shop">Back to menu</a></div></main>;
  }

  const size = product.sizes.find((option) => option.label === selectedSize) ?? product.sizes[0];
  const addToCart = () => {
    const current = JSON.parse(localStorage.getItem('cakes-cart') ?? '[]');
    const existing = current.find((item: { slug: string; size: string }) => item.slug === product.slug && item.size === size.label);
    if (existing) existing.quantity += quantity;
    else current.push({ slug: product.slug, size: size.label, quantity });
    localStorage.setItem('cakes-cart', JSON.stringify(current));
    router.push('/checkout');
  };

  return <main className="detail-page"><div className="detail-shell"><a className="back-link" href="/#shop">← Back to menu</a><div className="detail-grid"><div className="detail-image"><img src={product.image} alt={product.name} /></div><div className="detail-copy"><span className="detail-tag">{product.tag}</span><p className="eyebrow">Made to order in Dahisar</p><h1>{product.name}</h1><p className="detail-description">{product.details}</p><div className="option-group"><h2>Choose a size</h2><div className="size-options">{product.sizes.map((option) => <button key={option.label} className={selectedSize === option.label ? 'size-option selected' : 'size-option'} onClick={() => setSelectedSize(option.label)}><span>{option.label}</span><strong>{formatPrice(option.price)}</strong></button>)}</div></div><div className="quantity-row"><label htmlFor="quantity">Quantity</label><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div></div><div className="detail-total"><span>Total</span><strong>{formatPrice(size.price * quantity)}</strong></div><button className="detail-button" onClick={addToCart}>Add to cart & continue</button><p className="detail-note">Your order is confirmed personally on WhatsApp after we check availability and delivery details.</p></div></div></div><style jsx global>{`body{background:#fffaf7}.detail-page{min-height:100vh;padding:34px 20px 80px;background:#fffaf7;color:#2e2428}.detail-shell{width:min(1080px,100%);margin:auto}.back-link{display:inline-block;margin-bottom:28px;color:#7b3154;font-size:14px;font-weight:700}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}.detail-image img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:24px;box-shadow:0 16px 45px rgba(68,35,48,.11)}.detail-copy h1{margin:7px 0 16px;font:600 clamp(38px,5vw,64px)/1.05 Georgia,serif;color:#2e2428}.detail-tag{display:inline-block;margin-bottom:18px;padding:6px 11px;border-radius:999px;background:#f6e7ed;color:#7b3154;font-size:11px;font-weight:800}.detail-description{max-width:520px;color:#756b70;font-size:16px}.option-group{margin-top:30px}.option-group h2{margin:0 0 12px;font:600 22px Georgia,serif}.size-options{display:grid;gap:9px}.size-option{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid #eadde2;border-radius:12px;background:#fff;text-align:left;color:#2e2428;cursor:pointer}.size-option.selected{border-color:#7b3154;background:#f6e7ed;box-shadow:0 0 0 2px rgba(123,49,84,.12)}.size-option strong{color:#7b3154}.quantity-row{display:flex;align-items:center;justify-content:space-between;margin-top:24px;font-weight:700}.quantity-control{display:flex;align-items:center;gap:18px}.quantity-control button{width:32px;height:32px;border:1px solid #eadde2;border-radius:50%;background:#fff;color:#7b3154;font-size:20px;cursor:pointer}.detail-total{display:flex;justify-content:space-between;margin:28px 0 16px;padding-top:18px;border-top:1px solid #eadde2}.detail-total strong{color:#7b3154;font-size:20px}.detail-button{display:inline-block;width:100%;padding:14px 22px;border:0;border-radius:999px;background:#7b3154;color:#fff;font-weight:800;text-align:center;cursor:pointer}.detail-button:hover{background:#642742}.detail-note{color:#756b70;font-size:12px}@media(max-width:750px){.detail-page{padding:22px 13px 60px}.detail-grid{grid-template-columns:1fr;gap:30px}.detail-image img{aspect-ratio:4/3}.detail-copy h1{font-size:42px}}`}</style></main>;
}
