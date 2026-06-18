import { useEffect, useState } from 'react'
import FileUpload from './FileUpload'

export default function ChipFirmwareSection({ chipFirmware, onChange }) {
  const fw = chipFirmware || { name: '', spec: '', file: null }

  const update = (patch) => onChange({ ...fw, ...patch })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
      <div>
        <label className="label-text">芯片名称</label>
        <input
          className="input-field"
          value={fw.name || ''}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="如 STM32F103"
        />
      </div>
      <div>
        <label className="label-text">规格</label>
        <input
          className="input-field"
          value={fw.spec || ''}
          onChange={(e) => update({ spec: e.target.value })}
          placeholder="型号 / 封装等"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label-text">固件文件</label>
        <FileUpload
          value={fw.file}
          onChange={(file) => update({ file })}
          accept="*/*"
          label="上传固件"
          preview
        />
      </div>
    </div>
  )
}
