import React from 'react';

export const metadata = {
  title: 'CRM Marketing - ERP Pendidikan UNSIA',
  description: 'Customer Relationship Management Universitas Siber Asia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script src="https://cdn.tailwindcss.com" defer></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('DOMContentLoaded', () => {
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      brand: {
                        50: '#eef5fb', 100: '#d9e7f1', 200: '#aac6dd', 300: '#7aa5c8',
                        400: '#3d80aa', 500: '#00719f', 600: '#0f487b', 700: '#0a345c',
                        800: '#08294d', 900: '#05203f',
                        accent: '#FED524',
                        'accent-deep': '#E8B900'
                      }
                    }
                  }
                }
              };
            });
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono&family=Urbanist:wght@700;800;900&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              background-color: #030712;
              color: #e2e8f0;
            }

            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }

            .sk-shimmer {
              background: linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%);
              background-size: 200% 100%;
              animation: shimmer 1.6s infinite linear !important;
            }
          `
        }} />
      </head>
      <body className="bg-gray-950 text-slate-200 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
