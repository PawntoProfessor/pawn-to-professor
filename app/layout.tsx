import './globals.css'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/server'
import { defaultAppearance, defaultBranding, demoSections, googleFontNames, hasSupabaseEnv } from '@/lib/config'

export const metadata={title:'Pawn to Professor',description:'EFL lessons, games and teaching resources'}

function fontStack(name:string){
  const quoted = name.includes(' ') ? `"${name}"` : name
  if(name==='Georgia') return 'Georgia, serif'
  if(name==='Arial') return 'Arial, Helvetica, sans-serif'
  if(name==='Verdana') return 'Verdana, Geneva, sans-serif'
  if(name==='Trebuchet MS') return '"Trebuchet MS", Arial, sans-serif'
  return `${quoted}, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
}

function fontHref(names:string[]){
  const unique=[...new Set(names.filter(n=>googleFontNames.has(n)))]
  if(!unique.length) return null
  const families=unique.map(name=>`family=${encodeURIComponent(name).replace(/%20/g,'+')}:wght@400;500;600;700;800;900`).join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}

export default async function RootLayout({children}:{children:React.ReactNode}){
  let branding:any=defaultBranding
  let appearance:any=defaultAppearance
  let sections:any[]=demoSections
  if(hasSupabaseEnv()){
    try{
      const supabase=await createClient()
      const [{data:brow},{data:arow},{data:srows}]=await Promise.all([
        supabase.from('site_settings').select('value').eq('key','branding').maybeSingle(),
        supabase.from('site_settings').select('value').eq('key','appearance').maybeSingle(),
        supabase.from('sections').select('id,title,slug,position').is('parent_id',null).eq('visible',true).is('deleted_at',null).order('position')
      ])
      branding={...defaultBranding,...(brow?.value||{})}
      appearance={...defaultAppearance,...(arow?.value||{})}
      if(srows?.length) sections=srows
    }catch{}
  }

  const safeUrl=(value:string)=>value ? `url("${String(value).replace(/"/g,'%22')}")` : 'none'
  const shadow=appearance.shadowStrength==='none'?'none':appearance.shadowStrength==='strong'?'0 16px 44px rgba(18,58,100,.18)':'0 12px 36px rgba(18,58,100,.08)'
  const rootStyle={
    '--blue':appearance.primaryColor,
    '--navy':appearance.secondaryColor,
    '--orange':appearance.accentColor,
    '--text':appearance.textColor,
    '--muted':appearance.mutedColor,
    '--line':appearance.lineColor,
    '--bg':appearance.backgroundColor,
    '--card':appearance.cardColor,
    '--header-bg':appearance.headerBackground,
    '--footer-bg':appearance.footerBackground,
    '--hero-start':appearance.heroStartColor,
    '--hero-middle':appearance.heroMiddleColor,
    '--hero-end':appearance.heroEndColor,
    '--hero-text':appearance.heroTextColor,
    '--hero-muted':appearance.heroMutedColor,
    '--body-font':fontStack(appearance.bodyFont),
    '--heading-font':fontStack(appearance.headingFont),
    '--content-width':`${Math.max(900,Math.min(1600,Number(appearance.contentWidth)||1240))}px`,
    '--card-radius':`${Math.max(0,Math.min(40,Number(appearance.cardRadius)||18))}px`,
    '--button-radius':`${Math.max(0,Math.min(99,Number(appearance.buttonRadius)||11))}px`,
    '--site-shadow':shadow,
    '--hero-height':`${Math.max(280,Math.min(760,Number(appearance.heroHeight)||390))}px`,
    '--hero-image':safeUrl(appearance.heroImageUrl),
    '--hero-image-position':appearance.heroImagePosition||'center center',
    '--hero-overlay-opacity':String(Math.max(0,Math.min(.85,Number(appearance.heroOverlayOpacity)||0))),
    '--site-bg-image':safeUrl(appearance.backgroundImageUrl),
    '--site-bg-position':appearance.backgroundImagePosition||'center top',
    '--site-bg-size':appearance.backgroundImageSize||'cover',
    '--site-bg-attachment':appearance.backgroundImageAttachment||'scroll',
    '--logo-size':`${Math.max(24,Math.min(100,Number(appearance.logoSize)||38))}px`,
  } as CSSProperties
  const href=fontHref([appearance.bodyFont,appearance.headingFont])
  const headerClass=`topbar ${appearance.headerStyle==='glass'?'glass':''} ${appearance.headerSticky===false?'not-sticky':''}`

  return <html lang="en"><head>{href&&<><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href={href} rel="stylesheet"/></>}</head><body style={rootStyle}>
    {appearance.customCss ? <style dangerouslySetInnerHTML={{__html:String(appearance.customCss)}}/> : null}
    <header className={headerClass}><div className="wrap nav">
      <Link className="brand" href="/">
        {appearance.logoImageUrl?<img className="brand-image" src={appearance.logoImageUrl} alt=""/>:<span className="brandmark">{branding.logoText||'♟️'}</span>}
        <span><b>{branding.siteName||'Pawn to Professor'}</b><small>{branding.tagline||''}</small></span>
      </Link>
      <nav className="navlinks"><Link href="/">Home</Link>{sections.slice(0,6).map(s=><Link href={`/library/${s.slug}`} key={s.id}>{s.title}</Link>)}</nav>
      <Link className="admin-link" href="/admin">Admin</Link>
    </div></header>
    {children}
    <footer className="footer"><div className="wrap footer-inner"><div><strong>{branding.siteName||'Pawn to Professor'}</strong><div>{branding.tagline||'Teaching resources made simple.'}</div></div><div>{appearance.footerText||'Made for teachers • Easy to manage from your browser'}</div></div></footer>
  </body></html>
}
