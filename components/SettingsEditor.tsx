'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { defaultAppearance, defaultBranding, defaultHomepage, fontOptions } from '@/lib/config'

type Appearance = typeof defaultAppearance

const colorFields:[keyof Appearance,string][] = [
  ['primaryColor','Primary blue'],
  ['secondaryColor','Dark / navy'],
  ['accentColor','Accent'],
  ['backgroundColor','Page background'],
  ['cardColor','Cards / panels'],
  ['textColor','Main text'],
  ['mutedColor','Secondary text'],
  ['lineColor','Borders'],
  ['headerBackground','Header background'],
  ['footerBackground','Footer background'],
  ['heroStartColor','Hero gradient — left'],
  ['heroMiddleColor','Hero gradient — middle'],
  ['heroEndColor','Hero gradient — right'],
  ['heroTextColor','Hero title'],
  ['heroMutedColor','Hero paragraph'],
]

function numberValue(v:any, fallback:number){
  const n=Number(v)
  return Number.isFinite(n)?n:fallback
}

export default function SettingsEditor(){
  const supabase=useMemo(()=>createClient(),[])
  const [siteName,setSiteName]=useState(defaultBranding.siteName)
  const [tagline,setTagline]=useState(defaultBranding.tagline)
  const [logoText,setLogoText]=useState(defaultBranding.logoText)
  const [heroTitle,setHeroTitle]=useState(defaultHomepage.heroTitle)
  const [heroText,setHeroText]=useState(defaultHomepage.heroText)
  const [appearance,setAppearance]=useState<Appearance>(defaultAppearance)
  const [msg,setMsg]=useState('')
  const [busy,setBusy]=useState(false)
  const [uploading,setUploading]=useState('')
  const [tab,setTab]=useState<'brand'|'images'|'fonts'|'colors'|'layout'|'footer'|'advanced'>('brand')

  useEffect(()=>{(async()=>{
    const {data,error}=await supabase.from('site_settings').select('*').in('key',['branding','homepage','appearance'])
    if(error){setMsg(`❌ ${error.message}`);return}
    for(const r of data||[]){
      const v:any=r.value||{}
      if(r.key==='branding'){
        setSiteName(v.siteName||defaultBranding.siteName)
        setTagline(v.tagline||defaultBranding.tagline)
        setLogoText(v.logoText||defaultBranding.logoText)
      }
      if(r.key==='homepage'){
        setHeroTitle(v.heroTitle||defaultHomepage.heroTitle)
        setHeroText(v.heroText||defaultHomepage.heroText)
      }
      if(r.key==='appearance') setAppearance({...defaultAppearance,...v})
    }
  })()},[supabase])

  function patch<K extends keyof Appearance>(key:K,value:Appearance[K]){
    setAppearance(prev=>({...prev,[key]:value}))
  }

  async function save(){
    setBusy(true);setMsg('')
    const rows=[
      {key:'branding',value:{siteName,tagline,logoText}},
      {key:'homepage',value:{heroTitle,heroText}},
      {key:'appearance',value:appearance},
    ]
    const {error}=await supabase.from('site_settings').upsert(rows)
    setBusy(false)
    setMsg(error?`❌ ${error.message}`:'✅ Design saved. Refresh the public website to see the changes.')
  }

  async function uploadImage(kind:'logoImageUrl'|'heroImageUrl'|'backgroundImageUrl',file?:File){
    if(!file)return
    if(!file.type.startsWith('image/')){setMsg('❌ Please choose an image file.');return}
    setUploading(kind);setMsg('')
    const ext=(file.name.split('.').pop()||'jpg').replace(/[^a-zA-Z0-9]/g,'')
    const path=`appearance/${kind}-${Date.now()}.${ext}`
    const {error}=await supabase.storage.from('media').upload(path,file,{upsert:false})
    if(error){setMsg(`❌ ${error.message}`);setUploading('');return}
    const {data}=supabase.storage.from('media').getPublicUrl(path)
    patch(kind,data.publicUrl as any)
    setUploading('')
    setMsg('✅ Image uploaded. Press Save Design when you are happy with it.')
  }

  function resetDesign(){
    if(!window.confirm('Reset all appearance settings to the original Pawn to Professor design?'))return
    setAppearance(defaultAppearance)
    setMsg('Design reset in the editor. Press Save Design to apply it.')
  }

  const previewVars:any={
    '--p':appearance.primaryColor,'--s':appearance.secondaryColor,'--a':appearance.accentColor,
    '--bg':appearance.backgroundColor,'--card':appearance.cardColor,'--txt':appearance.textColor,
    '--muted':appearance.mutedColor,'--line':appearance.lineColor,'--radius':`${appearance.cardRadius}px`,
    '--br':`${appearance.buttonRadius}px`,
  }

  return <div className="appearance-manager">
    <section className="panel appearance-toolbar">
      <div><h2>Appearance Manager</h2><p className="helptext">Change the look of your website without editing code.</p></div>
      <div className="toolbar"><button className="btn secondary" type="button" onClick={resetDesign}>↩ Reset design</button><button className="btn" type="button" onClick={save} disabled={busy}>{busy?'Saving…':'💾 Save Design'}</button></div>
      {msg&&<p className="notice success appearance-message">{msg}</p>}
    </section>

    <div className="appearance-layout">
      <aside className="appearance-tabs panel">
        <button className={tab==='brand'?'active':''} onClick={()=>setTab('brand')}>🏷️ Brand & text</button>
        <button className={tab==='images'?'active':''} onClick={()=>setTab('images')}>🖼️ Photos & backgrounds</button>
        <button className={tab==='fonts'?'active':''} onClick={()=>setTab('fonts')}>🔤 Fonts</button>
        <button className={tab==='colors'?'active':''} onClick={()=>setTab('colors')}>🎨 Colors</button>
        <button className={tab==='layout'?'active':''} onClick={()=>setTab('layout')}>📐 Layout & shape</button>
        <button className={tab==='footer'?'active':''} onClick={()=>setTab('footer')}>⬇️ Header & footer</button>
        <button className={tab==='advanced'?'active':''} onClick={()=>setTab('advanced')}>🧰 Advanced</button>
      </aside>

      <section className="panel appearance-controls">
        {tab==='brand'&&<>
          <h2>Brand & homepage text</h2>
          <label className="field">Website name<input value={siteName} onChange={e=>setSiteName(e.target.value)} placeholder="Pawn to Professor"/></label>
          <label className="field">Tagline<input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="Plan • Teach • Play • Inspire"/></label>
          <label className="field">Logo symbol / emoji<input value={logoText} onChange={e=>setLogoText(e.target.value)} placeholder="♟️"/><small>Used when you do not upload a logo image.</small></label>
          <label className="field">Homepage big title<input value={heroTitle} onChange={e=>setHeroTitle(e.target.value)}/></label>
          <label className="field">Homepage introduction<textarea rows={4} value={heroText} onChange={e=>setHeroText(e.target.value)}/></label>
        </>}

        {tab==='images'&&<>
          <h2>Photos & backgrounds</h2>
          <ImageSetting title="Logo image" description="Optional. Replaces the chess symbol in the top-left." value={appearance.logoImageUrl} busy={uploading==='logoImageUrl'} onChange={v=>patch('logoImageUrl',v)} onUpload={f=>uploadImage('logoImageUrl',f)} onClear={()=>patch('logoImageUrl','')}/>
          <label className="field range-field">Logo size <div><input type="range" min="24" max="100" value={appearance.logoSize} onChange={e=>patch('logoSize',Number(e.target.value))}/><b>{appearance.logoSize}px</b></div></label>
          <ImageSetting title="Homepage header / hero photo" description="A large photo behind the main homepage title." value={appearance.heroImageUrl} busy={uploading==='heroImageUrl'} onChange={v=>patch('heroImageUrl',v)} onUpload={f=>uploadImage('heroImageUrl',f)} onClear={()=>patch('heroImageUrl','')}/>
          <label className="field">Hero photo position<select value={appearance.heroImagePosition} onChange={e=>patch('heroImagePosition',e.target.value)}><option value="center center">Center</option><option value="center top">Top</option><option value="center bottom">Bottom</option><option value="left center">Left</option><option value="right center">Right</option></select></label>
          <label className="field range-field">Photo light overlay <div><input type="range" min="0" max="0.85" step="0.05" value={appearance.heroOverlayOpacity} onChange={e=>patch('heroOverlayOpacity',Number(e.target.value))}/><b>{Math.round(appearance.heroOverlayOpacity*100)}%</b></div><small>Increase this if text is difficult to read on your photo.</small></label>
          <ImageSetting title="Whole-site background image" description="Optional background behind the cards and content." value={appearance.backgroundImageUrl} busy={uploading==='backgroundImageUrl'} onChange={v=>patch('backgroundImageUrl',v)} onUpload={f=>uploadImage('backgroundImageUrl',f)} onClear={()=>patch('backgroundImageUrl','')}/>
          <div className="form-two"><label className="field">Background size<select value={appearance.backgroundImageSize} onChange={e=>patch('backgroundImageSize',e.target.value)}><option value="cover">Cover screen</option><option value="contain">Fit whole image</option><option value="auto">Original size</option></select></label><label className="field">Scrolling<select value={appearance.backgroundImageAttachment} onChange={e=>patch('backgroundImageAttachment',e.target.value)}><option value="scroll">Scroll normally</option><option value="fixed">Stay fixed</option></select></label></div>
        </>}

        {tab==='fonts'&&<>
          <h2>Fonts</h2><p className="helptext">Choose friendly classroom fonts. The preview changes immediately.</p>
          <label className="field">Main / paragraph font<select value={appearance.bodyFont} onChange={e=>patch('bodyFont',e.target.value)}>{fontOptions.map(f=><option key={f}>{f}</option>)}</select></label>
          <label className="field">Titles / headings font<select value={appearance.headingFont} onChange={e=>patch('headingFont',e.target.value)}>{fontOptions.map(f=><option key={f}>{f}</option>)}</select></label>
          <div className="font-samples"><div style={{fontFamily:appearance.headingFont}}><b>Heading sample</b><span>Learn • Play • Grow</span></div><div style={{fontFamily:appearance.bodyFont}}><b>Paragraph sample</b><span>The quick brown fox jumps over the lazy dog. 1234567890</span></div></div>
        </>}

        {tab==='colors'&&<>
          <h2>Website colors</h2><p className="helptext">Use the color square or type a HEX color such as #0869d8.</p>
          <div className="color-grid">{colorFields.map(([key,label])=><ColorInput key={String(key)} label={label} value={String(appearance[key])} onChange={v=>patch(key,v as any)}/>)}</div>
        </>}

        {tab==='layout'&&<>
          <h2>Layout & shapes</h2>
          <label className="field range-field">Maximum website width <div><input type="range" min="900" max="1600" step="20" value={appearance.contentWidth} onChange={e=>patch('contentWidth',Number(e.target.value))}/><b>{appearance.contentWidth}px</b></div></label>
          <label className="field range-field">Card roundness <div><input type="range" min="0" max="40" value={appearance.cardRadius} onChange={e=>patch('cardRadius',Number(e.target.value))}/><b>{appearance.cardRadius}px</b></div></label>
          <label className="field range-field">Button roundness <div><input type="range" min="0" max="40" value={appearance.buttonRadius} onChange={e=>patch('buttonRadius',Number(e.target.value))}/><b>{appearance.buttonRadius}px</b></div></label>
          <label className="field range-field">Homepage hero height <div><input type="range" min="280" max="760" step="10" value={appearance.heroHeight} onChange={e=>patch('heroHeight',Number(e.target.value))}/><b>{appearance.heroHeight}px</b></div></label>
          <div className="form-two"><label className="field">Hero text alignment<select value={appearance.heroTextAlign} onChange={e=>patch('heroTextAlign',e.target.value)}><option value="left">Left</option><option value="center">Center</option></select></label><label className="field">Card shadows<select value={appearance.shadowStrength} onChange={e=>patch('shadowStrength',e.target.value)}><option value="none">None</option><option value="soft">Soft</option><option value="strong">Strong</option></select></label></div>
          <label className="switch-row"><input type="checkbox" checked={appearance.showHeroPiece} onChange={e=>patch('showHeroPiece',e.target.checked)}/> Show decorative chess piece on homepage</label>
        </>}

        {tab==='footer'&&<>
          <h2>Header & footer</h2>
          <label className="field">Header style<select value={appearance.headerStyle} onChange={e=>patch('headerStyle',e.target.value)}><option value="solid">Solid</option><option value="glass">Glass / translucent</option></select></label>
          <label className="switch-row"><input type="checkbox" checked={appearance.headerSticky} onChange={e=>patch('headerSticky',e.target.checked)}/> Keep header visible while scrolling</label>
          <label className="field">Footer right-side text<input value={appearance.footerText} onChange={e=>patch('footerText',e.target.value)} placeholder="Made for teachers…"/></label>
          <p className="helptext">Header and footer colors are available in the Colors tab.</p>
        </>}

        {tab==='advanced'&&<>
          <h2>Advanced</h2><p className="notice">Most people should leave this empty. Custom CSS can override the website design and can make pages look wrong.</p>
          <label className="field">Custom CSS<textarea rows={12} value={appearance.customCss} onChange={e=>patch('customCss',e.target.value)} placeholder={'/* Example */\n.feature-card { border-width: 2px; }'}/></label>
        </>}
      </section>

      <aside className="panel appearance-preview" style={previewVars}>
        <div className="preview-label">LIVE PREVIEW</div>
        <div className="mini-browser" style={{background:appearance.backgroundColor,color:appearance.textColor,fontFamily:appearance.bodyFont}}>
          <div className="mini-header" style={{background:appearance.headerBackground,borderColor:appearance.lineColor}}>
            <div className="mini-brand">{appearance.logoImageUrl?<img src={appearance.logoImageUrl} alt=""/>:<span>{logoText||'♟️'}</span>}<b style={{fontFamily:appearance.headingFont}}>{siteName||'Pawn to Professor'}</b></div><span>Home　Lessons　Games</span>
          </div>
          <div className="mini-hero" style={{minHeight:190,backgroundImage:appearance.heroImageUrl?`linear-gradient(rgba(255,255,255,${appearance.heroOverlayOpacity}),rgba(255,255,255,${appearance.heroOverlayOpacity})),url(${appearance.heroImageUrl})`:`linear-gradient(120deg,${appearance.heroStartColor},${appearance.heroMiddleColor},${appearance.heroEndColor})`,backgroundPosition:appearance.heroImagePosition,backgroundSize:'cover',color:appearance.heroTextColor,textAlign:appearance.heroTextAlign as any}}>
            <div><small>PAWN TO PROFESSOR</small><h3 style={{fontFamily:appearance.headingFont}}>{heroTitle||'Your homepage title'}</h3><p style={{color:appearance.heroMutedColor}}>{heroText||'Your homepage introduction.'}</p><button style={{background:appearance.primaryColor,borderRadius:appearance.buttonRadius}}>Explore resources</button></div>
          </div>
          <div className="mini-content"><h4 style={{fontFamily:appearance.headingFont}}>Everything in one place</h4><div className="mini-cards">{['📚 Lessons','🎮 Games','🃏 Flashcards'].map(x=><div key={x} style={{background:appearance.cardColor,borderColor:appearance.lineColor,borderRadius:appearance.cardRadius,boxShadow:appearance.shadowStrength==='none'?'none':appearance.shadowStrength==='strong'?'0 10px 24px #0002':'0 6px 16px #0001'}}>{x}</div>)}</div></div>
          <div className="mini-footer" style={{background:appearance.footerBackground,borderColor:appearance.lineColor}}>{appearance.footerText}</div>
        </div>
        <p className="helptext">This preview is approximate. Press Save Design, then refresh the public website for the exact result.</p>
      </aside>
    </div>
  </div>
}

function ColorInput({label,value,onChange}:{label:string,value:string,onChange:(v:string)=>void}){
  return <label className="color-field"><span>{label}</span><div><input type="color" value={/^#[0-9a-f]{6}$/i.test(value)?value:'#000000'} onChange={e=>onChange(e.target.value)}/><input value={value} onChange={e=>onChange(e.target.value)} maxLength={20}/></div></label>
}

function ImageSetting({title,description,value,onChange,onUpload,onClear,busy}:{title:string,description:string,value:string,onChange:(v:string)=>void,onUpload:(f?:File)=>void,onClear:()=>void,busy:boolean}){
  return <div className="image-setting"><div className="image-setting-title"><div><b>{title}</b><small>{description}</small></div>{value&&<button type="button" className="btn small secondary" onClick={onClear}>Remove</button>}</div>{value&&<img className="image-setting-preview" src={value} alt=""/>}<label className="field">Image URL<input value={value} onChange={e=>onChange(e.target.value)} placeholder="https://…"/></label><label className="btn secondary appearance-upload">{busy?'Uploading…':'⬆ Upload an image'}<input type="file" accept="image/*" disabled={busy} onChange={e=>onUpload(e.target.files?.[0])}/></label></div>
}
