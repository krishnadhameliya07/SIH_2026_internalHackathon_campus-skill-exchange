import { useParams } from 'react-router-dom'
import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function RequirementsConfirmation() {
  const { projectId } = useParams()

  return (
    <PagePlaceholder
      area="Project Team Builder"
      title="Confirm required capabilities"
      description="AI-extracted roles for this project — review and edit before matching runs."
      bullets={['ML', 'Backend', 'Frontend', 'UI/UX', 'Data', 'Presentation']}
      actions={[{ to: `/team-builder/${projectId}/team`, label: 'Confirm → Recommended Team' }]}
    />
  )
}
