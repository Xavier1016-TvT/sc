import { useState, useEffect } from 'react'
import { ORDER_STATUSES, ORDER_UNITS } from '../utils/constants'

export default function OrderModal({ open, order, manufacturers, onSave, onClose, onAddManufacturer }) {
  const [form, setForm] = useState({
    name: '',
    quantity: 1,
    quantityUnit: '套',
    manufacturer: '',
    deliveryDate: '',
    status: '未下单',
  })
  const [newMfr, setNewMfr] = useState('')

  useEffect(() => {
    if (open) {
      setForm({
        name: order?.name || '',
        quantity: order?.quantity ?? 1,
        quantityUnit: order?.quantityUnit || '套',
        manufacturer: order?.status === '未下单' ? '' : (order?.manufacturer || manufacturers[0] || ''),
        deliveryDate: order?.deliveryDate || '',
        status: order?.status || '未下单',
      })
    }
  }, [open, order, manufacturers])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('请输入订单名称')
      return
    }
    const payload = { ...form }
    if (payload.status === '未下单') {
      payload.manufacturer = ''
    } else if (!payload.manufacturer) {
      payload.manufacturer = manufacturers[0] || ''
    }
    onSave(payload)
    onClose()
  }

  const showManufacturer = form.status !== '未下单'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {order ? '编辑订单' : '新增订单'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">订单名称</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="输入订单名称"
            />
          </div>
          <div>
            <label className="label-text">订单数量</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                className="input-field flex-1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
              <select
                className="input-field w-24 shrink-0"
                value={form.quantityUnit}
                onChange={(e) => setForm({ ...form, quantityUnit: e.target.value })}
              >
                {ORDER_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {form.quantityUnit === '套'
                ? '累计出货取各子项目最小值（整套装）'
                : '累计出货取各子项目总和'}
            </p>
          </div>
          {showManufacturer && (
          <div>
            <label className="label-text">贴片厂家</label>
            <select
              className="input-field"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            >
              {manufacturers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                className="input-field flex-1"
                placeholder="新增厂家选项"
                value={newMfr}
                onChange={(e) => setNewMfr(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={() => {
                  if (newMfr.trim()) {
                    onAddManufacturer(newMfr.trim())
                    setForm({ ...form, manufacturer: newMfr.trim() })
                    setNewMfr('')
                  }
                }}
              >
                添加
              </button>
            </div>
          </div>
          )}
          <div>
            <label className="label-text">订单交期</label>
            <input
              type="date"
              className="input-field"
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">订单状态</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  )
}
