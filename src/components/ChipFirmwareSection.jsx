import { createChipFirmware } from '../utils/defaults'
import FileUpload from './FileUpload'

export default function ChipFirmwareSection({ items = [], onChange }) {
  const list = Array.isArray(items) ? items : []

  const update = (id, patch) => {
    onChange(list.map((fw) => (fw.id === id ? { ...fw, ...patch } : fw)))
  }

  const add = () => onChange([...list, createChipFirmware()])

  const remove = (id) => {
    if (list.length <= 1) {
      onChange([])
      return
    }
    onChange(list.filter((fw) => fw.id !== id))
  }

  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">一块板可登记多颗芯片，可增删改</p>
        <button type="button" className="btn-secondary text-xs shrink-0" onClick={add}>
          + 添加芯片
        </button>
      </div>

      {!list.length ? (
        <div className="text-center py-8 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
          暂无芯片记录，点击「添加芯片」开始登记
        </div>
      ) : (
        list.map((fw, index) => (
          <div
            key={fw.id}
            id={`highlight-${fw.id}`}
            className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">
                芯片 {index + 1}
                {fw.name ? ` · ${fw.name}` : ''}
              </span>
              <button
                type="button"
                className="text-xs text-red-500 hover:underline shrink-0"
                onClick={() => remove(fw.id)}
              >
                删除
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">芯片名称</label>
                <input
                  className="input-field"
                  value={fw.name || ''}
                  onChange={(e) => update(fw.id, { name: e.target.value })}
                  placeholder="如 STM32F103"
                />
              </div>
              <div>
                <label className="label-text">规格</label>
                <input
                  className="input-field"
                  value={fw.spec || ''}
                  onChange={(e) => update(fw.id, { spec: e.target.value })}
                  placeholder="型号 / 封装等"
                />
              </div>
              <div>
                <label className="label-text">程序</label>
                <input
                  className="input-field"
                  value={fw.program || ''}
                  onChange={(e) => update(fw.id, { program: e.target.value })}
                  placeholder="程序名称 / 版本号"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">备注</label>
                <textarea
                  className="textarea-field textarea-compact"
                  rows={2}
                  value={fw.note || ''}
                  onChange={(e) => update(fw.id, { note: e.target.value })}
                  placeholder="补充说明，可拖拽右下角拉高"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">固件文件</label>
                <FileUpload
                  value={fw.file}
                  onChange={(file) => update(fw.id, { file })}
                  accept="*/*"
                  label="上传固件"
                  preview
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
