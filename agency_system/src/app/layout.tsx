"use client";

import { Provider } from 'react-redux';
import store from '../redux/store';
import { Work_Sans } from 'next/font/google';
import './globals.css';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/bus-icon.svg" type="image/x-icon" />
      </head>
      <body className={`${workSans.variable} antialiased`}>
        {/* Wrap the entire app with Redux Provider */}
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
