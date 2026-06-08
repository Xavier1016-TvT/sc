import CollapsibleSection from './CollapsibleSection'
import MaterialTable from './MaterialTable'
import { getMaterialSubtitle } from '../utils/materialAggregate'

export default function OrderMaterialSection({ materialPrep, onChange, hasSubProjects = false }) {
  const prep = materialPrep || { option: '备料中', note: '', file: null, items: [] }

  return (
    <CollapsibleSection
      title={hasSubProjects ? '物料状态（总览）' : '物料状态'}
      subtitle={getMaterialSubtitle(prep, { isSummary: hasSubProjects })}
    >
      <div className="pt-4">
        <MaterialTable
          materialStatus={prep}
          onChange={onChange}
          variant={hasSubProjects ? 'summary' : 'edit'}
          readOnly={hasSubProjects}
        />
      </div>
    </CollapsibleSection>
  )
}
