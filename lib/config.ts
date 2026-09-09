export function hasSupabaseEnv(){
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export const demoSections = [
  {id:'lessons',parent_id:null,title:'Lessons',slug:'lessons',description:'Ready-to-use lesson plans for elementary EFL.',position:1,visible:true,icon:'book'},
  {id:'games',parent_id:null,title:'Games',slug:'games',description:'Interactive HTML5 classroom games.',position:2,visible:true,icon:'game'},
  {id:'flashcards',parent_id:null,title:'Flashcards',slug:'flashcards',description:'Visual vocabulary cards for fast classroom practice.',position:3,visible:true,icon:'cards'},
  {id:'worksheets',parent_id:null,title:'Worksheets',slug:'worksheets',description:'Printable activities and student handouts.',position:4,visible:true,icon:'worksheet'},
  {id:'chess',parent_id:null,title:'Chess',slug:'chess',description:'Chess + English teaching resources.',position:5,visible:true,icon:'chess'},
  {id:'materials',parent_id:null,title:'Materials',slug:'materials',description:'Teacher resources, PDFs, posters and extras.',position:6,visible:true,icon:'folder'},
]

export const demoPages = [
  {id:'welcome-game',section_id:'games',title:'Foodies Vocabulary Game',slug:'foodies-vocabulary-game',summary:'A colorful speaking and vocabulary game for the classroom.',body:'Connect your HTML5 game URL from Site Manager.',page_type:'game',external_url:null,grade:'3–6',published:true,position:1,thumbnail_url:null},
  {id:'welcome-lesson',section_id:'lessons',title:'Countries & Famous Food',slug:'countries-famous-food',summary:'Taiwan, Japan, Korea and the USA through famous foods.',body:'Add your lesson plan, flashcards, worksheet and related game here.',page_type:'page',external_url:null,grade:'5–6',published:true,position:2,thumbnail_url:null},
]

export const defaultBranding = {siteName:'Pawn to Professor',tagline:'Plan • Teach • Play • Inspire',logoText:'♟️'}
export const defaultHomepage = {heroTitle:'Simple tools. Brighter classrooms.',heroText:'Ready-to-use EFL lessons, games, flashcards and resources — organized in one place.'}
