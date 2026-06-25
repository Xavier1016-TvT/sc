import CollapsibleSection from './CollapsibleSection'
import MaterialTable from './MaterialTable'
import { getMaterialSubtitle } from '../utils/materialAggregate'

export default function OrderMaterialSection({
  materialPrep,
  onChange,
  hasSubProjects = false,
  subProjects = [],
  orderId,
  sectionId = 'material',
  open,
  onOpenChange,
}) {
  const prep = materialPrep || { option: '备料中', note: '', file: null, items: [] }

  return (
    <CollapsibleSection
      title={hasSubProjects ? '物料状态（总览）' : '物料状态'}
      subtitle={getMaterialSubtitle(prep, { isSummary: hasSubProjects })}
      sectionId={sectionId}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="pt-4">
        <MaterialTable
          materialStatus={prep}
          onChange={onChange}
          variant={hasSubProjects ? 'summary' : 'edit'}
          readOnly={hasSubProjects}
          subProjects={hasSubProjects ? subProjects : []}
          orderId={orderId}
        />
      </div>
    </CollapsibleSection>
  )
}
