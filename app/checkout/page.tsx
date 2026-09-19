"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatPrice, type Product, whatsappLink } from "../../lib/catalog";

type CartItem = { slug: string; size: string; quantity: number };
type FormErrors = Partial<Record<keyof typeof initialCustomer, string>> & {
  form?: string;
};

const initialCustomer = {
  name: "",
  phone: "",
  date: "",
  address: "",
  notes: "",
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customer, setCustomer] = useState(initialCustomer);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getProduct = (slug: string) =>
    products.find((product) => product.slug === slug);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cakes-cart") ?? "[]"));
    fetch("/api/products", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => undefined);
  }, []);

  const updateQuantity = (index: number, quantity: number) => {
    const next = cart
      .map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity } : item,
      )
      .filter((item) => item.quantity > 0);
    setCart(next);
    localStorage.setItem("cakes-cart", JSON.stringify(next));
  };

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (customer.name.trim().length < 2)
      nextErrors.name = "Enter your name (at least 2 characters).";
    if (
      !/^[+()\d\s-]{7,20}$/.test(customer.phone.trim()) ||
      customer.phone.trim().length !== 10
    )
      nextErrors.phone = "Enter a valid phone number.";
    if (!customer.date) nextErrors.date = "Choose your required date.";
    else if (customer.date < new Date().toISOString().slice(0, 10))
      nextErrors.date = "Choose today or a future date.";
    if (customer.address.trim().length < 3)
      nextErrors.address = "Enter a pickup or delivery address.";
    if (customer.notes.trim().length > 1000)
      nextErrors.notes = "Notes must be 1000 characters or fewer.";
    if (!cart.length) nextErrors.form = "Your cart is empty.";
    const unavailable = cart.find(
      (item) =>
        !getProduct(item.slug)?.sizes.some((size) => size.label === item.size),
    );
    if (unavailable)
      nextErrors.form = `${unavailable.size} is no longer available for this product. Please return to the menu and choose another size.`;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { ...customer, requiredDate: customer.date },
        items: cart,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setErrors({
        form: result.error ?? "Unable to save your order. Please try again.",
      });
      setIsSubmitting(false);
      return;
    }
    localStorage.removeItem("cakes-cart");
    const message = `${result.whatsappMessage}\nName: ${customer.name}\nPhone: ${customer.phone}\nRequired date: ${customer.date}\nAddress / pickup: ${customer.address}\nNotes: ${customer.notes || "None"}`;
    window.open(
      `${whatsappLink}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setIsSubmitting(false);
  };

  const updateCustomer = (
    field: keyof typeof initialCustomer,
    value: string,
  ) => {
    setCustomer({ ...customer, [field]: value });
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const total = cart.reduce((sum, item) => {
    const product = getProduct(item.slug);
    const size = product?.sizes.find((option) => option.label === item.size);
    return sum + (size?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <main className="checkout-page">
      <div className="checkout-shell">
        <a className="back-link" href="/#shop">
          ← Continue shopping
        </a>
        <div className="checkout-heading">
          <p className="eyebrow">Your order</p>
          <h1>Almost ready to bake.</h1>
          <p>
            Review your treats, then share your details so Rinku can confirm
            availability on WhatsApp.
          </p>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <a className="checkout-button" href="/#shop">
              Explore the menu
            </a>
          </div>
        ) : (
          <div className="checkout-grid">
            <section className="cart-panel">
              <h2>Your treats</h2>
              {cart.map((item, index) => {
                const product = getProduct(item.slug);
                const size = product?.sizes.find(
                  (option) => option.label === item.size,
                );
                return (
                  <div className="cart-item" key={`${item.slug}-${item.size}`}>
                    <img src={product?.image} alt="" />
                    <div>
                      <h3>{product?.name}</h3>
                      <p>
                        {item.size} · {formatPrice(size?.price ?? 0)} each
                      </p>
                      <div className="cart-controls">
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <strong>
                      {formatPrice((size?.price ?? 0) * item.quantity)}
                    </strong>
                  </div>
                );
              })}
              <div className="cart-total">
                <span>Estimated total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p className="checkout-note">
                Final pricing may change for custom designs, delivery, or
                special packaging.
              </p>
            </section>
            <form className="customer-form" onSubmit={submitOrder}>
              <h2>Your details</h2>
              {errors.form && (
                <p className="form-error" role="alert">
                  {errors.form}
                </p>
              )}
              <label>
                Name
                <input
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  value={customer.name}
                  onChange={(event) =>
                    updateCustomer("name", event.target.value)
                  }
                />
                {errors.name && (
                  <small className="field-error" id="name-error">
                    {errors.name}
                  </small>
                )}
              </label>
              <label>
                Phone / WhatsApp
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  value={customer.phone}
                  onChange={(event) =>
                    updateCustomer("phone", event.target.value)
                  }
                />
                {errors.phone && (
                  <small className="field-error" id="phone-error">
                    {errors.phone}
                  </small>
                )}
              </label>
              <label>
                Required date
                <input
                  required
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "date-error" : undefined}
                  value={customer.date}
                  onChange={(event) =>
                    updateCustomer("date", event.target.value)
                  }
                />
                {errors.date && (
                  <small className="field-error" id="date-error">
                    {errors.date}
                  </small>
                )}
              </label>
              <label>
                Pickup or delivery address
                <textarea
                  required
                  rows={3}
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={
                    errors.address ? "address-error" : undefined
                  }
                  value={customer.address}
                  onChange={(event) =>
                    updateCustomer("address", event.target.value)
                  }
                />
                {errors.address && (
                  <small className="field-error" id="address-error">
                    {errors.address}
                  </small>
                )}
              </label>
              <label>
                Notes <span>(optional)</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  aria-invalid={Boolean(errors.notes)}
                  aria-describedby={errors.notes ? "notes-error" : undefined}
                  value={customer.notes}
                  onChange={(event) =>
                    updateCustomer("notes", event.target.value)
                  }
                  placeholder="Flavour, message, theme, delivery timing..."
                />
                {errors.notes && (
                  <small className="field-error" id="notes-error">
                    {errors.notes}
                  </small>
                )}
              </label>
              <button
                className="checkout-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending order..." : "Confirm on WhatsApp →"}
              </button>
            </form>
          </div>
        )}
      </div>
      <style jsx global>{`
        body {
          background: #fffaf7;
        }
        .checkout-page {
          min-height: 100vh;
          padding: 34px 20px 80px;
          background: #fffaf7;
          color: #2e2428;
        }
        .checkout-shell {
          width: min(1080px, 100%);
          margin: auto;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 28px;
          color: #7b3154;
          font-size: 14px;
          font-weight: 700;
        }
        .checkout-heading {
          max-width: 650px;
          margin-bottom: 32px;
        }
        .checkout-heading h1 {
          margin: 0 0 10px;
          font:
            600 clamp(40px, 5vw, 62px)/1.05 Georgia,
            serif;
        }
        .checkout-heading > p:last-child {
          color: #756b70;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 22px;
          align-items: start;
        }
        .cart-panel,
        .customer-form {
          padding: 28px;
          border: 1px solid #eadde2;
          border-radius: 18px;
          background: #fff;
        }
        .cart-panel h2,
        .customer-form h2 {
          margin: 0 0 22px;
          font:
            600 25px Georgia,
            serif;
        }
        .cart-item {
          display: grid;
          grid-template-columns: 78px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #eadde2;
        }
        .cart-item img {
          width: 78px;
          height: 78px;
          object-fit: cover;
          border-radius: 10px;
        }
        .cart-item h3 {
          margin: 0 0 3px;
          font:
            600 18px Georgia,
            serif;
        }
        .cart-item p {
          margin: 0;
          color: #756b70;
          font-size: 12px;
        }
        .cart-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 9px;
        }
        .cart-controls button {
          width: 25px;
          height: 25px;
          border: 1px solid #eadde2;
          border-radius: 50%;
          background: #fff;
          color: #7b3154;
          cursor: pointer;
        }
        .cart-item > strong,
        .cart-total strong {
          color: #7b3154;
        }
        .cart-total {
          display: flex;
          justify-content: space-between;
          margin-top: 22px;
          font-weight: 800;
        }
        .checkout-note {
          color: #756b70;
          font-size: 12px;
        }
        .customer-form {
          display: grid;
          gap: 14px;
        }
        .customer-form h2 {
          margin-bottom: 4px;
        }
        .form-error,
        .field-error {
          color: #a32929;
        }
        .form-error {
          margin: 0;
          padding: 10px 12px;
          border-radius: 9px;
          background: #fff0f0;
          font-size: 13px;
          font-weight: 700;
        }
        .customer-form label {
          display: grid;
          gap: 5px;
          font-size: 13px;
          font-weight: 700;
        }
        .customer-form label span {
          color: #756b70;
          font-weight: 400;
        }
        .field-error {
          font-size: 12px;
          font-weight: 600;
        }
        .customer-form input,
        .customer-form textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #eadde2;
          border-radius: 9px;
          background: #fffaf7;
          color: #2e2428;
          resize: vertical;
        }
        .customer-form input:focus,
        .customer-form textarea:focus {
          outline: 2px solid #f6e7ed;
          border-color: #7b3154;
        }
        .customer-form input[aria-invalid="true"],
        .customer-form textarea[aria-invalid="true"] {
          border-color: #c44;
          background: #fff8f8;
        }
        .checkout-button {
          display: inline-block;
          padding: 13px 20px;
          border: 0;
          border-radius: 999px;
          background: #7b3154;
          color: #fff;
          font-weight: 800;
          text-align: center;
          cursor: pointer;
        }
        .checkout-button:hover {
          background: #642742;
        }
        .checkout-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .empty-cart {
          padding: 45px;
          text-align: center;
          border: 1px solid #eadde2;
          border-radius: 18px;
          background: #fff;
        }
        .empty-cart h2 {
          font:
            600 28px Georgia,
            serif;
        }
        @media (max-width: 750px) {
          .checkout-page {
            padding: 22px 13px 60px;
          }
          .checkout-grid {
            grid-template-columns: 1fr;
          }
          .cart-panel,
          .customer-form {
            padding: 20px;
          }
          .cart-item {
            grid-template-columns: 60px 1fr auto;
          }
          .cart-item img {
            width: 60px;
            height: 60px;
          }
          .cart-item > strong {
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}
