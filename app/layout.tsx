import './globals.css'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { defaultBranding, demoSections, hasSupabaseEnv } from '@/lib/config'

export const metadata={title:'Pawn to Professor',description:'EFL lessons, games and teaching resources'}

export default async function RootLayout({children}:{children:React.ReactNode}){
  let branding:any=defaultBranding
  let sections:any[]=demoSections
  if(hasSupabaseEnv()){
    try{
      const supabase=await createClient()
      const [{data:brow},{data:srows}]=await Promise.all([
        supabase.from('site_settings').select('value').eq('key','branding').maybeSingle(),
        supabase.from('sections').select('id,title,slug,position').is('parent_id',null).eq('visible',true).is('deleted_at',null).order('position')
      ])
      branding=brow?.value || defaultBranding
      if(srows?.length) sections=srows
    }catch{}
  }
  return <html lang="en"><body>
    <header className="topbar"><div className="wrap nav">
      <Link className="brand" href="/"><span className="brandmark">{branding.logoText||'♟️'}</span><span><b>{branding.siteName||'Pawn to Professor'}</b><small>{branding.tagline||''}</small></span></Link>
      <nav className="navlinks"><Link href="/">Home</Link>{sections.slice(0,6).map(s=><Link href={`/library/${s.slug}`} key={s.id}>{s.title}</Link>)}</nav>
      <Link className="admin-link" href="/admin">Admin</Link>
    </div></header>
    {children}
    <footer className="footer"><div className="wrap footer-inner"><div><strong>{branding.siteName||'Pawn to Professor'}</strong><div>{branding.tagline||'Teaching resources made simple.'}</div></div><div>Made for teachers • Easy to manage from your browser</div></div></footer>
  </body></html>
}
