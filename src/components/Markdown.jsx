import { useEffect, useRef, useState, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

const MermaidBlock = ({ code }) => {
  const ref = useRef(null);
  const [error, setError] = useState(null);
  const id = useId().replace(/:/g, '');
  useEffect(() => {
    let alive = true;
    const isDark = document.documentElement.classList.contains('dark');
    mermaid.initialize({ theme: isDark ? 'dark' : 'default', securityLevel: 'loose' });
    mermaid
      .render(`mmd-${id}`, code)
      .then(({ svg }) => {
        if (alive && ref.current) ref.current.innerHTML = svg;
      })
      .catch((e) => {
        if (alive) setError(e.message || 'mermaid render error');
      });
    return () => { alive = false; };
  }, [code, id]);
  if (error) {
    return (
      <pre className="my-4 text-xs text-red-400 bg-black/40 p-3 rounded">
        mermaid error: {error}
      </pre>
    );
  }
  return <div ref={ref} className="my-6 flex justify-center overflow-x-auto" />;
};

const components = {
  code({ inline, className, children, ...props }) {
    const text = String(children).replace(/\n$/, '');
    const match = /language-(\w+)/.exec(className || '');

    if (inline) {
      return <code className={className} {...props}>{children}</code>;
    }
    if (match?.[1] === 'mermaid') {
      return <MermaidBlock code={text} />;
    }
    return (
      <SyntaxHighlighter
        language={match?.[1] || 'text'}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: '1.25rem 0',
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          padding: '1rem',
        }}
      >
        {text}
      </SyntaxHighlighter>
    );
  },
  img({ src, alt, ...rest }) {
    return (
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        className="my-5 rounded-lg max-w-full h-auto border border-current/10"
        {...rest}
      />
    );
  },
  a({ href, children, ...rest }) {
    const external = /^https?:\/\//.test(href || '');
    return (
      <a
        href={href}
        className="underline underline-offset-2 hover:opacity-80"
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },
  table({ children, ...rest }) {
    return (
      <div className="my-5 overflow-x-auto">
        <table className="w-full text-sm border-collapse" {...rest}>{children}</table>
      </div>
    );
  },
  th({ children, ...rest }) {
    return <th className="text-left p-2 border-b border-current/30 font-semibold" {...rest}>{children}</th>;
  },
  td({ children, ...rest }) {
    return <td className="p-2 border-b border-current/10 align-top" {...rest}>{children}</td>;
  },
  blockquote({ children, ...rest }) {
    return (
      <blockquote
        className="my-5 pl-4 border-l-2 border-current/30 italic opacity-90"
        {...rest}
      >
        {children}
      </blockquote>
    );
  },
  ul({ children, ...rest }) {
    return <ul className="my-4 list-disc pl-6 space-y-1" {...rest}>{children}</ul>;
  },
  ol({ children, ...rest }) {
    return <ol className="my-4 list-decimal pl-6 space-y-1" {...rest}>{children}</ol>;
  },
  h2({ children, ...rest }) {
    return <h2 className="text-2xl font-semibold mt-10 mb-3" {...rest}>{children}</h2>;
  },
  h3({ children, ...rest }) {
    return <h3 className="text-xl font-semibold mt-8 mb-2" {...rest}>{children}</h3>;
  },
};

export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {children || ''}
    </ReactMarkdown>
  );
}
