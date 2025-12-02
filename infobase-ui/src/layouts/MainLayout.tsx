import TopNavBar from './TopNavBar'
import SideNavBar from './SideNavBar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
   <>
   <div className='flex flex-col'>
   <div className='w-full fixed top-0'><TopNavBar/></div>
    <div className='flex'> 
      <div className='fixed top-16'><SideNavBar/></div>
      <div className='h-full w-full'>
        <main className='p-15 ml-16'>
          <Outlet/>
        </main>
      </div>
    </div>
   </div>
   </>
  )
}

export default MainLayout