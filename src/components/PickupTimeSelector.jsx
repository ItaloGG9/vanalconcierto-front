// src/components/PickupTimeSelector.jsx

const PICKUP_POINTS = [
  { name: 'Peñablanca – Líder, Manuel Montt',              offset: 0,   maps: 'https://maps.app.goo.gl/S643cRFympB2YDJy7' },
  { name: 'Villa Alemana – Paradero 7 (frente a la Copec)', offset: 10,  maps: 'https://maps.app.goo.gl/wyBMXSw92mhL2MhSA' },
  { name: 'Belloto – Paradero Ex La Polar',                 offset: 20,  maps: 'https://maps.app.goo.gl/zXuxPPUvtP3QiFpV9' },
  { name: 'Quilpué – Paradero 26',                          offset: 30,  maps: 'https://maps.app.goo.gl/tHxGgBCdcJj2c4PY8' },
  { name: 'Viña del Mar – Plaza México, Paradero 1 Norte',  offset: 60,  maps: 'https://maps.app.goo.gl/XYZdz2RaAJMaKfZu7' },
  { name: 'Valparaíso – Costado PUCV, Av. Argentina',       offset: 80,  maps: 'https://maps.app.goo.gl/aFBMZ4nZ47gEo3258' },
  { name: 'Placilla – Pasarela Ruta 68',                    offset: 90,  maps: 'https://maps.app.goo.gl/YxoidquCzEeLHmjL9' },
  { name: 'Casablanca – Ruta 68',                           offset: 105, maps: 'https://maps.app.goo.gl/RgSS3x7hZDFihg2L7' },
  { name: 'Curacaví – Ruta 68',                             offset: 120, maps: 'https://maps.app.goo.gl/SBUnGvhce6N4AoYd9' },
]

function addMinutes(timeStr, minutes) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function buildPickupInfo(baseTime) {
  if (!baseTime) return ''
  return PICKUP_POINTS
    .map(p => `⏰ ${addMinutes(baseTime, p.offset)} | ${p.name}`)
    .join('\n')
}

export default function PickupTimeSelector({ value, onChange }) {
  const extractBaseTime = (pickupInfo) => {
    if (!pickupInfo) return ''
    const firstLine = pickupInfo.split('\n')[0]
    const match = firstLine.match(/⏰\s*(\d{2}:\d{2})/)
    return match ? match[1] : ''
  }

  const baseTime = extractBaseTime(value)

  const handleTimeChange = (e) => {
    const newTime = e.target.value
    const newPickupInfo = buildPickupInfo(newTime)
    onChange(newPickupInfo)
  }

  const points = PICKUP_POINTS.map(p => ({
    ...p,
    time: baseTime ? addMinutes(baseTime, p.offset) : '--:--'
  }))

  return (
    <div className="pickup-selector">
      <div className="pickup-selector__base">
        <label className="pickup-selector__label">
          ⏰ Hora de salida desde Peñablanca
        </label>
        <input
          type="time"
          className="pickup-selector__input"
          value={baseTime}
          onChange={handleTimeChange}
        />
        {baseTime && (
          <span className="pickup-selector__hint">
            Los demás puntos se calculan automáticamente
          </span>
        )}
      </div>

      <div className="pickup-selector__preview">
        {points.map((p, i) => (
          <div key={i} className={`pickup-selector__point ${i === 0 ? 'pickup-selector__point--base' : ''}`}>
            <span className="pickup-selector__time">{p.time}</span>
            <span className="pickup-selector__name">{p.name}</span>
            <a
              href={p.maps}
              target="_blank"
              rel="noreferrer"
              className="pickup-selector__maps-btn"
              title="Ver en Maps"
            >
              📍
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export { buildPickupInfo, PICKUP_POINTS }