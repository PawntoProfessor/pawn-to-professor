'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MediaManager() {
  const supabase = useMemo(() => createClient(), [])

  // Use Supabase's returned objects directly.
  // This avoids the FileObject / id:null TypeScript conflict.
  const [items, setItems] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setMsg('')

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
      console.error('Media load error:', error)
      setMsg(`❌ ${error.message}`)
      setItems([])
      return
    }

    setItems(data ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  async function upload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setBusy(true)
    setMsg('')

    try {
      const safeFileName = `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '-'
      )}`

      const { error } = await supabase.storage
        .from('media')
        .upload(safeFileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        setMsg(`❌ ${error.message}`)
        return
      }

      setMsg(
        '✅ File uploaded successfully. You can now copy its public URL.'
      )

      await load()
    } catch (error) {
      console.error(error)
      setMsg('❌ An unexpected upload error occurred.')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  function getPublicUrl(name: string) {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(name)

    return data.publicUrl
  }

  async function copyUrl(name: string) {
    const publicUrl = getPublicUrl(name)

    try {
      await navigator.clipboard.writeText(publicUrl)
      setMsg('✅ Public URL copied.')
    } catch (error) {
      console.error(error)
      setMsg(
        `Copy this URL manually: ${publicUrl}`
      )
    }
  }

  async function deleteFile(name: string) {
    const confirmed = window.confirm(
      `Delete "${name}" permanently?`
    )

    if (!confirmed) {
      return
    }

    setMsg('')

    const { error } = await supabase.storage
      .from('media')
      .remove([name])

    if (error) {
      console.error('Delete error:', error)
      setMsg(`❌ ${error.message}`)
      return
    }

    setMsg('✅ File deleted.')
    await load()
  }

  function isImage(name: string) {
    return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name)
  }

  function fileIcon(name: string) {
    if (/\.pdf$/i.test(name)) {
      return '📕'
    }

    if (/\.zip$/i.test(name)) {
      return '📦'
    }

    if (/\.(mp3|wav|ogg)$/i.test(name)) {
      return '🎵'
    }

    if (/\.(mp4|mov|webm)$/i.test(name)) {
      return '🎬'
    }

    return '📄'
  }

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Media Library</h2>

            <p>
              Upload images, PDFs and other teaching
              resources.
            </p>

            <p>
              For HTML5 games, you can continue using
              a hosted game URL.
            </p>
          </div>

          <label
            className="btn upload-btn"
            style={{
              cursor: busy
                ? 'not-allowed'
                : 'pointer',
            }}
          >
            {busy
              ? 'Uploading…'
              : '＋ Upload File'}

            <input
              type="file"
              onChange={upload}
              disabled={busy}
              style={{
                display: 'none',
              }}
            />
          </label>
        </div>

        {msg && (
          <div
            className="notice"
            style={{
              marginTop: 16,
            }}
          >
            {msg}
          </div>
        )}
      </section>

      <section
        className="panel"
        style={{
          marginTop: 18,
        }}
      >
        <div className="panel-head">
          <div>
            <h2>Your Files</h2>

            <p>
              {items.length}{' '}
              {items.length === 1
                ? 'file'
                : 'files'}
            </p>
          </div>

          <button
            type="button"
            className="btn secondary"
            onClick={() => void load()}
          >
            ↻ Refresh
          </button>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 48,
                marginBottom: 12,
              }}
            >
              📁
            </div>

            <h3>No files uploaded yet</h3>

            <p>
              Click “Upload File” to add your first
              image, worksheet or PDF.
            </p>
          </div>
        ) : (
          <div className="media-grid">
            {items.map((item) => {
              const name =
                typeof item?.name === 'string'
                  ? item.name
                  : 'Unnamed file'

              const publicUrl =
                getPublicUrl(name)

              const key =
                item?.id ??
                `${name}-${item?.created_at ?? ''}`

              return (
                <div
                  className="media-card"
                  key={key}
                >
                  <div className="media-preview">
                    {isImage(name) ? (
                      <img
                        src={publicUrl}
                        alt={name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 48,
                        }}
                      >
                        {fileIcon(name)}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                    }}
                  >
                    <b
                      title={name}
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </b>
                  </div>

                  <div
                    className="toolbar"
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      className="btn small secondary"
                      onClick={() =>
                        void copyUrl(name)
                      }
                    >
                      📋 Copy URL
                    </button>

                    <a
                      className="btn small secondary"
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ↗ Open
                    </a>

                    <button
                      type="button"
                      className="icon-btn danger-lite"
                      onClick={() =>
                        void deleteFile(name)
                      }
                      title="Delete file"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
