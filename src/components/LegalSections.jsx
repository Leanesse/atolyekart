// Hukuki metin bölümlerini ortak biçimde çizer (#gizlilik sayfası + rıza pop-up'ı aynı kaynaktan).
export default function LegalSections({ sections, tag = 'h2' }) {
  const Heading = tag
  return (
    <>
      {sections.map(sec => (
        <div className="legal-sec" key={sec.h}>
          <Heading>{sec.h}</Heading>
          {(sec.p ?? []).map((t, i) => <p key={i}>{t}</p>)}
          {sec.li && <ul>{sec.li.map((t, i) => <li key={i}>{t}</li>)}</ul>}
        </div>
      ))}
    </>
  )
}
