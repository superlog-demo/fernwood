import "./globals.css";

export const metadata = {
  title: "Fernwood — indoor plants",
  description: "A small plant shop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
