import { useRef, useState } from 'react'
import Button from './ui/Button.jsx'
import { MAX_PHOTO_BYTES, MAX_PHOTO_MB } from '../lib/config.js'

/**
 * One photo, JPG or PNG, max 2 MB (FR-10).
 * Before we keep it we shrink it to 900px wide, because a full phone photo
 * does not fit in the browser's small storage and does not need to.
 */
async function shrink(file) {
  const bitmap = await createImageBitmap(file)
  const maxWidth = 900
  const scale = Math.min(1, maxWidth / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.8)
}

export default function PhotoUploader({ value, onChange, error }) {
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')
  const [busy, setBusy] = useState(false)

  const pick = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setLocalError('Choose a JPG or PNG image.')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setLocalError(`That photo is larger than ${MAX_PHOTO_MB} MB.`)
      return
    }

    setLocalError('')
    setBusy(true)
    try {
      onChange(await shrink(file))
    } catch {
      setLocalError('That photo could not be read. Try a different file.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="field">
      <span className="label">Photo</span>
      <div className="uploader">
        <div className="upload-preview">
          {value ? <img src={value} alt="The photo you chose" /> : <span>No photo</span>}
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <div className="row wrap">
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
              {value ? 'Replace photo' : 'Choose photo'}
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
                Remove
              </Button>
            ) : null}
          </div>
          <p className="hint">
            JPG or PNG, up to {MAX_PHOTO_MB} MB. One photo per item.
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={pick}
        aria-label="Choose a photo"
      />
      {localError || error ? <p className="err">{localError || error}</p> : null}
    </div>
  )
}
