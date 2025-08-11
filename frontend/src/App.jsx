import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Register from './pages/auth/register';
import Login from './pages/auth/login';
import Dashboard from './pages/dashboard';
import Account from './pages/account';
import SettingsPage from './pages/settingsPage';
import TransactionPage from './pages/transactionsPage';
import useStore from './utils/theme';
import { setAuthToken } from './utils/api';
import { Toaster } from 'sonner';
import Navbar from './components/NavBar';

// Root layout component for private routes
const RootLayout = () =>{
  // State to manage user authentication status
  const {user} = useStore((state) => state) // Replace with actual user authentication logic
  setAuthToken(user?.token || null ); // Set the auth token if user exists
console.log("user in root layout", user);

  return !user ? (
    <Navigate to= "/register" replace={true}/> 
  ) : (
    <>
      <Navbar/>
    <div className='min-h-[calc(h-screen-100px)]'>
      <Outlet />
      {/* This is where the main content will be rendered */}
    </div>
    </>
  );
}

function App() {
  
    return (
    <main >
      <div className='w-full min-h-screen px-6 bg-slate-200 md:px-20 dark:bg-slate-900'>
      <Routes>
      {/* Private Routes */}
      <Route element={<RootLayout/>}>
        <Route path='/' element={<Navigate to="/dashboard"/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path='/transaction' element={<TransactionPage/>}/>
        <Route path='/settings' element={<SettingsPage/>}/>
      </Route>

        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
      </div>
      <Toaster richColors position='top-center'/>
  </main>
  );
}

export default App
