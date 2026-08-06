// src/components/PickupTimeSelector.jsx

const PICKUP_POINTS = [
  { name: 'Peñablanca – Líder, Manuel Montt',           offset: 0   },
  { name: 'Villa Alemana – Paradero 7 (frente a la Copec)', offset: 10  },
  { name: 'Belloto – Paradero Ex La Polar',             offset: 20  },
  { name: 'Quilpué – Paradero 26',                      offset: 30  },
  { name: 'Viña del Mar – Plaza México, Paradero 1 Norte', offset: 60  },
  { name: 'Valparaíso – Costado PUCV, Av. Argentina',   offset: 80  },
  { name: 'Placilla – Pasarela Ruta 68',                offset: 90  },
  { name: 'Casablanca – Ruta 68',                       offset: 105 },
  { name: 'Curacaví – Ruta 68',                         offset: 120 },
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
  // Extraer la hora base de Peñablanca del pickup_info actual
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

      {/* Preview de todos los puntos */}
      <div className="pickup-selector__preview">
        {points.map((p, i) => (
          <div
            key={i}
            className={`pickup-selector__point ${i === 0 ? 'pickup-selector__point--base' : ''}`}
          >
            <span className="pickup-selector__time">{p.time}</span>
            <span className="pickup-selector__name">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Exportar también la función para usar en otros lados
export { buildPickupInfo, PICKUP_POINTS }