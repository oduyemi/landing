import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <Head>
          <title>Project Portal | Òduyémi</title>
          <meta name="description" content="Track project milestones in real time" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* Favicon & Icons */}
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="shortcut icon" href="/favicon.ico" />

          {/* Android Icons */}
          <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        </Head>
        <body style={{ margin: 0, padding: 0 }}>
          {children}
        </body>
      </html>
    </>
  );
}
