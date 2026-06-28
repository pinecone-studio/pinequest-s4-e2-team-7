// The product flow as a connected node graph. Wording stays hedged per the
// screening-not-diagnosis safety rule. Positions are fractions of a 16:9 canvas.
export const ACCENT = '#F2B705'

export type FlowStep = { num: string; title: string; sub: string; fx: number; fy: number }

export const STEPS: FlowStep[] = [
  { num: '01', title: '5 асуумж', sub: 'Шүд цоорох өвчний оношлогооны асуумж', fx: 0.14, fy: 0.27 },
  { num: '02', title: 'Амны хөндийн зураг таних', sub: 'Утасны камераар зааврын зураг дарах', fx: 0.5, fy: 0.15 },
  { num: '03', title: 'AI дүгнэлт', sub: 'Зургийг танин дүгнэлт өгөх', fx: 0.86, fy: 0.28 },
  { num: '04', title: 'Гэрийн нөхцөлд хийх боломтой арга хэмжээ', sub: 'Нас, танисан зурагт үндэслэсэн зөвөлгөө өгөх', fx: 0.85, fy: 0.72 },
  { num: '05', title: 'Хамгийн ойрын шүдний эмнэлэгийг санал болгох', sub: 'Эмнэлгийн байршил, очих хугацаа, хуваарийн мэдээлэл өгөх', fx: 0.5, fy: 0.85 },
  { num: '06', title: 'Сайн дурын бүртгэлтэй эмчтэй холбох', sub: 'Яаралтай эмчилгээ шаардлагатай тохиолдолд', fx: 0.15, fy: 0.72 },
]

export type Connector = { from: number; to: number; bow: number }

// One arrow per consecutive pair; bow curves each arc (sign = which side).
export const CONNECTORS: Connector[] = [
  { from: 0, to: 1, bow: -80 },
  { from: 1, to: 2, bow: -80 },
  { from: 2, to: 3, bow: 150 },
  { from: 3, to: 4, bow: 80 },
  { from: 4, to: 5, bow: 80 },
]

export const CANVAS_W = 1600
export const CANVAS_H = 900
