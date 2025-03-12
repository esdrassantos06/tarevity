import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="bg-bgLight dark:bg-bgDark flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}
