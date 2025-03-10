import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bgLight dark:bg-bgDark ">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}
