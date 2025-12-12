import React, { useRef, useState, type JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

function CodeBlock({ language, children }: { language: string; children: string }) {
  const codeString = String(children).trim();
  
  const highlightCode = (code: string, lang: string) => {
    if (!lang || lang === 'text' || lang === 'plain') {
      return <span>{code}</span>;
    }

    const lines = code.split('\n');
    return lines.map((line, i) => {
      let result: JSX.Element[] = [];
      let remaining = line;
      let key = 0;

      const keywords: { [key: string]: string[] } = {
        javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch', 'new', 'this', 'super'],
        typescript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch', 'new', 'interface', 'type', 'enum', 'this', 'super'],
        python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'with', 'lambda', 'pass', 'break', 'continue', 'self'],
        java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'new', 'static', 'void', 'int', 'String', 'this'],
      };

      const langKeywords = keywords[lang.toLowerCase()] || keywords.javascript;

      while (remaining.length > 0) {
        // Check for keywords
        let foundKeyword = false;
        for (const keyword of langKeywords) {
          if (remaining.startsWith(keyword) && (remaining.length === keyword.length || /\W/.test(remaining[keyword.length]))) {
            result.push(<span key={key++} className="text-purple-400 font-semibold">{keyword}</span>);
            remaining = remaining.slice(keyword.length);
            foundKeyword = true;
            break;
          }
        }
        if (foundKeyword) continue;

        // Check for numbers
        const numberMatch = remaining.match(/^\d+(\.\d+)?/);
        if (numberMatch) {
          result.push(<span key={key++} className="text-blue-400">{numberMatch[0]}</span>);
          remaining = remaining.slice(numberMatch[0].length);
          continue;
        }

        // Check for strings
        const strMatch = remaining.match(/^(["'`])((?:\\.|(?!\1).)*?)\1/);
        if (strMatch) {
          result.push(<span key={key++} className="text-green-400">{strMatch[0]}</span>);
          remaining = remaining.slice(strMatch[0].length);
          continue;
        }

        // Check for comments
        if (remaining.startsWith('//') || remaining.startsWith('#')) {
          result.push(<span key={key++} className="text-gray-500 italic">{remaining}</span>);
          remaining = '';
          break;
        }

        // Regular character
        result.push(<span key={key++} className="text-gray-300">{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }

      return (
        <div key={i} className="table-row">
          <span className="table-cell pr-4 text-right select-none text-gray-600 text-xs font-mono w-12">{i + 1}</span>
          <span className="table-cell">{result.length > 0 ? result : <span className="text-gray-300">{line || ' '}</span>}</span>
        </div>
      );
    });
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 my-4 shadow-lg">
      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-300 font-mono flex items-center justify-between">
        <span className="uppercase font-semibold tracking-wider">{language || 'code'}</span>
        <span className="text-gray-500">•••</span>
      </div>
      <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed">
          <code className="table w-full">{highlightCode(codeString, language)}</code>
        </pre>
      </div>
    </div>
  );
}
type MarkdownViewerProps = {
  content: string;
  className?: string;
};

export default function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`prose prose-sm max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-2 prose-h1:mb-4 prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mb-3 prose-h3:text-lg prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-li:text-gray-700 prose-li:mb-1 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-strong:text-gray-900 prose-strong:font-semibold prose-em:text-gray-700 prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-2 prose-td:border prose-td:border-gray-300 prose-td:p-2 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            
            return match ? (
              <CodeBlock language={match[1]}>
                {codeString}
              </CodeBlock>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content || "*No content to display*"}
      </ReactMarkdown>
    </div>
  );
}