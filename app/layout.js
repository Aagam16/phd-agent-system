import "./globals.css";

export const metadata = {
  title: "PhD Agent System — Influencer Marketing S-O-R",
  description: "3-agent PhD research assistant for S-O-R influencer marketing research",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
