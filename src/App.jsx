import { useState, useEffect } from 'react';
import { Sun, Moon, Eye, Type, Menu, X as XClose } from 'lucide-react';
import { supabase } from './lib/supabase';
import Markdown from './components/Markdown';

// ---------- Social icons (inline SVG) ----------
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d={d} />
  </svg>
);
const GithubIcon = () => (
  <Icon d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.2 3.3 9.6 7.8 11.2.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.6-1.3-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.6 7.8-6 7.8-11.2A11.5 11.5 0 0 0 12 .5z" />
);
const XBrand = () => (
  <Icon d="M18.244 2H21.5l-7.5 8.57L23 22h-6.94l-5.43-7.1L4.36 22H1.1l8.04-9.19L1 2h7.09l4.9 6.49L18.24 2zm-2.43 18h1.92L7.27 4H5.22l10.6 16z" />
);
const YoutubeIcon = () => (
  <Icon d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.4.1 12 .1 12s0 3.6.4 5.5a3 3 0 0 0 2.1 2.1c1.9.4 9.4.4 9.4.4s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-5.5.4-5.5s0-3.6-.4-5.5zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
);
const LinkedinIcon = () => (
  <Icon d="M4.98 3.5a2.5 2.5 0 1 1 0 5.01 2.5 2.5 0 0 1 0-5.01zM3 9h4v12H3V9zm6 0h3.8v1.7h.1c.5-1 1.9-2 3.9-2 4.2 0 5 2.8 5 6.4V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9V9z" />
);
const MailIcon = () => (
  <Icon d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm2.4.4 7.6 5.7 7.6-5.7H4.4zM20 8.2l-7.4 5.5a1 1 0 0 1-1.2 0L4 8.2V18h16V8.2z" />
);

// ---------- Nav data ----------
const blogSubs = [
  { key: 'coding',    label: 'Coding',    num: '02.1' },
  { key: 'libraries', label: 'Libraries', num: '02.2' },
  { key: 'infra',     label: 'Infra',     num: '02.3' },
  { key: 'journal',   label: 'Journal',   num: '02.4' },
];

const topLevel = [
  { key: 'home',         label: 'Home',         num: '01' },
  { key: 'blog',         label: 'Blog',         num: '02' },
  { key: 'certs',        label: 'Certificates', num: '03' },
  { key: 'competitions', label: 'Competitions', num: '04' },
  { key: 'projects',     label: 'Projects',     num: '05' },
];

const CATEGORY_LABEL = {
  blog: 'Blog',
  coding: 'Coding',
  libraries: 'Libraries',
  infra: 'Infra',
  journal: 'Journal',
  certs: 'Certificates',
  competitions: 'Competitions',
  projects: 'Projects',
};

// posts.category values used as the page key for sub-cats
const BLOG_SUBS = new Set(['coding', 'libraries', 'infra', 'journal']);

// items.category in DB is singular
const ITEMS_DB_CATEGORY = {
  certs: 'cert',
  competitions: 'competition',
  projects: 'project',
};


// ---------- Shared UI ----------
const Breadcrumb = ({ parts, onNav }) => (
  <nav className="text-sm opacity-70 mb-4 flex gap-2 flex-wrap">
    {parts.map((p, i) => (
      <span key={i} className="flex gap-2">
        {p.target && onNav ? (
          <button onClick={() => onNav(p.target)} className="hover:underline">{p.label}</button>
        ) : (
          <span>{p.label || p}</span>
        )}
        {i < parts.length - 1 && <span className="opacity-50">/</span>}
      </span>
    ))}
  </nav>
);

const TocRow = ({ active, label, num, indent, onClick }) => (
  <button
    onClick={onClick}
    className={`toc-row w-full text-left py-1.5 text-sm ${indent ? 'pl-4' : ''} ${
      active ? 'opacity-100' : 'opacity-75 hover:opacity-100'
    }`}
  >
    <span className={active ? 'font-medium' : ''}>{label}</span>
    <span className="dots" />
    <span className="text-xs opacity-60 tabular-nums">{num}</span>
  </button>
);

