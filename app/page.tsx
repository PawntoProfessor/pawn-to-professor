import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { defaultHomepage, demoPages, demoSections, hasSupabaseEnv } from '@/lib/config'

const icons:Record<string,string>={lessons:'📚',games:'🎮',flashcards:'🃏',worksheets:'📝',chess:'♟️',materials:'📁'}
export default async function Home(){
  let homepage:any=defaultHomepage
  let sections:any[]=demoSections
  let pages:any[]=demoPages
  if(hasSupabaseEnv()){
    try{
      const supabase=await createClient()
      const [{data:hrow},{data:srows},{data:prows}]=await Promise.all([
        supabase.from('site_settings').select('value').eq('key','homepage').maybeSingle(),
        supabase.from('sections').select('*').is('parent_id',null).eq('visible',true).is('deleted_at',null).order('position'),
        supabase.from('pages').select('id,title,slug,summary,page_type,thumbnail_url,section_id,grade').eq('published',true).is('deleted_at',null).order('created_at',{ascending:false}).limit(6)
      ])
      homepage=hrow?.value||defaultHomepage
      if(srows?.length) sections=srows
      if(prows?.length) pages=prows
    }catch{}
  }
  return <main>
    <section className="home-hero"><div className="wrap hero-inner"><div><span className="eyebrow">PAWN TO PROFESSOR</span><h1>{homepage.heroTitle}</h1><p>{homepage.heroText}</p><div className="hero-actions"><Link className="btn" href="/library/lessons">Explore resources</Link><Link className="btn secondary" href="/admin">Manage website</Link></div></div><div className="hero-art"><div className="hero-piece">♟️</div><div className="hero-bubble">Teach<br/>Play<br/>Inspire</div></div></div></section>
    <div className="wrap home-content">
      <section><div className="section-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Everything in one place</h2></div><p>Add, rename, move or hide these sections from Site Manager.</p></div><div className="feature-grid">{sections.map(s=><Link className={`feature-card ${s.slug}`} href={`/library/${s.slug}`} key={s.id}><div className="feature-icon">{icons[s.slug]||'📁'}</div><div><h3>{s.title}</h3><p>{s.description||'Open this section.'}</p></div><span className="round-arrow">→</span></Link>)}</div></section>
      <section className="recent"><div className="section-heading"><div><span className="eyebrow">RECENTLY ADDED</span><h2>Latest teaching resources</h2></div></div><div className="resource-grid">{pages.map(p=><Link className="resource-card" href={`/p/${p.slug}`} key={p.id}><div className="resource-thumb">{p.thumbnail_url?<img src={p.thumbnail_url} alt=""/>:<span>{p.page_type==='game'?'🎮':p.page_type==='flashcards'?'🃏':p.page_type==='worksheet'?'📝':'📘'}</span>}</div><div className="resource-body"><span className="pill">{p.page_type}</span><h3>{p.title}</h3><p>{p.summary}</p>{p.grade&&<small>Grade {p.grade}</small>}</div></Link>)}</div></section>
      <section className="admin-callout"><div><span className="eyebrow">NO CODING NEEDED</span><h2>You control the website from the website.</h2><p>Create sections, add pages and games, change the header, hide old material, restore items from Trash, and upload media from your Admin area.</p></div><Link className="btn" href="/admin">Open Site Manager</Link></section>
    </div>
  </main>
}
