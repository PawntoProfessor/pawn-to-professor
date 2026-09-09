'use client'
import {useEffect,useMemo,useState} from 'react'
import {createClient} from '@/lib/supabase/client'
export default function TrashManager(){const supabase=useMemo(()=>createClient(),[]);const[sections,setSections]=useState<any[]>([]),[pages,setPages]=useState<any[]>([]),[msg,setMsg]=useState('')
async function load(){const[{data:s},{data:p}]=await Promise.all([supabase.from('sections').select('*').not('deleted_at','is',null),supabase.from('pages').select('*').not('deleted_at','is',null)]);setSections(s||[]);setPages(p||[])}
useEffect(()=>{load()},[])
async function restore(kind:'sections'|'pages',id:string){const{error}=await supabase.from(kind).update({deleted_at:null}).eq('id',id);if(error)setMsg(error.message);else{setMsg('✅ Restored.');load()}}
async function destroy(kind:'sections'|'pages',id:string){if(!confirm('Permanently delete this item? This cannot be undone.'))return;const{error}=await supabase.from(kind).delete().eq('id',id);if(error)setMsg(error.message);else load()}
const row=(kind:'sections'|'pages',x:any)=><div className="trash-row" key={x.id}><div><b>{x.title}</b><small>{kind==='sections'?'Section':'Page / Resource'}</small></div><button className="btn small secondary" onClick={()=>restore(kind,x.id)}>↩ Restore</button><button className="btn small danger" onClick={()=>destroy(kind,x.id)}>Delete forever</button></div>
return <section className="panel"><h2>Trash</h2><p>Items you remove stay here until you permanently delete them.</p>{msg&&<p className="notice success">{msg}</p>}<div className="trash-list">{sections.map(s=>row('sections',s))}{pages.map(p=>row('pages',p))}</div>{sections.length+pages.length===0&&<div className="empty-state">🗑️<h3>Trash is empty</h3><p>Nothing to restore.</p></div>}</section>}
