import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
  getOrderMetrics,
  formatPercent,
  formatDefectRate,
  getOrderUnit,
  formatQty,
} from '../utils/calculations'
import OrderSampleSection from '../components/OrderSampleSection'
import OrderMaterialSection from '../components/OrderMaterialSection'
import SubProjectSummaryTable from '../components/SubProjectSummaryTable'
import ReturnRecordsTable from '../components/ReturnRecordsTable'
import OrderTypeBadge from '../components/OrderTypeBadge'
import PageBreadcrumb from '../components/PageBreadcrumb'
import { ORDER_STATUSES, ORDER_TYPES, ORDER_UNITS } from '../utils/constants'
import { isReturnRequired, isLargeOrder } from '../utils/orderWorkflow'
import { defaultSampleInfo, defaultMaterialPrep } from '../utils/orderSync'
import {
  getOrderNameLabel,
  isPieceOrder,
  orderShowsSubProjectMaterial,
} from '../utils/orderUnit'
import { useSearchTarget } from '../hooks/useSearchTarget'

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const {
    getOrder,
    addSubProject,
    updateSubProject,
    deleteSubProject,
    updateOrder,
    manufacturers,
    addManufacturer,
  } = useData()
  const order = getOrder(orderId)
  const [newSubName, setNewSubName] = useState('')
  const [editingSub, setEditingSub] = useState(null)
  const [newMfr, setNewMfr] = useState('')
  const [openSection, setOpenSection] = useState(null)

  useSearchTarget({ onSection: setOpenSection })

  if (!order) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500">订单不存在</p>
        <Link to="/" className="btn-primary mt-4 inline-block">返回首页</Link>
      </div>
    )
  }

  const sectionProps = (id, { defaultOpen = false } = {}) => {
    if (openSection === null) {
      return defaultOpen ? { defaultOpen: true } : {}
    }
    return {
      open: openSection === id,
      onOpenChange: () => setOpenSection((prev) => (prev === id ? null : id)),
    }
  }

  const breadcrumb = (
    <PageBreadcrumb
      items={[
        { label: '首页', to: '/' },
        { label: order.name },
      ]}
    />
  )

  const metrics = getOrderMetrics(order)
  const unit = getOrderUnit(order)
  const hasSubProjects = (order.subProjects || []).length > 0
  const useSubMaterial = orderShowsSubProjectMaterial(order)
  const sampleInfo = order.sampleInfo || defaultSampleInfo()
  const materialPrep = order.materialPrep || defaultMaterialPrep()

  const patchSample = (patch) =>
    updateOrder(orderId, { sampleInfo: { ...sampleInfo, ...patch } })

  const patchMaterialPrep = (patch) =>
    updateOrder(orderId, { materialPrep: { ...materialPrep, ...patch } })

  const changeStatus = (next) => {
    if (window.confirm(`确认将订单流转至「${next}」？`)) {
      const patch = { status: next }
      if (next === '生产中' && !order.manufacturer && manufacturers[0]) {
        patch.manufacturer = manufacturers[0]
      }
      updateOrder(orderId, patch)
    }
  }

  const goBackStatus = () => {
    const idx = ORDER_STATUSES.indexOf(order.status)
    if (idx <= 0) return
    const prev = ORDER_STATUSES[idx - 1]
    if (window.confirm(`确认退回至「${prev}」？`)) {
      updateOrder(orderId, { status: prev })
    }
  }

  if (order.status === '未下单') {
    return (
      <div className="space-y-4">
        {breadcrumb}
        <WorkflowHeader
          order={order}
          onAdvance={() => changeStatus('生产中')}
          nextLabel="进入生产 →"
        />

        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">{getOrderNameLabel(order)}</label>
              <input
                className="input-field"
                value={order.name}
                onChange={(e) => updateOrder(orderId, { name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">订单类型</label>
              <select
                className="input-field"
                value={order.orderType || '小订单'}
                onChange={(e) => updateOrder(orderId, { orderType: e.target.value })}
              >
                {ORDER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">订单数量</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  className="input-field flex-1"
                  value={order.quantity}
                  onChange={(e) => updateOrder(orderId, { quantity: Number(e.target.value) })}
                />
                <select
                  className="input-field w-24 shrink-0"
                  value={unit}
                  onChange={(e) => updateOrder(orderId, { quantityUnit: e.target.value })}
                >
                  {ORDER_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <OrderSampleSection
          sampleInfo={sampleInfo}
          onChange={patchSample}
          {...sectionProps('sample', { defaultOpen: true })}
        />
        <OrderMaterialSection
          materialPrep={materialPrep}
          onChange={patchMaterialPrep}
          hasSubProjects={useSubMaterial}
          subProjects={order.subProjects}
          orderId={orderId}
          {...sectionProps('material')}
        />
      </div>
    )
  }

  if (order.status === '已结单') {
    return (
      <div className="space-y-4">
        {breadcrumb}
        <WorkflowHeader
          order={order}
          onBack={goBackStatus}
          backLabel="← 退回生产中"
        />

        <div className="card">
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${isReturnRequired(order) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
            <Stat label="订单名称" value={order.name} />
            <Stat label="订单类型" value={order.orderType || '小订单'} />
            <Stat label="订单数量" value={formatQty(order.quantity, unit)} />
            <Stat label="已出货" value={formatQty(metrics.cumulativeShipping, unit)} highlight={isLargeOrder(order)} />
            {isReturnRequired(order) && (
              <Stat
                label="已贴回"
                value={formatQty(metrics.cumulativeReturned, unit)}
                highlight
              />
            )}
          </div>
        </div>

        {order.subProjects?.length > 0 ? (
          <>
            {isReturnRequired(order) && (
              <div className="card">
                <h3 className="text-base font-semibold text-slate-800 mb-4">贴回登记</h3>
                <div className="space-y-6">
                  {order.subProjects.map((sub) => (
                    <div key={sub.id} className="border border-slate-100 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">{sub.name}</h4>
                      <ReturnRecordsTable
                        records={sub.returnRecords || []}
                        subProject={sub}
                        onChange={(returnRecords) =>
                          updateSubProject(orderId, sub.id, { returnRecords })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="text-base font-semibold text-slate-800 mb-4">子项目汇总</h3>
              <SubProjectSummaryTable
                orderId={orderId}
                order={order}
                subProjects={order.subProjects}
                variant="closed"
              />
            </div>
          </>
        ) : (
          <div className="card text-sm text-slate-500 text-center py-8">
            暂无子项目，请退回「生产中」新增子项目。
          </div>
        )}
      </div>
    )
  }

  // 生产中
  const handleAddSub = () => {
    const name = newSubName.trim() || '新子项目'
    const id = addSubProject(orderId, name)
    setNewSubName('')
    if (!id) return
    navigate(`/order/${orderId}/sub/${id}`)
  }

  const handleDeleteSub = (sub) => {
    if (window.confirm(`确定删除子项目「${sub.name}」？`)) {
      deleteSubProject(orderId, sub.id)
    }
  }

  return (
    <div className="space-y-6">
      {breadcrumb}
      <WorkflowHeader
        order={order}
        onBack={goBackStatus}
        backLabel="← 退回未下单"
        onAdvance={() => changeStatus('已结单')}
        nextLabel="结单 →"
      />

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{order.name}</h2>
              <OrderTypeBadge type={order.orderType} />
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500 items-center">
              <span>数量：{formatQty(order.quantity, unit)}</span>
              <span className="flex items-center gap-2">
                <span>贴片厂：</span>
                <select
                  className="input-field py-1 w-auto min-w-[120px] text-sm"
                  value={order.manufacturer || manufacturers[0] || ''}
                  onChange={(e) => updateOrder(orderId, { manufacturer: e.target.value })}
                >
                  {manufacturers.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </span>
              <span>交期：{order.deliveryDate || '未设置'}</span>
            </div>
            <div className="flex gap-2 mt-2 max-w-md">
              <input
                className="input-field py-1 text-sm flex-1"
                placeholder="新增贴片厂家"
                value={newMfr}
                onChange={(e) => setNewMfr(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary text-xs shrink-0"
                onClick={() => {
                  if (newMfr.trim()) {
                    addManufacturer(newMfr.trim())
                    updateOrder(orderId, { manufacturer: newMfr.trim() })
                    setNewMfr('')
                  }
                }}
              >
                添加厂家
              </button>
            </div>
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 ${isReturnRequired(order) ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
          <Stat label="已出货" value={formatQty(metrics.cumulativeShipping, unit)} highlight={isLargeOrder(order)} />
          {isReturnRequired(order) && (
            <Stat
              label="已贴回"
              value={formatQty(metrics.cumulativeReturned, unit)}
              highlight
            />
          )}
          <Stat
            label="完成率"
            value={formatPercent(metrics.completionRate)}
            sub={isLargeOrder(order) ? '按出货' : '按贴回'}
          />
          <Stat label="不良合计" value={`${metrics.totalDefects} 个`} />
          <Stat label="不良率" value={formatDefectRate(metrics.defectRate)} />
        </div>
      </div>

      <OrderSampleSection
        sampleInfo={sampleInfo}
        onChange={patchSample}
        {...sectionProps('sample')}
      />
      <OrderMaterialSection
        materialPrep={materialPrep}
        onChange={patchMaterialPrep}
        hasSubProjects={useSubMaterial}
        subProjects={order.subProjects}
        orderId={orderId}
        {...sectionProps('material')}
      />

      <div id="section-subs" className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-slate-800">子项目列表</h3>
          {!(isPieceOrder(order) && hasSubProjects) && (
            <div className="flex gap-2">
              <input
                className="input-field w-48"
                placeholder="子项目名称"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
              />
              <button type="button" className="btn-primary" onClick={handleAddSub}>
                + 新增子项目
              </button>
            </div>
          )}
        </div>

        <SubProjectSummaryTable
          orderId={orderId}
          order={order}
          subProjects={order.subProjects}
          editable
          editingSub={editingSub}
          onEditName={(subId, name) => {
            updateSubProject(orderId, subId, { name })
            setEditingSub(null)
          }}
          onStartRename={setEditingSub}
          onDelete={handleDeleteSub}
        />
      </div>
    </div>
  )
}

function WorkflowHeader({ order, onBack, backLabel, onAdvance, nextLabel }) {
  const steps = ORDER_STATUSES
  const currentIdx = steps.indexOf(order.status)

  return (
    <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    i === currentIdx
                      ? 'bg-primary-600 text-white'
                      : i < currentIdx
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step}
                </span>
                {i < steps.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {onBack && backLabel && (
              <button type="button" className="btn-secondary" onClick={onBack}>
                {backLabel}
              </button>
            )}
            {onAdvance && nextLabel && (
              <button type="button" className="btn-primary" onClick={onAdvance}>
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
  )
}

function Stat({ label, value, highlight, sub }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? 'text-primary-600' : 'text-slate-800'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  )
}