const Spinner = () => (
  <div className="opacity-50 text-sm py-6">Loading…</div>
);

const EmptyState = ({ msg }) => (
  <p className="opacity-60 italic mt-6">{msg || "Nothing here yet."}</p>
);

// ---------- Date helpers ----------
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';
const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

// ---------- Data hooks ----------
const usePosts = (category) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      let q = supabase
        .from('posts')
        .select('slug,title,excerpt,date_label,category,created_at')
        .eq('published', true)
        .order('created_at', { ascending: false });
      // 'blog' (parent) → show every sub-category; otherwise filter
      if (category && category !== 'blog') q = q.eq('category', category);
      const { data, error } = await q;
      if (!alive) return;
      if (error) setError(error.message);
      else setData(data || []);
    })();
    return () => { alive = false; };
  }, [category]);
  return { data, error };
};

const usePost = (slug) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
      if (!alive) return;
      if (error) setError(error.message);
      else setData(data);
    })();
    return () => { alive = false; };
  }, [slug]);
  return { data, error };
};

const useItems = (dbCategory) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id,title,description,meta,date_label,sort_order')
        .eq('category', dbCategory)
        .order('sort_order', { ascending: true });
      if (!alive) return;
      if (error) setError(error.message);
      else setData(data || []);
    })();
    return () => { alive = false; };
  }, [dbCategory]);
  return { data, error };
};

