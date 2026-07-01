'use client'

import BrandLoader from '@/components/ui/BrandLoader'
import { useSession } from '@/components/providers'
import { useVolunteerProfile } from '@/hooks/useHelp'
import { useMyAppointments } from '@/hooks/useAppointments'
import DentistRegisterForm from '@/components/dentist/DentistRegisterForm'
import DentistCallBoard from '@/components/dentist/DentistCallBoard'
import DentistAvailabilityToggle from '@/components/dentist/DentistAvailabilityToggle'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

const DentistHelpPage = () => {
  const { role } = useSession()
  const isAdmin = role === 'admin'
  const { data: profile, isLoading: profileLoading } = useVolunteerProfile()
  const { data: appts = [], isLoading } = useMyAppointments()

  useSetPageHeader({
    title: 'Эмчийн самбар',
    subtitle: isAdmin
      ? 'Бүх эмчийн дуудлагын самбар (зөвхөн харах).'
      : 'Зөвхөн яаралтай эмчилгээ шаардлагатай дүгнэлт гарсан сурагчид дуудлага хийх боломжтой.',
    actions: isAdmin ? undefined : <DentistAvailabilityToggle />,
  })

  if (profileLoading) return <BrandLoader className="py-20" />
  // Admins have no volunteer profile — they view every dentist's calls read-only.
  if (!profile && !isAdmin) return <DentistRegisterForm />

  return (
    <section className="page-in-wrap">
      {isLoading ? <BrandLoader className="py-20" /> : <DentistCallBoard appts={appts} readOnly={isAdmin} />}
    </section>
  )
}

export default DentistHelpPage
