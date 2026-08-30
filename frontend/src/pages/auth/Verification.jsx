import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Verification() {
  return (
    <PagePlaceholder
      area="Auth & Onboarding"
      title="Verify your college ID"
      description="OTP / email-link confirmation goes here. New users only — existing users never see this screen."
      bullets={[
        '6-digit code input',
        'Resend code link',
        'Fallback: manual ID upload for review',
      ]}
      actions={[{ to: '/onboarding/profile', label: 'Verify → Profile & Skills Setup' }]}
    />
  )
}
