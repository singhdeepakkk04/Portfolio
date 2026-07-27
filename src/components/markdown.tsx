"use client";

import ReactMarkdown, { Options } from "react-markdown";

export default function Markdown(props: Options) {
  return <ReactMarkdown {...props} />;
}
