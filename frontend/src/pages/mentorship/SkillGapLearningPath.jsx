import { useParams } from 'react-router-dom'
import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function SkillGapLearningPath() {
  const { id } = useParams()

  return (
    <PagePlaceholder
      area="Mentorship / Learning"
      title="Your skill gap & learning path"
      description="Compares the learning goal against your current skill profile — no equivalent screen anywhere else in the app."
      bullets={[
        'Current level: no prior Figma experience',
        'Suggested path: Basics → Components → Prototyping',
        'Estimated peer-mentoring time: ~4 sessions',
      ]}
      actions={[{ to: `/mentorship/${id}/recommendations`, label: 'Continue → Mentor Recommendations' }]}
    />
  )
}
