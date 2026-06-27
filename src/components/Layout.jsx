import { Link, Outlet, useLocation } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { getDashboardHomePath } from '../utils/dashboardNav'

const SYNC_LABELS = {
  loading: '加载中',
  ready: '云端已连接',
  saving: '保存中…',
  saved: '已同步',
  synced: '已同步',
  error: '同步异常',
}

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === ''
  const isRecycleBin = location.pathname === '/recycle-bin'
  const { syncStatus, deletedOrders } = useData()
  const deletedCount = deletedOrders.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="app-container py-4 flex items-center justify-between">
          <Link to={getDashboardHomePath()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                生产数据看板
              </h1>
              {!isHome && (
                <p className="text-xs text-slate-400">返回首页</p>
              )}
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/recycle-bin"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isRecycleBin
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🗑️</span>
              <span>回收站</span>
              {deletedCount > 0 && (
                <span
                  className={`min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                    isRecycleBin ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {deletedCount}
                </span>
              )}
            </Link>
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                syncStatus === 'error'
                  ? 'bg-red-100 text-red-700'
                  : syncStatus === 'saving'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {SYNC_LABELS[syncStatus] || syncStatus}
            </span>
          </div>
        </div>
      </header>
      <main className="app-container py-6">
        <Outlet />
      </main>
    </div>
  )
}
