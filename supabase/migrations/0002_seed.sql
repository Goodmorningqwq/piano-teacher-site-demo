-- ============================================================
-- Placeholder content
-- ============================================================
-- Everything here is written to be replaced by the teacher through
-- /admin. It exists so the site looks complete and intentional from
-- the first deploy rather than showing empty sections.
--
-- BEFORE DEPLOYING: change the email in `admins` to the teacher's
-- real address. That email is the only one that can sign in and edit.
-- ============================================================

insert into public.admins (email)
values ('change-me@example.com')
on conflict (email) do nothing;

-- ---------- profile ----------

insert into public.profile (
  id,
  name_zh, name_en,
  tagline_zh, tagline_en,
  bio_zh, bio_en,
  philosophy_zh, philosophy_en,
  credentials,
  email, phone, whatsapp,
  address_zh, address_en
)
values (
  1,
  '陳老師', 'Ms Chan',
  '鋼琴教師 · 演奏級文憑', 'Piano Teacher · Performance Diploma',
  '我自六歲開始學習鋼琴，畢業後一直從事鋼琴教學工作，至今超過十五年。這些年來，我陪伴過不少學生由第一次坐上琴凳，到考獲演奏級文憑，也見過不少成年人重新拾起小時候未完成的心願。

我相信每一位學生的節奏都不一樣。有人喜歡古典，有人偏愛流行；有人想考級，有人只想在週末彈一首自己喜歡的曲。我的工作，是找出適合你的那條路。',
  'I began playing at six and have been teaching piano for over fifteen years. In that time I have accompanied students from their very first time on the bench through to performance diplomas, and helped many adults return to something they set down as children.

Every student moves at their own pace. Some love classical, some prefer pop; some are working towards exams, others simply want to play one piece they love on a Sunday afternoon. My job is to find the path that fits you.',
  '技巧是為了表達，不是為了炫耀。我希望學生離開琴房的時候，不只是彈得準，而是彈得像自己。',
  'Technique exists to serve expression, not to show off. I want a student to leave the room not just playing accurately, but sounding like themselves.',
  '[
    {"year": "2008", "title_zh": "香港演藝學院 音樂學士（鋼琴演奏）", "title_en": "BMus in Piano Performance, HKAPA"},
    {"year": "2010", "title_zh": "英國皇家音樂學院 演奏級文憑 (LRSM)", "title_en": "LRSM Performance Diploma, ABRSM"},
    {"year": "2012", "title_zh": "開始全職鋼琴教學", "title_en": "Began teaching piano full time"},
    {"year": "2019", "title_zh": "學生於校際音樂節獲獎", "title_en": "Students awarded at the Hong Kong Schools Music Festival"}
  ]'::jsonb,
  'hello@example.com', '+852 9876 5432', '85298765432',
  '九龍區 · 可上門或於工作室授課', 'Kowloon · studio or home visits'
)
on conflict (id) do nothing;

-- ---------- site settings ----------

insert into public.site_settings (
  id,
  hero_headline_zh, hero_headline_en,
  hero_sub_zh, hero_sub_en,
  default_theme,
  seo_title_zh, seo_title_en,
  seo_description_zh, seo_description_en
)
values (
  1,
  '讓每個人都彈出自己的聲音', 'Find your own voice at the piano',
  '香港鋼琴教學 · 兒童、成人及考級課程',
  'Piano lessons in Hong Kong for children, adults and exam candidates',
  'dark',
  '陳老師 鋼琴教室 · 香港鋼琴老師', 'Ms Chan Piano Studio · Piano Lessons in Hong Kong',
  '香港鋼琴教師，提供兒童啟蒙、成人興趣班及 ABRSM 考級課程。歡迎查詢試堂。',
  'Piano teacher in Hong Kong offering beginner lessons for children, adult classes and ABRSM exam preparation. Trial lessons available.'
)
on conflict (id) do nothing;

-- ---------- courses ----------

insert into public.courses
  (sort_order, title_zh, title_en, summary_zh, summary_en, level_zh, level_en,
   duration_min, price, price_note_zh, price_note_en, icon)
select * from (values
  (1,
   '兒童啟蒙班', 'Children''s Foundation',
   '為四至八歲小朋友而設，由認識琴鍵、節奏遊戲開始，慢慢建立看譜和彈奏的信心。上課氣氛輕鬆，重點是讓小朋友先喜歡上音樂。',
   'For ages four to eight. We start with the keys and rhythm games, then build reading and playing confidence gently. The priority is that a child enjoys music first.',
   '4–8 歲 · 零基礎', 'Ages 4–8 · complete beginners',
   45, 400, '每堂', 'per lesson', 'star'),
  (2,
   '考級課程 ABRSM', 'ABRSM Exam Preparation',
   '針對英國皇家音樂學院一至八級考試，包括樂曲、音階、聽音及視奏訓練。會按學生程度制定練習計劃，並安排模擬考試。',
   'Structured preparation for ABRSM Grades 1–8: pieces, scales, aural and sight-reading. Each student gets a practice plan and mock exams before the real thing.',
   '一級至八級', 'Grades 1–8',
   60, 550, '每堂', 'per lesson', 'medal'),
  (3,
   '成人興趣班', 'Adult Lessons',
   '無論是零基礎，還是小時候學過想重新開始，都歡迎。可以自己選想彈的曲目，古典、電影配樂或流行曲都可以，不需要考試。',
   'Whether you have never played or are picking it up again after many years. Choose your own repertoire — classical, film scores or pop. No exams unless you want them.',
   '成人 · 任何程度', 'Adults · any level',
   60, 550, '每堂', 'per lesson', 'note'),
  (4,
   '樂理課程', 'Music Theory',
   '配合考級或純粹想理解音樂結構的學生。由基本音符時值到和聲分析，用聽得明的方式解釋，而不是死記硬背。',
   'For exam candidates or anyone who wants to understand how music is built. From note values to harmonic analysis, explained in a way that makes sense rather than memorised.',
   '一級至八級樂理', 'Theory Grades 1–8',
   45, 400, '每堂', 'per lesson', 'book')
) as v(sort_order, title_zh, title_en, summary_zh, summary_en, level_zh, level_en,
       duration_min, price, price_note_zh, price_note_en, icon)
-- Only seed an empty table. There is no natural unique key here, so
-- `on conflict` could not prevent duplicates on a re-run; this can.
where not exists (select 1 from public.courses);

-- ---------- videos ----------
-- Deliberate placeholders. The teacher replaces each one from /admin by
-- pasting a YouTube link or uploading a file; the site renders them as
-- designed "coming soon" cards until she does.

insert into public.videos
  (sort_order, source_type, title_zh, title_en, description_zh, description_en)
select * from (values
  (1, 'placeholder',
   '演奏影片', 'Performance',
   '在管理面板貼上 YouTube 連結或上載影片，就會顯示在這裡。',
   'Paste a YouTube link or upload a file in the admin panel and it will appear here.'),
  (2, 'placeholder',
   '學生表演', 'Student Recital',
   '在管理面板貼上 YouTube 連結或上載影片，就會顯示在這裡。',
   'Paste a YouTube link or upload a file in the admin panel and it will appear here.'),
  (3, 'placeholder',
   '教學片段', 'Teaching Clip',
   '在管理面板貼上 YouTube 連結或上載影片，就會顯示在這裡。',
   'Paste a YouTube link or upload a file in the admin panel and it will appear here.')
) as v(sort_order, source_type, title_zh, title_en, description_zh, description_en)
where not exists (select 1 from public.videos);
