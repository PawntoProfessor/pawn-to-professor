import AdminNav from '@/components/AdminNav'
import SettingsEditor from '@/components/SettingsEditor'
import {requireAdmin} from '@/lib/admin'
export default async function Settings(){await requireAdmin();return <div className="admin-shell"><AdminNav/><main className="admin-main"><div className="admin-head"><div><span className="eyebrow">ADMIN</span><h1>Design & Appearance</h1><p>Change photos, backgrounds, fonts, colors, layout, header and footer from your browser.</p></div></div><SettingsEditor/></main></div>}
