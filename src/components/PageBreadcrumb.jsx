import { Link, useNavigate } from 'react-router-dom'

/** 订单/子项目页顶部：返回上一页 + 面包屑，滚动时固定在全局 header 下方 */
export default function PageBreadcrumb({ items, showBack = true }) {
  const navigate = useNavigate()

  if (!showBack && !items?.length) return null

  return (
    <div className="page-breadcrumb" aria-label="页面导航">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors shrink-0"
          >
            <span aria-hidden>←</span>
            <span>返回上一页</span>
          </button>
        )}
        {items?.length > 0 && (
          <nav className="text-sm text-slate-500 min-w-0">
            {items.map((item, i) => {
              const isLast = i === items.length - 1
              return (
                <span key={item.key || `${item.label}-${i}`} className="inline-flex items-center">
                  {i > 0 && <span className="mx-2 text-slate-300">/</span>}
                  {item.to && !isLast ? (
                    <Link to={item.to} className="hover:text-primary-600 transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-slate-800 font-medium' : undefined}>
                      {item.label}
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}
