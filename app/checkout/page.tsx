'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatPrice, getProduct, whatsappLink } from '../../lib/catalog';

type CartItem = { slug: string; size: string; quantity: number };

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', date: '', address: '', notes: '' });

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cakes-cart') ?? '[]'));
  }, []);

  const updateQuantity = (index: number, quantity: number) => {
    const next = cart.map((item, itemIndex) => itemIndex === index ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
    setCart(next);
    localStorage.setItem('cakes-cart', JSON.stringify(next));
  };

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, items: cart }) });
    const result = await response.json();
    if (!response.ok) { window.alert(result.error ?? 'Unable to save your order.'); return; }
    localStorage.removeItem('cakes-cart');
    const message = `${result.whatsappMessage}\nName: ${customer.name}\nPhone: ${customer.phone}\nRequired date: ${customer.date}\nAddress / pickup: ${customer.address}\nNotes: ${customer.notes || 'None'}`;
    window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const total = cart.reduce((sum, item) => {
    const product = getProduct(item.slug);
    const size = product?.sizes.find((option) => option.label === item.size);
    return sum + (size?.price ?? 0) * item.quantity;
  }, 0);

  return <main className="checkout-page"><div className="checkout-shell"><a className="back-link" href="/#shop">← Continue shopping</a><div className="checkout-heading"><p className="eyebrow">Your order</p><h1>Almost ready to bake.</h1><p>Review your treats, then share your details so Rinku can confirm availability on WhatsApp.</p></div>{cart.length === 0 ? <div className="empty-cart"><h2>Your cart is empty</h2><a className="checkout-button" href="/#shop">Explore the menu</a></div> : <div className="checkout-grid"><section className="cart-panel"><h2>Your treats</h2>{cart.map((item, index) => { const product = getProduct(item.slug); const size = product?.sizes.find((option) => option.label === item.size); return <div className="cart-item" key={`${item.slug}-${item.size}`}><img src={product?.image} alt="" /><div><h3>{product?.name}</h3><p>{item.size} · {formatPrice(size?.price ?? 0)} each</p><div className="cart-controls"><button onClick={() => updateQuantity(index, item.quantity - 1)} aria-label="Decrease quantity">−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(index, item.quantity + 1)} aria-label="Increase quantity">+</button></div></div><strong>{formatPrice((size?.price ?? 0) * item.quantity)}</strong></div>})}<div className="cart-total"><span>Estimated total</span><strong>{formatPrice(total)}</strong></div><p className="checkout-note">Final pricing may change for custom designs, delivery, or special packaging.</p></section><form className="customer-form" onSubmit={submitOrder}><h2>Your details</h2><label>Name<input required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} /></label><label>Phone / WhatsApp<input required type="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} /></label><label>Required date<input required type="date" value={customer.date} onChange={(event) => setCustomer({ ...customer, date: event.target.value })} /></label><label>Pickup or delivery address<textarea required rows={3} value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} /></label><label>Notes <span>(optional)</span><textarea rows={3} value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Flavour, message, theme, delivery timing..." /></label><button className="checkout-button" type="submit">Confirm on WhatsApp →</button></form></div>}</div><style jsx global>{`body{background:#fffaf7}.checkout-page{min-height:100vh;padding:34px 20px 80px;background:#fffaf7;color:#2e2428}.checkout-shell{width:min(1080px,100%);margin:auto}.back-link{display:inline-block;margin-bottom:28px;color:#7b3154;font-size:14px;font-weight:700}.checkout-heading{max-width:650px;margin-bottom:32px}.checkout-heading h1{margin:0 0 10px;font:600 clamp(40px,5vw,62px)/1.05 Georgia,serif}.checkout-heading>p:last-child{color:#756b70}.checkout-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:22px;align-items:start}.cart-panel,.customer-form{padding:28px;border:1px solid #eadde2;border-radius:18px;background:#fff}.cart-panel h2,.customer-form h2{margin:0 0 22px;font:600 25px Georgia,serif}.cart-item{display:grid;grid-template-columns:78px 1fr auto;gap:14px;align-items:center;padding:15px 0;border-bottom:1px solid #eadde2}.cart-item img{width:78px;height:78px;object-fit:cover;border-radius:10px}.cart-item h3{margin:0 0 3px;font:600 18px Georgia,serif}.cart-item p{margin:0;color:#756b70;font-size:12px}.cart-controls{display:flex;align-items:center;gap:12px;margin-top:9px}.cart-controls button{width:25px;height:25px;border:1px solid #eadde2;border-radius:50%;background:#fff;color:#7b3154;cursor:pointer}.cart-item>strong,.cart-total strong{color:#7b3154}.cart-total{display:flex;justify-content:space-between;margin-top:22px;font-weight:800}.checkout-note{color:#756b70;font-size:12px}.customer-form{display:grid;gap:14px}.customer-form h2{margin-bottom:4px}.customer-form label{display:grid;gap:5px;font-size:13px;font-weight:700}.customer-form label span{color:#756b70;font-weight:400}.customer-form input,.customer-form textarea{width:100%;padding:11px 12px;border:1px solid #eadde2;border-radius:9px;background:#fffaf7;color:#2e2428;resize:vertical}.customer-form input:focus,.customer-form textarea:focus{outline:2px solid #f6e7ed;border-color:#7b3154}.checkout-button{display:inline-block;padding:13px 20px;border:0;border-radius:999px;background:#7b3154;color:#fff;font-weight:800;text-align:center;cursor:pointer}.checkout-button:hover{background:#642742}.empty-cart{padding:45px;text-align:center;border:1px solid #eadde2;border-radius:18px;background:#fff}.empty-cart h2{font:600 28px Georgia,serif}@media(max-width:750px){.checkout-page{padding:22px 13px 60px}.checkout-grid{grid-template-columns:1fr}.cart-panel,.customer-form{padding:20px}.cart-item{grid-template-columns:60px 1fr auto}.cart-item img{width:60px;height:60px}.cart-item>strong{font-size:13px}}`}</style></main>;
}
