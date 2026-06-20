import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cakes n' Shapes | Artisanal Custom Bakery",
  description: "Crafting premium bespoke custom cakes, elegant shapes, and unforgettable flavors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}