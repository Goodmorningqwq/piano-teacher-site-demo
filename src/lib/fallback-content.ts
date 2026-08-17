import type { Course, Profile, SiteSettings, Video } from './database.types'

/**
 * Bundled placeholder content, mirroring supabase/migrations/0002_seed.sql.
 *
 * Served whenever Supabase is not configured or unreachable, so the site
 * always renders something complete. Edits the teacher makes in /admin go
 * to the database and take precedence — this is only the floor.
 */

const now = '1970-01-01T00:00:00Z'

export const fallbackProfile: Profile = {
  id: 1,
  name_zh: '陳老師',
  name_en: 'Ms Chan',
  tagline_zh: '鋼琴教師 · 演奏級文憑',
  tagline_en: 'Piano Teacher · Performance Diploma',
  bio_zh: `我自六歲開始學習鋼琴，畢業後一直從事鋼琴教學工作，至今超過十五年。這些年來，我陪伴過不少學生由第一次坐上琴凳，到考獲演奏級文憑，也見過不少成年人重新拾起小時候未完成的心願。

我相信每一位學生的節奏都不一樣。有人喜歡古典，有人偏愛流行；有人想考級，有人只想在週末彈一首自己喜歡的曲。我的工作，是找出適合你的那條路。`,
  bio_en: `I began playing at six and have been teaching piano for over fifteen years. In that time I have accompanied students from their very first time on the bench through to performance diplomas, and helped many adults return to something they set down as children.

Every student moves at their own pace. Some love classical, some prefer pop; some are working towards exams, others simply want to play one piece they love on a Sunday afternoon. My job is to find the path that fits you.`,
  philosophy_zh: '技巧是為了表達，不是為了炫耀。我希望學生離開琴房的時候，不只是彈得準，而是彈得像自己。',
  philosophy_en:
    'Technique exists to serve expression, not to show off. I want a student to leave the room not just playing accurately, but sounding like themselves.',
  portrait_url: null,
  credentials: [
    { year: '2008', title_zh: '香港演藝學院 音樂學士（鋼琴演奏）', title_en: 'BMus in Piano Performance, HKAPA' },
    { year: '2010', title_zh: '英國皇家音樂學院 演奏級文憑 (LRSM)', title_en: 'LRSM Performance Diploma, ABRSM' },
    { year: '2012', title_zh: '開始全職鋼琴教學', title_en: 'Began teaching piano full time' },
    { year: '2019', title_zh: '學生於校際音樂節獲獎', title_en: 'Students awarded at the Hong Kong Schools Music Festival' },
  ],
  email: 'hello@example.com',
  phone: '+852 9876 5432',
  whatsapp: '85298765432',
  instagram: null,
  youtube: null,
  address_zh: '九龍區 · 可上門或於工作室授課',
  address_en: 'Kowloon · studio or home visits',
  updated_at: now,
}

export const fallbackSettings: SiteSettings = {
  id: 1,
  hero_headline_zh: '讓每個人都彈出自己的聲音',
  hero_headline_en: 'Find your own voice at the piano',
  hero_sub_zh: '香港鋼琴教學 · 兒童、成人及考級課程',
  hero_sub_en: 'Piano lessons in Hong Kong for children, adults and exam candidates',
  hero_image_url: null,
  default_theme: 'dark',
  seo_title_zh: '陳老師 鋼琴教室 · 香港鋼琴老師',
  seo_title_en: 'Ms Chan Piano Studio · Piano Lessons in Hong Kong',
  seo_description_zh: '香港鋼琴教師，提供兒童啟蒙、成人興趣班及 ABRSM 考級課程。歡迎查詢試堂。',
  seo_description_en:
    'Piano teacher in Hong Kong offering beginner lessons for children, adult classes and ABRSM exam preparation. Trial lessons available.',
  updated_at: now,
}

const course = (
  sort_order: number,
  fields: Partial<Course> & Pick<Course, 'title_zh'>,
): Course => ({
  id: `fallback-course-${sort_order}`,
  sort_order,
  is_published: true,
  title_en: null,
  summary_zh: null,
  summary_en: null,
  level_zh: null,
  level_en: null,
  duration_min: null,
  price: null,
  price_note_zh: '每堂',
  price_note_en: 'per lesson',
  icon: 'note',
  image_url: null,
  created_at: now,
  updated_at: now,
  ...fields,
})

export const fallbackCourses: Course[] = [
  course(1, {
    title_zh: '兒童啟蒙班',
    title_en: "Children's Foundation",
    summary_zh:
      '為四至八歲小朋友而設，由認識琴鍵、節奏遊戲開始，慢慢建立看譜和彈奏的信心。上課氣氛輕鬆，重點是讓小朋友先喜歡上音樂。',
    summary_en:
      'For ages four to eight. We start with the keys and rhythm games, then build reading and playing confidence gently. The priority is that a child enjoys music first.',
    level_zh: '4–8 歲 · 零基礎',
    level_en: 'Ages 4–8 · complete beginners',
    duration_min: 45,
    price: 400,
    icon: 'star',
  }),
  course(2, {
    title_zh: '考級課程 ABRSM',
    title_en: 'ABRSM Exam Preparation',
    summary_zh:
      '針對英國皇家音樂學院一至八級考試，包括樂曲、音階、聽音及視奏訓練。會按學生程度制定練習計劃，並安排模擬考試。',
    summary_en:
      'Structured preparation for ABRSM Grades 1–8: pieces, scales, aural and sight-reading. Each student gets a practice plan and mock exams before the real thing.',
    level_zh: '一級至八級',
    level_en: 'Grades 1–8',
    duration_min: 60,
    price: 550,
    icon: 'medal',
  }),
  course(3, {
    title_zh: '成人興趣班',
    title_en: 'Adult Lessons',
    summary_zh:
      '無論是零基礎，還是小時候學過想重新開始，都歡迎。可以自己選想彈的曲目，古典、電影配樂或流行曲都可以，不需要考試。',
    summary_en:
      'Whether you have never played or are picking it up again after many years. Choose your own repertoire — classical, film scores or pop. No exams unless you want them.',
    level_zh: '成人 · 任何程度',
    level_en: 'Adults · any level',
    duration_min: 60,
    price: 550,
    icon: 'note',
  }),
  course(4, {
    title_zh: '樂理課程',
    title_en: 'Music Theory',
    summary_zh:
      '配合考級或純粹想理解音樂結構的學生。由基本音符時值到和聲分析，用聽得明的方式解釋，而不是死記硬背。',
    summary_en:
      'For exam candidates or anyone who wants to understand how music is built. From note values to harmonic analysis, explained in a way that makes sense rather than memorised.',
    level_zh: '一級至八級樂理',
    level_en: 'Theory Grades 1–8',
    duration_min: 45,
    price: 400,
    icon: 'book',
  }),
]

const placeholderNote = {
  description_zh: '在管理面板貼上 YouTube 連結或上載影片，就會顯示在這裡。',
  description_en: 'Paste a YouTube link or upload a file in the admin panel and it will appear here.',
}

const video = (sort_order: number, title_zh: string, title_en: string): Video => ({
  id: `fallback-video-${sort_order}`,
  sort_order,
  is_published: true,
  title_zh,
  title_en,
  source_type: 'placeholder',
  external_id: null,
  storage_path: null,
  poster_url: null,
  duration_sec: null,
  created_at: now,
  updated_at: now,
  ...placeholderNote,
})

export const fallbackVideos: Video[] = [
  video(1, '演奏影片', 'Performance'),
  video(2, '學生表演', 'Student Recital'),
  video(3, '教學片段', 'Teaching Clip'),
]
