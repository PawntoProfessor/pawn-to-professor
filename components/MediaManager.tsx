'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = {
  name: string
  id?: string
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
      setItems(
        (data || []).map((file) => ({
          name: file.name,
          id: file.id ?? undefined,
          created_at: file.created_at,
          metadata: file.metadata,
        }))
      )
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
      .upload(safe, f, {
        upsert: false,
      })

    setBusy(false)

    if (error) {
      setMsg(error.message)
    } else {
      setMsg('✅ File uploaded. Click Copy URL to use it on a page.')
      await load()
    }

    e.target.value = ''
  }

  function url(name: string) {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(name)

    return data.publicUrl
  }

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(url(name))
      setMsg('✅ Public URL copied.')
    } catch {
      setMsg('Could not copy the URL automatically.')
    }
  }

  async function remove(name: string) {
    const confirmed = window.confirm(
      'Delete this uploaded file permanently?'
    )

    if (!confirmed) return

    const { error } = await supabase.storage
      .from('media')
      .remove([name])

    if (error) {
      setMsg(error.message)
    } else {
      setMsg('✅ File deleted.')
      await load()
    }
  }

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Upload files</h2>

            <p>
              Images, PDFs and other teaching files.
              For large HTML5 games, keep using a hosted game URL.
            </p>
          </div>

          <label className="btn upload-btn">
            {busy ? 'Uploading…' : '＋ Upload file'}

            <input
              type="file"
              onChange={upload}
              disabled={busy}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {msg && (
          <p className="notice success">
            {msg}
          </p>
        )}
      </section>

      <section
        className="panel"
        style={{ marginTop: 18 }}
      >
        <h2>Your files</h2>

        <div className="media-grid">
          {items.map((item) => (
            <div
              className="media-card"
              key={item.id ?? item.name}
            >
              <div className="media-preview">
                {/\.(png|jpg|jpeg|gif|webp)$/i.test(item.name) ? (
                  <img
                    src={url(item.name)}
                    alt={item.name}
                  />
                ) : (
                  <span>📄</span>
                )}
              </div>

              <b title={item.name}>
                {item.name}
              </b>

              <div className="toolbar">
                <button
                  type="button"
                  className="btn small secondary"
                  onClick={() => copy(item.name)}
                >
                  Copy URL
                </button>

                <a
                  className="btn small secondary"
                  href={url(item.name)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>

                <button
                  type="button"
                  className="icon-btn danger-lite"
                  onClick={() => remove(item.name)}
                  title="Delete file"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p>No files uploaded yet.</p>
        )}
      </section>
    </div>
  )
}
