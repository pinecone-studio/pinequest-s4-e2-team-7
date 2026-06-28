export const NAV = [
  { label: 'Танилцуулга', href: '#hero' },
  { label: 'Баг', href: '#team' },
  { label: 'Асуудал', href: '#problem' },
  { label: 'Шийдэл', href: '#solution' },
  { label: 'Систем', href: '#features' },
]

export const TEAM = [
  {
    name: 'Норовсүрэн',
    role: 'Full-stack developer',
    initials: 'БЭ',
    focus: 'Веб самбар, Next.js',
    img: '/images/team1.JPG',
  },
  {
    name: 'Ганхөлөг',
    role: 'Full-stack developer',
    initials: 'ГМ',
    img: '/images/team2.JPG',
    focus: 'AI модель, YOLOv8',
  },
  {
    name: 'Чингүүн',
    role: 'Full-stack developer',
    initials: 'ДТ',
    img: '/images/team3.JPG',
    focus: 'Гар утасны апп, Expo',
  },
  {
    name: 'Ариунзул',
    role: 'Full-stack developer',
    initials: 'НС',
    img: '/images/team4.JPG',
    focus: 'Сервер, Cloudflare',
  },
  {
    name: 'Мөнхжин',
    role: 'Full-stack developer',
    initials: 'ОБ',
    img: '/images/team5.png',
    focus: 'Sync, оффлайн-first',
  },
]

export const PROBLEMS = [
  { stat: '70%', label: 'хүүхдийн шүд цоорсон', note: '6 настай Монгол хүүхдүүдийн дунд (НЭМҮТ)' },
  {
    stat: '1 / 10,000',
    label: 'сумын түвшинд шүдний эмч',
    note: 'Алслагдсан суманд эмчийн хүртээмж туйлын бага',
  },
  { stat: '300+ км', label: 'ойрын эмч хүртэлх зам', note: 'Олон айл нийслэл хүртэл явдаг' },
  {
    stat: '0',
    label: 'найдвартай triage хэрэгсэл',
    note: 'Эмч бус хүн ашиглах боломжтой багаж байхгүй',
  },
]

export const FEATURES = [
  {
    tag: '01',
    title: 'Веб самбар',
    body: 'Эмч, сумын эрүүл мэндийн ажилтан скрининг үр дүнг хянах, тэргүүлэх дарааллаар эрэмбэлэх, дагаж ажиллах удирдлагын самбар.',
  },
  {
    tag: '02',
    title: 'Гар утасны апп',
    body: 'Оффлайн-first камер апп — дээд, доод эрүүний зургийг авч, шууд төхөөрөмж дотроо AI triage хийнэ. Сүлжээ орсон үед автомат sync болно.',
  },
  {
    tag: '03',
    title: 'Сервер',
    body: 'Cloudflare Workers + D1 дээр ажиллах нимгэн sync сервис: скрининг событийг хүлээн авч, нэгтгэлийг гаргаж, дагаж ажиллах статусыг дамжуулна.',
  },
  {
    tag: '04',
    title: 'AI модель',
    body: 'YOLOv8 сургасан модель хүүхдийн шүдний зургаас цоорол, ёзоор, хагарлыг таньж, triage оноо тооцоолно. Сервер болон ONNX дэвшилтэт хэлбэрт хоёуланд нийтэнэ.',
  },
]

export const TRIAGE = [
  {
    color: '#4CAF50',
    emoji: '🟢',
    label: 'Ногоон',
    title: 'Эрсдэл бага',
    body: 'Тогтмол эрүүл ахуй, 6 сар тутамд хяналт.',
  },
  {
    color: '#F5A623',
    emoji: '🟡',
    label: 'Шар',
    title: 'Анхаарал хандуул',
    body: 'Эмчид үзүүлэх төлөвлөгөө гарга. 2-4 долоо хоногт зөвлөгөө ав.',
  },
  {
    color: '#E5484D',
    emoji: '🔴',
    label: 'Улаан',
    title: 'Яаралтай',
    body: 'Telemed-ээр шүдний эмчтэй шууд холбогдож, чиглэл авна.',
  },
]
