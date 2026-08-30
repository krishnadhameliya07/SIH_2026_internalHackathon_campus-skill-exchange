import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function ProfileSkillsSetup() {
  return (
    <PagePlaceholder
      area="Auth & Onboarding"
      title="Profile & Skills Setup"
      description="Combined form — basic info, skills/interests, and optional resume/portfolio upload all on one screen. Deliberately trimmed from the PDF's 3 separate steps to keep onboarding demoable in minutes."
      bullets={[
        'Name, department, year, bio, availability',
        'Skills & interests (tag input)',
        'Optional: resume / GitHub / portfolio / certificates upload',
      ]}
      actions={[{ to: '/onboarding/confirm', label: 'Continue → AI Confirm' }]}
    />
  )
}
