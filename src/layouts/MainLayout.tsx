import TopNavBar from './TopNavBar'
import SideNavBar from './SideNavBar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed inset-x-0 top-0 h-16 z-40 bg-white shadow-sm">
        <TopNavBar />
      </header>
      <div className="pt-16 flex">
        <aside className="hidden md:block sticky top-16 w-64 h-[calc(100vh-4rem)] z-30">
          <SideNavBar />
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
