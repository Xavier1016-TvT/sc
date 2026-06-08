import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import OrderDetail from './pages/OrderDetail'
import SubProjectDetail from './pages/SubProjectDetail'

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="order/:orderId" element={<OrderDetail />} />
            <Route path="order/:orderId/sub/:subId" element={<SubProjectDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
