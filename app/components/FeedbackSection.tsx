'use client';

import { FormEvent, useEffect, useState } from 'react';
type Feedback = { id: string; customer_name: string; message: string; rating: number };

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [form, setForm] = useState({ customerName: '', message: '', rating: 5 });
  const [notice, setNotice] = useState('');

  useEffect(() => { fetch('/api/feedback', { cache: 'no-store' }).then((response) => response.json()).then((data) => setFeedback(Array.isArray(data) ? data : [])).catch(() => setFeedback([])); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    setNotice(data.message ?? data.error);
    if (response.ok) setForm({ customerName: '', message: '', rating: 5 });
  }

  return <><div className="reviews">{feedback.length ? feedback.map((item) => <div className="review" key={item.id}><span className="stars">{'★'.repeat(item.rating)}</span><p>“{item.message}”</p><strong>— {item.customer_name}</strong></div>) : <div className="review"><span className="stars">★★★★★</span><p>“We are baking new memories every day. Share your experience with us after your order.”</p><strong>— Cakes n&apos; Shapes</strong></div>}</div><form className="feedback-form" onSubmit={submit}><h3>Share your experience</h3><div className="feedback-fields"><input required maxLength={80} placeholder="Your name" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} /><select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}><option value={5}>5 stars</option><option value={4}>4 stars</option><option value={3}>3 stars</option><option value={2}>2 stars</option><option value={1}>1 star</option></select><textarea required minLength={10} maxLength={1000} placeholder="Tell us about your order" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /><button className="primary-button" type="submit">Send feedback</button></div>{notice && <p className="feedback-notice">{notice}</p>}</form><style jsx global>{`.feedback-form{margin-top:24px;padding:22px;border:1px solid #eadde2;border-radius:18px;background:#fff}.feedback-form h3{margin:0 0 14px;font:600 22px Georgia,serif}.feedback-fields{display:grid;grid-template-columns:1fr 150px;gap:10px}.feedback-fields input,.feedback-fields select,.feedback-fields textarea{padding:11px 12px;border:1px solid #eadde2;border-radius:9px;background:#fffaf7;color:#2e2428}.feedback-fields textarea{grid-column:1/-1;min-height:90px;resize:vertical}.feedback-fields button{cursor:pointer}.feedback-notice{margin:12px 0 0;color:#756b70;font-size:13px}@media(max-width:600px){.feedback-fields{grid-template-columns:1fr}.feedback-fields textarea{grid-column:auto}}`}</style></>;
}
