'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '../../lib/catalog';
import { getSupabaseBrowserClient } from '../../lib/supabase-browser';

type Product = { id: string; name: string; slug: string; category: string; is_active: boolean; product_sizes: { id: string; label: string; price_minor: number; is_active: boolean }[] };
type Order = { id: string; reference: string; customer_name: string; customer_phone: string; required_date: string; status: string; total_minor: number; order_items: { product_name: string; size_label: string; quantity: number }[] };
type Feedback = { id: string; customer_name: string; message: string; rating: number; is_published: boolean };
type Settings = { business: Record<string, string>; site_copy: Record<string, string> };

const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export default function AdminPage() {
  const [supabase] = useState(getSupabaseBrowserClient);
  const [session, setSession] = useState<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [settings, setSettings] = useState<Settings>({ business: {}, site_copy: {} });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'cakes', tag: 'New', description: '', details: '', imageUrl: '', sizes: [{ label: '500 g', price: '' }] });
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); }, [supabase]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message); else setSession(result.data.session);
    setLoading(false);
  }

  async function loadDashboard() {
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    const responses = await Promise.all([
      fetch('/api/admin/products', { headers }), fetch('/api/admin/orders', { headers }),
      fetch('/api/admin/feedback', { headers, cache: 'no-store' }), fetch('/api/admin/settings', { headers, cache: 'no-store' }),
    ]);
    if (responses.some((response) => response.status === 401 || response.status === 403)) {
      setError('Your account is not registered as an admin. Add its Auth user ID to public.admin_users.'); return;
    }
    setProducts(await responses[0].json()); setOrders(await responses[1].json()); setFeedback(await responses[2].json());
    const settingRows = await responses[3].json();
    setSettings(settingRows.reduce((result: Settings, row: { key: 'business' | 'site_copy'; value: Record<string, string> }) => ({ ...result, [row.key]: row.value }), { business: {}, site_copy: {} }));
  }

  useEffect(() => { loadDashboard(); }, [session]);

  async function update(path: string, body: object) {
    const response = await fetch(path, { method: 'PATCH', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) setError((await response.json()).error ?? 'Update failed.'); else await loadDashboard();
  }

  const setSetting = (group: 'business' | 'site_copy', key: string, value: string) => setSettings({ ...settings, [group]: { ...settings[group], [key]: value } });
  const updateNewSize = (index: number, field: 'label' | 'price', value: string) => setNewProduct({ ...newProduct, sizes: newProduct.sizes.map((size, sizeIndex) => sizeIndex === index ? { ...size, [field]: value } : size) });
  async function createProduct(event: React.FormEvent) {
    event.preventDefault();
    const form = new FormData();
    form.append('name', newProduct.name); form.append('category', newProduct.category); form.append('tag', newProduct.tag); form.append('description', newProduct.description); form.append('details', newProduct.details); form.append('imageUrl', newProduct.imageUrl);
    form.append('sizes', JSON.stringify(newProduct.sizes.map((size) => ({ label: size.label, price: Number(size.price) }))));
    if (photo) form.append('image', photo);
    const response = await fetch('/api/admin/products', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` }, body: form });
    if (!response.ok) { setError((await response.json()).error ?? 'Unable to create product.'); return; }
    setNewProduct({ name: '', category: 'cakes', tag: 'New', description: '', details: '', imageUrl: '', sizes: [{ label: '500 g', price: '' }] }); setPhoto(null); loadDashboard();
  }

  if (!session) return <main className="admin-page"><form className="admin-login" onSubmit={login}><p className="eyebrow">Cakes n&apos; Shapes</p><h1>Admin sign in</h1><p>Manage the menu, orders and customer feedback.</p><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="admin-error">{error}</p>}<button className="admin-button" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button><a href="/">← Back to storefront</a></form><AdminStyles /></main>;

  return <main className="admin-page"><div className="admin-shell"><header className="admin-header"><div><p className="eyebrow">Cakes n&apos; Shapes</p><h1>Bakery dashboard</h1></div><button className="signout" onClick={() => supabase.auth.signOut()}>Sign out</button></header>{error && <p className="admin-error">{error}</p>}
    <section className="admin-section"><div className="admin-section-heading"><h2>Catalog</h2><span>{products.length} products</span></div><form className="product-create" onSubmit={createProduct}><h3>Add a product</h3><div className="create-grid"><label>Name<input required value={newProduct.name} onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })} /></label><label>Category<select value={newProduct.category} onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value })}>{['cakes', 'cupcakes', 'jar-cakes', 'brownies', 'popsicles', 'hampers'].map((category) => <option key={category}>{category}</option>)}</select></label><label>Tag<input value={newProduct.tag} onChange={(event) => setNewProduct({ ...newProduct, tag: event.target.value })} /></label><label>Photo<input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} /></label><label className="wide">Image URL <span>(optional if uploading)</span><input value={newProduct.imageUrl} onChange={(event) => setNewProduct({ ...newProduct, imageUrl: event.target.value })} /></label><label className="wide">Short description<textarea required minLength={10} value={newProduct.description} onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })} /></label><label className="wide">Product details<textarea required minLength={10} value={newProduct.details} onChange={(event) => setNewProduct({ ...newProduct, details: event.target.value })} /></label></div><div className="new-sizes"><strong>Sizes and prices</strong>{newProduct.sizes.map((size, index) => <div className="size-line" key={index}><input required placeholder="Size label" value={size.label} onChange={(event) => updateNewSize(index, 'label', event.target.value)} /><input required type="number" min="0" placeholder="Price" value={size.price} onChange={(event) => updateNewSize(index, 'price', event.target.value)} /><button type="button" onClick={() => setNewProduct({ ...newProduct, sizes: newProduct.sizes.filter((_, sizeIndex) => sizeIndex !== index) })}>Remove</button></div>)}<button type="button" className="add-size" onClick={() => setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, { label: '', price: '' }] })}>+ Add size</button></div><button className="admin-button create-button">Create product</button></form><div className="admin-table">{products.map((product) => <div className="admin-row" key={product.id}><div className="admin-main"><strong>{product.name}</strong><small>{product.category} · {product.slug}</small><div className="size-editor">{product.product_sizes.map((size) => <div className="size-line" key={size.id}><input defaultValue={size.label} aria-label={`${product.name} size`} onBlur={(event) => event.target.value !== size.label && update('/api/admin/products', { sizeId: size.id, label: event.target.value })} /><input type="number" defaultValue={size.price_minor} aria-label={`${product.name} price`} onBlur={(event) => update('/api/admin/products', { sizeId: size.id, price_minor: Number(event.target.value) })} /><button onClick={() => update('/api/admin/products', { sizeId: size.id, is_active: !size.is_active })}>{size.is_active ? 'Hide' : 'Show'}</button></div>)}</div></div><div className="row-actions"><button onClick={() => { const name = window.prompt('Product name', product.name); if (name && name !== product.name) update('/api/admin/products', { id: product.id, name }); }}>Edit name</button><button onClick={() => update('/api/admin/products', { id: product.id, is_active: !product.is_active })}>{product.is_active ? 'Hide product' : 'Publish product'}</button></div></div>)}</div></section>
    <section className="admin-section"><div className="admin-section-heading"><h2>Orders</h2><span>{orders.length} orders</span></div><div className="admin-table">{orders.length ? orders.map((order) => <div className="admin-row" key={order.id}><div><strong>{order.reference} · {order.customer_name}</strong><small>{order.customer_phone} · {order.required_date}</small><div className="size-summary">{order.order_items?.map((item) => `${item.product_name} (${item.size_label}) × ${item.quantity}`).join(' · ')}</div></div><div className="row-actions"><strong>{formatPrice(order.total_minor)}</strong><select value={order.status} onChange={(event) => update('/api/admin/orders', { id: order.id, status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div></div>) : <p className="empty-admin">No orders yet.</p>}</div></section>
    <section className="admin-section"><div className="admin-section-heading"><h2>Feedback moderation</h2><span>{feedback.length} submissions</span></div><div className="admin-table">{feedback.length ? feedback.map((item) => <div className="admin-row" key={item.id}><div><strong>{item.customer_name} · {'★'.repeat(item.rating)}</strong><p>{item.message}</p></div><button className="row-button" onClick={() => update('/api/admin/feedback', { id: item.id, is_published: !item.is_published })}>{item.is_published ? 'Unpublish' : 'Publish'}</button></div>) : <p className="empty-admin">No feedback submissions yet.</p>}</div></section>
    <section className="admin-section"><div className="admin-section-heading"><h2>Public settings</h2><span>Shown on the storefront</span></div><div className="settings-grid"><label>Business name<input value={settings.business.name ?? ''} onChange={(event) => setSetting('business', 'name', event.target.value)} /></label><label>Location<input value={settings.business.location ?? ''} onChange={(event) => setSetting('business', 'location', event.target.value)} /></label><label>Phone<input value={settings.business.phone ?? ''} onChange={(event) => setSetting('business', 'phone', event.target.value)} /></label><label>WhatsApp number<input value={settings.business.whatsapp ?? ''} onChange={(event) => setSetting('business', 'whatsapp', event.target.value)} /></label><label>Homepage title<input value={settings.site_copy.title ?? ''} onChange={(event) => setSetting('site_copy', 'title', event.target.value)} /></label><label>Baker name<input value={settings.site_copy.baker ?? ''} onChange={(event) => setSetting('site_copy', 'baker', event.target.value)} /></label><button className="admin-button settings-save" onClick={() => { update('/api/admin/settings', { key: 'business', value: settings.business }); update('/api/admin/settings', { key: 'site_copy', value: settings.site_copy }); }}>Save settings</button></div></section>
  </div><AdminStyles /></main>;
}

function AdminStyles() { return <style jsx global>{`body{background:#fffaf7}.admin-page{min-height:100vh;padding:40px 20px 80px;background:#fffaf7;color:#2e2428}.admin-shell{width:min(1120px,100%);margin:auto}.admin-login{width:min(420px,100%);margin:12vh auto 0;padding:32px;border:1px solid #eadde2;border-radius:18px;background:#fff}.admin-login h1,.admin-header h1{margin:0 0 10px;font:600 42px Georgia,serif}.admin-login>p:not(.eyebrow){color:#756b70;margin-bottom:24px}.admin-login label,.settings-grid label,.create-grid label{display:grid;gap:5px;margin:14px 0;font-size:13px;font-weight:700}.admin-login input,.settings-grid input,.create-grid input,.create-grid select,.create-grid textarea{padding:12px;border:1px solid #eadde2;border-radius:9px;background:#fffaf7}.admin-login>a{display:block;margin-top:18px;color:#7b3154;font-size:13px;font-weight:700}.admin-button,.signout,.row-actions button,.row-button,.add-size{padding:10px 15px;border:0;border-radius:999px;background:#7b3154;color:#fff;font-weight:800;cursor:pointer}.admin-button{width:100%;margin-top:8px}.admin-button:disabled{opacity:.6}.admin-error{padding:12px;border-radius:9px;background:#f6e7ed;color:#7b3154;font-size:13px}.admin-header{display:flex;align-items:end;justify-content:space-between;margin-bottom:36px}.signout{background:#fff;color:#7b3154;border:1px solid #eadde2}.admin-section{margin-top:26px}.admin-section-heading{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px}.admin-section-heading h2{margin:0;font:600 28px Georgia,serif}.admin-section-heading span{color:#756b70;font-size:13px}.admin-table{border:1px solid #eadde2;border-radius:14px;background:#fff}.admin-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:17px;border-bottom:1px solid #eadde2}.admin-row:last-child{border-bottom:0}.admin-main{min-width:0}.admin-row strong{display:block}.admin-row small,.size-summary{display:block;margin-top:4px;color:#756b70;font-size:12px}.admin-row p{margin:6px 0 0;color:#756b70;font-size:13px}.row-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}.row-actions button,.row-button{padding:8px 12px;font-size:12px}.row-actions select{padding:8px;border:1px solid #eadde2;border-radius:8px;background:#fffaf7;color:#2e2428}.empty-admin{padding:22px;margin:0;color:#756b70}.size-editor,.new-sizes{display:grid;gap:6px;margin-top:10px}.size-line{display:flex;gap:6px}.size-line input{width:105px;padding:7px;border:1px solid #eadde2;border-radius:7px;background:#fffaf7}.size-line button{padding:6px 9px;border:1px solid #eadde2;border-radius:7px;background:#fff;color:#7b3154;font-size:11px;cursor:pointer}.product-create{margin-bottom:16px;padding:20px;border:1px solid #eadde2;border-radius:14px;background:#fff}.product-create h3{margin:0;font:600 22px Georgia,serif}.create-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.create-grid .wide{grid-column:1/-1}.create-grid textarea{min-height:80px;resize:vertical}.create-grid span{color:#756b70;font-weight:400}.new-sizes strong{font-size:13px}.new-sizes .add-size{width:max-content;margin-top:4px;padding:7px 11px;font-size:12px}.create-button{width:max-content;padding-inline:20px}.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;padding:20px;border:1px solid #eadde2;border-radius:14px;background:#fff}.settings-save{grid-column:1/-1;max-width:180px}.settings-grid input{width:100%}@media(max-width:650px){.admin-page{padding:24px 13px 60px}.admin-header{align-items:start}.admin-header h1{font-size:32px}.admin-row{align-items:start;flex-direction:column}.row-actions{width:100%;justify-content:flex-start;flex-wrap:wrap}.admin-login{margin-top:7vh;padding:22px}.create-grid,.settings-grid{grid-template-columns:1fr}.create-grid .wide{grid-column:auto}.settings-save{grid-column:auto}}`}</style>; }
