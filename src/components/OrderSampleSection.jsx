import CollapsibleSection from './CollapsibleSection'
import FileUpload from './FileUpload'
import { SAMPLE_STATUSES } from '../utils/constants'

export default function OrderSampleSection({
  sampleInfo,
  onChange,
  defaultOpen = false,
  sectionId = 'sample',
  open,
  onOpenChange,
}) {
  const info = sampleInfo || { date: '', quantity: 0, result: '', image: null }

  return (
    <CollapsibleSection
      title="贴样情况"
      subtitle={[info.date, info.result].filter(Boolean).join(' · ') || '待填写'}
      sectionId={sectionId}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div>
          <label className="label-text">贴样日期</label>
          <input
            type="date"
            className="input-field"
            value={info.date}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </div>
        <div>
          <label className="label-text">贴样数量</label>
          <input
            type="number"
            min="0"
            className="input-field"
            value={info.quantity}
            onChange={(e) => onChange({ quantity: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label-text">贴样结果</label>
          <select
            className="input-field"
            value={info.result || '进行中'}
            onChange={(e) => onChange({ result: e.target.value })}
          >
            {SAMPLE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="label-text">贴样图片</label>
        <FileUpload
          value={info.image}
          onChange={(image) => onChange({ image })}
          accept="image/*"
          label="导入图片"
        />
      </div>
      <p className="text-xs text-slate-400 mt-3">在订单详情页统一维护，生产中与子项目共用</p>
    </CollapsibleSection>
  )
}
