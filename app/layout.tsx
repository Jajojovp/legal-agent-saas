/**
 * Root layout - minimal wrapper
 * The actual HTML structure and providers are in app/[locale]/layout.tsx
 * This file only exists because Next.js requires a root layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
