import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/auth-context';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';

export const metadata: Metadata = {
  title: 'CinemaPro - Xem Phim Online Chất Lượng Cao Chuẩn Rạp',
  description: 'Trang web xem phim trực tuyến hiện đại, kho phim phong phú chuẩn rạp với giao diện Cinematic',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-white flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
