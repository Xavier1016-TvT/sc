import { HashRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import OrderDetail from './pages/OrderDetail'
import SubProjectDetail from './pages/SubProjectDetail'
import RecycleBin from './pages/RecycleBin'

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="recycle-bin" element={<RecycleBin />} />
            <Route path="order/:orderId" element={<OrderDetail />} />
            <Route path="order/:orderId/sub/:subId" element={<SubProjectDetail />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}