// ---------- Sidebar ----------
const Sidebar = ({ page, navigate, dark, setDark, larger, setLarger, setZen, onCloseMobile }) => (
  <div className="h-full w-full px-6 sm:px-8 py-10 flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => navigate('home')}
        className="font-semibold text-lg"
      >
        Tuan Tran
      </button>
      {onCloseMobile && (
        <button onClick={onCloseMobile} className="lg:hidden opacity-70" aria-label="Close menu">
          <XClose className="w-5 h-5" />
        </button>
      )}
    </div>
    <div className="flex gap-3 opacity-70 mb-10">
      <a href="https://github.com/tuanhqv123/" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon /></a>
      <a href="https://x.com/lgrd149" target="_blank" rel="noreferrer" aria-label="X"><XBrand /></a>
      <a href="https://linkedin.com/in/tuan-tran149" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon /></a>
      <a href="mailto:hello@tuantranon.me" aria-label="Email"><MailIcon /></a>
    </div>

    <div className="text-[11px] tracking-[0.25em] opacity-60 mb-2 pb-2 border-b border-current/15">
      CONTENTS
    </div>

    <nav className="flex-1 overflow-y-auto -mx-1 px-1">
      {topLevel.map((item) => (
        <div key={item.key}>
          <TocRow
            label={item.label}
            num={item.num}
            active={page === item.key}
            onClick={() => navigate(item.key)}
          />
          {item.key === 'blog' && (
            <div>
              {blogSubs.map((s) => (
                <TocRow
                  key={s.key}
                  label={s.label}
                  num={s.num}
                  indent
                  active={page === s.key}
                  onClick={() => navigate(s.key)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>

    <div className="flex gap-5 mt-6 opacity-70">
      <button onClick={() => setLarger(!larger)} aria-label="Toggle text size" title="Bigger text">
        <Type className="w-4 h-4" />
      </button>
      <button onClick={() => setDark(!dark)} aria-label="Toggle theme" title="Light / dark">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button onClick={() => setZen(true)} aria-label="Zen mode" title="Zen mode">
        <Eye className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ---------- Pages ----------
const PageTitle = ({ children }) => (
  <h1 className="font-script text-4xl sm:text-5xl md:text-6xl my-4 sm:my-6 leading-tight">
    {children}
  </h1>
);

const PostList = ({ items, onOpen, showCategory }) =>
  !items?.length ? (
    <EmptyState msg="No posts yet — coming soon." />
  ) : (
    <ul className="space-y-1 mt-8">
      {items.map((it) => (
        <li key={it.slug}>
          <button
            onClick={() => onOpen(it.slug)}
            className="text-left w-full flex justify-between items-baseline gap-4 group py-3 border-b border-current/10"
          >
            <span className="group-hover:underline underline-offset-4">
              {it.title}
              {showCategory && (
                <span className="ml-3 text-xs uppercase tracking-wider opacity-50">
                  {CATEGORY_LABEL[it.category] || it.category}
                </span>
              )}
            </span>
            <span className="text-sm opacity-50 shrink-0 tabular-nums">
              {it.date_label || fmtDate(it.created_at)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

const ItemList = ({ items, kind }) => {
  if (!items?.length) return <EmptyState msg="Nothing here yet." />;
  return (
    <ul className="space-y-6 mt-8">
      {items.map((it) => (
        <li key={it.id} className="border-b border-current/10 pb-5">
          <div className="flex justify-between items-baseline gap-4 mb-2 flex-wrap">
            <h3 className="font-semibold text-lg">{it.title}</h3>
            <span className="text-sm opacity-50 shrink-0">{it.date_label}</span>
          </div>
          {it.description && <p className="opacity-85">{it.description}</p>}
          {it.meta && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {it.meta.org && <span className="opacity-70">{it.meta.org}</span>}
              {it.meta.place && (
                <span className="px-2 py-0.5 rounded bg-current/10">{it.meta.place}</span>
              )}
              {it.meta.context && <span className="opacity-70">@ {it.meta.context}</span>}
              {Array.isArray(it.meta.tech) && it.meta.tech.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-current/5 border border-current/15">{t}</span>
              ))}
              {it.meta.link && (
                <a href={it.meta.link} target="_blank" rel="noreferrer" className="underline opacity-80">link →</a>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

const HomePage = ({ navigate }) => {
  const { data: posts } = usePosts(null);
  return (
    <article className="prose-article">
      <PageTitle>Tuan Tran</PageTitle>
      <p>
        I build systems — AI agentic workflows, applied computer vision models,
        and the infrastructure that keeps them running.
      </p>
      <p>
        This is where I write down what I figure out along the way: libraries I
        like, issues I ran into, how I solved them, bits of architecture.
      </p>
      <p className="text-sm opacity-60 mt-4">
        <a href="mailto:hello@tuantranon.me" className="underline">hello@tuantranon.me</a>
        {' · '}
        <a href="https://linkedin.com/in/tuan-tran149" target="_blank" rel="noreferrer" className="underline">linkedin</a>
        {' · '}
        <a href="https://github.com/tuanhqv123/" target="_blank" rel="noreferrer" className="underline">github</a>
      </p>
      <h2>Recent writing</h2>
      {posts === null ? <Spinner /> : (
        <PostList items={posts.slice(0, 6)} onOpen={(slug) => navigate(slug)} showCategory />
      )}
    </article>
  );
};

const CategoryPostsPage = ({ category, navigate }) => {
  const { data } = usePosts(category);
  const isBlogIndex = category === 'blog';
  const parts = isBlogIndex
    ? [{ label: 'Home', target: 'home' }, { label: 'Blog' }]
    : [
        { label: 'Home', target: 'home' },
        { label: 'Blog', target: 'blog' },
        { label: CATEGORY_LABEL[category] },
      ];
  return (
    <article className="prose-article">
      <Breadcrumb parts={parts} onNav={navigate} />
      <PageTitle>{CATEGORY_LABEL[category]}</PageTitle>
      {data === null ? (
        <Spinner />
      ) : (
        <PostList items={data} onOpen={navigate} showCategory={isBlogIndex} />
      )}
    </article>
  );
};

const CategoryItemsPage = ({ category, navigate }) => {
  const dbCat = ITEMS_DB_CATEGORY[category];
  const { data } = useItems(dbCat);
  return (
    <article className="prose-article">
      <Breadcrumb
        parts={[{ label: 'Home', target: 'home' }, { label: CATEGORY_LABEL[category] }]}
        onNav={navigate}
      />
      <PageTitle>{CATEGORY_LABEL[category]}</PageTitle>
      {data === null ? <Spinner /> : <ItemList items={data} kind={dbCat} />}
    </article>
  );
};

const ArticleView = ({ slug, navigate }) => {
  const { data } = usePost(slug);
  if (data === null) {
    return (
      <article className="prose-article">
        <Breadcrumb parts={[{ label: 'Home', target: 'home' }]} onNav={navigate} />
        <Spinner />
      </article>
    );
  }
  if (!data) {
    return (
      <article className="prose-article">
        <Breadcrumb parts={[{ label: 'Home', target: 'home' }]} onNav={navigate} />
        <PageTitle>Not found</PageTitle>
        <p>No post matches <code>{slug}</code>.</p>
      </article>
    );
  }
  return (
    <article className="prose-article">
      <Breadcrumb
        parts={[
          { label: 'Home', target: 'home' },
          { label: 'Blog', target: 'blog' },
          { label: CATEGORY_LABEL[data.category] || data.category, target: data.category },
          { label: data.title },
        ]}
        onNav={navigate}
      />
      <PageTitle>{data.title}</PageTitle>
      <p className="opacity-60 text-sm mb-8">
        {data.date_label || fmtDateTime(data.created_at)}
      </p>
      <Markdown>{data.body}</Markdown>
    </article>
  );
};

// ---------- App ----------
export default function App() {
  const [page, setPage] = useState('home');     // can also be a post slug
  const [dark, setDark] = useState(false);
  const [larger, setLarger] = useState(false);
  const [zen, setZen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    setMobileNavOpen(false);
    window.scrollTo({ top: 0 });
  }, [page]);

  const knownPages = new Set([...topLevel.map((t) => t.key), ...blogSubs.map((s) => s.key)]);
  const navigate = (target) => setPage(target);
  const sidebarKey = knownPages.has(page) ? page : null;

  const renderContent = () => {
    if (page === 'home') return <HomePage navigate={navigate} />;
    if (page === 'blog' || BLOG_SUBS.has(page))
      return <CategoryPostsPage category={page} navigate={navigate} />;
    if (ITEMS_DB_CATEGORY[page])
      return <CategoryItemsPage category={page} navigate={navigate} />;
    // otherwise assume it's a post slug
    return <ArticleView slug={page} navigate={navigate} />;
  };

  return (
    <div
      className={`min-h-screen ${larger ? 'text-larger' : ''} ${
        dark ? 'bg-[#0f1420] text-slate-200' : 'bg-[#f5f1e8] text-slate-900'
      }`}
    >
      {!zen && (
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-current/10 backdrop-blur bg-inherit">
          <button onClick={() => navigate('home')} className="font-semibold">Tuan Tran</button>
          <div className="flex items-center gap-3 opacity-70">
            <button onClick={() => setDark(!dark)} aria-label="Toggle theme">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>
      )}

      <div className="max-w-6xl mx-auto flex gap-8 lg:gap-12 px-0 lg:px-6">
        {!zen && (
          <aside className="hidden lg:block w-72 shrink-0 sticky top-0 h-screen">
            <Sidebar
              page={sidebarKey}
              navigate={navigate}
              dark={dark}
              setDark={setDark}
              larger={larger}
              setLarger={setLarger}
              setZen={setZen}
            />
          </aside>
        )}

        {!zen && mobileNavOpen && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileNavOpen(false)} />
            <aside
              className={`lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 shadow-xl ${
                dark ? 'bg-[#0f1420] text-slate-200' : 'bg-[#f5f1e8] text-slate-900'
              }`}
            >
              <Sidebar
                page={sidebarKey}
                navigate={navigate}
                dark={dark}
                setDark={setDark}
                larger={larger}
                setLarger={setLarger}
                setZen={setZen}
                onCloseMobile={() => setMobileNavOpen(false)}
              />
            </aside>
          </>
        )}

        <main
          className={`flex-1 min-w-0 px-5 sm:px-8 py-8 sm:py-12 lg:py-16 ${
            zen ? 'max-w-3xl mx-auto' : 'lg:pr-8 lg:max-w-2xl xl:max-w-3xl'
          }`}
        >
          {renderContent()}
        </main>

        {zen && (
          <button
            onClick={() => setZen(false)}
            className="fixed bottom-6 left-6 p-2.5 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur z-50"
            aria-label="Exit zen mode"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
