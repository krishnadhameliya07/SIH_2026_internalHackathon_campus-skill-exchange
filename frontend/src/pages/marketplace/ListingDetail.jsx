import { useParams } from 'react-router-dom'
import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function ListingDetail() {
  const { id } = useParams()

  return (
    <PagePlaceholder
      area="Marketplace"
      title={`Listing #${id}`}
      description="Full post content — a task or offer, not a person. Posted by a student whose name links to their Public Profile View."
      bullets={[
        'Full description text',
        'Skill tags, deadline/availability, credit cost',
        'Link to poster → Public Profile View',
      ]}
      actions={[
        { to: '/profile/priya', label: 'View poster profile', variant: 'ghost' },
        { to: '/marketplace/conversation/102', label: 'Send Request' },
      ]}
    />
  )
}
