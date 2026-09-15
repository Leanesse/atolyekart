// Rıza onay satırı — satıra (checkbox'a) tıklamak metin pop-up'ını açar.
// Onay yalnızca pop-up'taki "Kabul Ediyorum" ile set edilir (scroll zorunlu).
export default function ConsentCheck({ checked, onOpen, error, children }) {
  return (
    <div className="field field-consent">
      <label className="consent">
        <input
          type="checkbox"
          checked={checked}
          readOnly
          onClick={e => { e.preventDefault(); onOpen() }}
        />
        <span>
          {children}{' '}
          <button type="button" className="link-btn" onClick={onOpen}>
            Aydınlatma Metni'ni oku →
          </button>
        </span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
