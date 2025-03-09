import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark">
      <Header />
      <main className="container flex-1 mx-auto px-4 py-8">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}