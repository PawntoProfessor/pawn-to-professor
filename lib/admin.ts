import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/config'

export async function requireAdmin(){
  if(!hasSupabaseEnv()) redirect('/setup')
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login')
  const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle()
  if(!profile || profile.role!=='admin') redirect('/')
  return {supabase,userId:user.id}
}
