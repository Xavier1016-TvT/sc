import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
  getSubProjectShipped,
  getSubProjectReturned,
  getSubProjectCumulative,
  getSubProjectTestCumulative,
  getSubProjectDefects,
} from '../utils/calculations'
import CollapsibleSection from '../components/CollapsibleSection'
import DocConfirmationSection from '../components/DocConfirmationSection'
import ChipFirmwareSection from '../components/ChipFirmwareSection'
import MaterialTable from '../components/MaterialTable'
import ProcessRecordsTable from '../components/ProcessRecordsTable'
import ProblemNotesTable from '../components/ProblemNotesTable'
import ShippingTable from '../components/ShippingTable'
import DefectStatsTable from '../components/DefectStatsTable'
import PageBreadcrumb from '../components/PageBreadcrumb'
import { getMaterialSubtitle } from '../utils/materialAggregate'
import OrderTypeBadge from '../components/OrderTypeBadge'
import { isLargeOrder } from '../utils/orderWorkflow'
import { getDashboardHomePath } from '../utils/dashboardNav'
import { useSearchTarget } from '../hooks/useSearchTarget'

export default function SubProjectDetail() {
  const { orderId, subId } = useParams()
  const { getOrder, getSubProject, updateSubProject } = useData()
  const order = getOrder(orderId)
  const sub = getSubProject(orderId, subId)
  const [openSection, setOpenSection] = useState(null)

  useSearchTarget({ onSection: setOpenSection })

  if (!order || !sub) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500">子项目不存在</p>
        <Link to="/" className="btn-primary mt-4 inline-block">返回首页</Link>
      </div>
    )
  }

  const patch = (data) => updateSubProject(orderId, subId, data)
  const samplePassed = order.sampleInfo?.result === '通过'
  const materialStatus = sub.materialStatus || { option: '备料中', note: '', file: null, items: [] }
  const chipFirmwares = sub.chipFirmwares || []
  const defectRecords = sub.defectRecords || []
  const processRecords = sub.processRecords || []
  const problemNotes = sub.problemNotes || []
  const shippingRecords = sub.shippingRecords || []
  const docConfirmations = sub.docConfirmations || []

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id))
  }

  const sectionProps = (id) => ({
    sectionId: id,
    open: openSection === id,
    onOpenChange: () => toggleSection(id),
  })

  const chipSubtitle = chipFirmwares.length
    ? chipFirmwares
        .map((fw, i) => [fw.name, fw.program].filter(Boolean).join(' ') || `芯片${i + 1}`)
        .join(' · ')
    : '未填写'

  return (
    <div className="space-y-4">
      <PageBreadcrumb
        items={[
          { label: '首页', to: getDashboardHomePath() },
          { label: order.name, to: `/order/${orderId}` },
          { label: sub.name },
        ]}
      />

      <div className="card">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-800">{sub.name}</h2>
          <OrderTypeBadge type={order.orderType} />
        </div>
        <p className="text-sm text-slate-500 mt-1">所属订单：{order.name}</p>
      </div>

      <CollapsibleSection
        title="基本信息"
        subtitle={`${sub.name} · ${sub.quantity ?? '数量未填'}`}
        {...sectionProps('basic')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div>
            <label className="label-text">子项目名称</label>
            <input className="input-field" value={sub.name} onChange={(e) => patch({ name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">子项目数量（个，可选）</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={sub.quantity ?? ''}
              onChange={(e) =>
                patch({ quantity: e.target.value === '' ? null : Number(e.target.value) })
              }
              placeholder="可不填"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="芯片固件" subtitle={chipSubtitle} {...sectionProps('chip')}>
        <ChipFirmwareSection
          items={chipFirmwares}
          onChange={(chipFirmwares) => patch({ chipFirmwares })}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="物料状态"
        subtitle={getMaterialSubtitle(materialStatus)}
        {...sectionProps('material')}
      >
        <div className="pt-4">
          <MaterialTable
            materialStatus={materialStatus}
            onChange={(materialStatus) => patch({ materialStatus })}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="资料确认"
        subtitle={`${docConfirmations.filter((d) => d.status === '已确认').length}/${docConfirmations.length} 已确认`}
        {...sectionProps('doc')}
      >
        <div className="pt-4">
          <DocConfirmationSection
            items={docConfirmations}
            onChange={(docConfirmations) => patch({ docConfirmations })}
            onAdd={(doc) => patch({ docConfirmations: [...docConfirmations, doc] })}
            onRemove={(id) =>
              patch({ docConfirmations: docConfirmations.filter((d) => d.id !== id) })
            }
          />
        </div>
      </CollapsibleSection>

      {!samplePassed ? (
        <div className="card bg-amber-50 border-amber-200 text-amber-800 text-sm">
          订单贴样结果为「通过」后，方可编辑
          {isLargeOrder(order) ? '工序、' : ''}
          出货不良统计、问题备注和出货情况。
        </div>
      ) : (
        <>
          {isLargeOrder(order) && (
            <CollapsibleSection
              title="生产工序记录"
              subtitle={`贴片 ${getSubProjectCumulative(sub)} · 测试 ${getSubProjectTestCumulative(sub)}（工厂测试）`}
              {...sectionProps('process')}
            >
              <div className="pt-4">
                <ProcessRecordsTable
                  records={processRecords}
                  onChange={(processRecords) => patch({ processRecords })}
                />
              </div>
            </CollapsibleSection>
          )}

          <CollapsibleSection
            title="问题备注"
            subtitle={`${problemNotes.length} 条`}
            {...sectionProps('problem')}
          >
            <div className="pt-4">
              <ProblemNotesTable
                notes={problemNotes}
                onChange={(problemNotes) => patch({ problemNotes })}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="出货情况"
            subtitle={`已出货 ${getSubProjectShipped(sub)} 个`}
            {...sectionProps('shipping')}
          >
            <div className="pt-4">
              <ShippingTable
                records={shippingRecords}
                onChange={(shippingRecords) => patch({ shippingRecords })}
                subProject={sub}
                smallOrder={!isLargeOrder(order)}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="出货不良统计"
            subtitle={`合计 ${getSubProjectDefects(sub)} 个`}
            {...sectionProps('defect')}
          >
            <div className="pt-4">
              <DefectStatsTable
                records={defectRecords}
                onChange={(defectRecords) => patch({ defectRecords })}
              />
            </div>
          </CollapsibleSection>

          <div className="card">
            <h3 className="text-base font-semibold text-slate-800 mb-4">统计汇总（自动）</h3>
            <div className={`grid grid-cols-2 gap-4 ${isLargeOrder(order) ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
              <Stat label="已出货" value={`${getSubProjectShipped(sub)} 个`} />
              {!isLargeOrder(order) && (
                <Stat label="已贴回" value={`${getSubProjectReturned(sub)} 个`} />
              )}
              {isLargeOrder(order) && (
                <>
                  <Stat label="累计贴片" value={`${getSubProjectCumulative(sub)} 个`} />
                  <Stat label="累计测试" value={`${getSubProjectTestCumulative(sub)} 个`} />
                </>
              )}
              <Stat label="不良合计" value={`${getSubProjectDefects(sub)} 个`} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  )
}
