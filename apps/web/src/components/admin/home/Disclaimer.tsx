// Safety non-negotiable (CLAUDE.md): screening-and-triage, NOT diagnosis.
// Green = "no danger signs seen in these photos", never "no cavities".
const Disclaimer = () => (
  <p className="px-2 pb-2 text-center text-[11.5px] leading-relaxed text-text-muted">
    <span className="font-semibold text-text-base">Энэхүү апп нь хүүхдийн амны хөндийн байдлыг асуумж ба зурагт үндэслэн дүгнэлт хийх ба өвчний оношийг баталгаажуулахгүй.</span>{' '}
   Хүндрэл ба эрсдлээс бүрэн урьдчилан сэргийлж цаг тухайд тусламж эмчилгээнд чиглүүлэх зорилготой.
  </p>
)

export default Disclaimer
