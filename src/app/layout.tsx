import type { Metadata, Viewport } from "next";
import "../design-system/styles.css";
import "./app.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://okweknowledge.com"),
  title: {
    default: "Okwe Knowledge — the publishing operating system",
    template: "%s · Okwe Knowledge",
  },
  description:
    "How Okwe looks, how it sounds, what it publishes, how one idea becomes many assets, and how content becomes products.",
  applicationName: "Okwe Knowledge",
  icons: {
    icon: [{ url: "/assets/logo/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/assets/logo/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Okwe Knowledge",
    title: "Okwe Knowledge — the publishing operating system",
    description: "Two people · three pillars · one register.",
    images: [{ url: "/assets/logo/og-default.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  // Chalk, so the browser chrome matches the page ground rather than flashing white.
  themeColor: "#E6EAE7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
