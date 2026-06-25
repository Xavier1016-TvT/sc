import { Link } from 'react-router-dom'

/** 订单/子项目页顶部面包屑，滚动时固定在全局 header 下方 */
export default function PageBreadcrumb({ items }) {
  if (!items?.length) return null

  return (
    <nav className="page-breadcrumb text-sm text-slate-500" aria-label="页面导航">
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
              <span className={isLast ? 'text-slate-800 font-medium' : undefined}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
