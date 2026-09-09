'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = {
  name: string
  id?: string | null
  created_at?: string
  metadata?: any
}

export default function MediaManager() {
  const supabase = useMemo(() => createClient(), [])
  const [items, setItems] = useState<Item[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data, error } = await supabase.storage
      .from('media')
      .list('', {
        limit: 100,
        sortBy: {
          column: 'created_at',
          order: 'desc',
        },
      })

    if (error) {
      setMsg(error.message)
    } else {
      setItems(data || [])
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    setBusy(true)
    setMsg('')

    const safe = `${Date.now()}-${f.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '-'
    )}`

    const { error } = await supabase.storage
      .from('media')
      .upload(safe, f, { upsert: false })

    setBusy(false)

    if (error) {
      setMsg(error.message)
    } else {
      setMsg('✅ File uploaded. Click Copy URL to use it on a page.')
      load()
    }
  }

  function url(name: string) {
    return supabase.storage.from('media').getPublicUrl(name).data.publicUrl
  }

  async function copy(name: string) {
    await navigator.clipboard.writeText(url(name))
    setMsg('✅ Public URL copied.')
  }

  async function remove(name: string) {
    if (!confirm('Delete this uploaded file permanently?')) return

    const { error } = await supabase.storage
      .from('media')
      .remove([name])

    if (error) {
      setMsg(error.message)
    } else {
      load()
    }
  }

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Upload files</h2>
            <p>
              Images, PDFs and other teaching files. For large HTML5 games,
              keep using a hosted game URL.
            </p>
          </div>

          <label className="btn upload-btn">
            {busy ? 'Uploading…' : '＋ Upload file'}
            <input
              type="file"
              onChange={upload}
              disabled={busy}
            />
          </label>
        </div>

        {msg && <p className="notice success">{msg}</p>}
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>Your files</h2>

        <div className="media-grid">
          {items.map((i) => (
            <div className="media-card" key={i.name}>
              <div className="media-preview">
                {/\.(png|jpg|jpeg|gif|webp)$/i.test(i.name) ? (
                  <img src={url(i.name)} alt="" />
                ) : (
                  <span>📄</span>
                )}
              </div>

              <b title={i.name}>{i.name}</b>

              <div className="toolbar">
                <button
                  className="btn small secondary"
                  onClick={() => copy(i.name)}
                >
                  Copy URL
                </button>

                <a
                  className="btn small secondary"
                  href={url(i.name)}
                  target="_blank"
                >
                  Open
                </a>

                <button
                  className="icon-btn danger-lite"
                  onClick={() => remove(i.name)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && <p>No files uploaded yet.</p>}
      </section>
    </div>
  )
}
