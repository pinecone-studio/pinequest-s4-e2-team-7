export type Doctor = {
  id: string
  name: string
  specialty: string
  clinic: string
  district: string
  exp: string
  rating: number
  phone: string
}

export const DOCTORS: Doctor[] = [
  { id: '1', name: 'Б. Батболд', specialty: 'Хүүхдийн шүдний эмч', clinic: 'Smile Dental', district: 'БЗД', exp: '12 жил', rating: 4.9, phone: '77112233' },
  { id: '2', name: 'О. Оюунаа', specialty: 'Ортодонт', clinic: 'Kids Teeth UB', district: 'СБД', exp: '8 жил', rating: 4.8, phone: '77114455' },
  { id: '3', name: 'Ц. Цэрэн', specialty: 'Хүүхдийн шүдний эмч', clinic: 'Family Dental', district: 'ХУД', exp: '15 жил', rating: 4.7, phone: '77116677' },
  { id: '4', name: 'Д. Долгор', specialty: 'Хүүхдийн шүдний эмч', clinic: 'Monnis Dental', district: 'СБД', exp: '6 жил', rating: 4.6, phone: '70101234' },
  { id: '5', name: 'Н. Нарантуяа', specialty: 'Имплант мэргэжилтэн', clinic: 'Nomad Dental', district: 'БГД', exp: '10 жил', rating: 4.8, phone: '77118899' },
]

export const getDoctor = (id: string | undefined | null): Doctor | undefined =>
  DOCTORS.find((d) => d.id === id)
