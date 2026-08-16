import React from 'react'
import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["h1","h2","h3","p","b","i","em","strong","u","s","del","mark","ul","ol","li","a","br","hr","blockquote","code","pre","span"];
const ALLOWED_ATTR = ["href","target","rel","class","style"];

export default function HtmlContent({ html, className = "" }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  return (
    <div
      className={`prose dark:prose-invert prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
