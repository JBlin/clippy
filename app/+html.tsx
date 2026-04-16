import type { ReactNode } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function RootHtml({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
          name="viewport"
        />
        <link href="https://cdn.jsdelivr.net" rel="preconnect" />
        <link
          href="https://cdn.jsdelivr.net/npm/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #F4F7F9;
            font-family: Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
          }
          body {
            overflow: hidden;
          }
          #root {
            display: flex;
            min-height: 100vh;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
