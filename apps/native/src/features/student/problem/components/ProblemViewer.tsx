import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { serializeJSONToHTML } from '../utils/serializeJSONToHTML';

async function loadFontAsBase64() {
  const asset = Asset.fromModule(require('@assets/fonts/PretendardVariable.ttf'));
  await asset.downloadAsync();
  const fileUri = asset.localUri || asset.uri;
  const base64 = await FileSystem.readAsStringAsync(fileUri!, {
    encoding: 'base64',
  });

  return base64;
}

interface ProblemViewerProps {
  problemContent: string;
  minHeight?: number;
  padding?: number;
}

const ProblemViewer = ({ problemContent, minHeight = 0, padding = 0 }: ProblemViewerProps) => {
  const [webViewHeight, setWebViewHeight] = useState(minHeight);
  const [isContentLoading, setIsContentLoading] = useState(true);

  useEffect(() => {
    setIsContentLoading(true);
  }, [problemContent]);

  const GET_WEBVIEW_HEIGHT_SCRIPT = `
    (function () {
      const sendHeight = () => {
        const height = document.documentElement.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'setHeight', height }));
      };

      window.addEventListener('load', sendHeight);
      window.addEventListener('resize', sendHeight);
      const observer = new MutationObserver(sendHeight);
      observer.observe(document.body, { attributes: true, childList: true, subtree: true });

      sendHeight();
    })();
    true;
  `;

  const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <style>
    @font-face {
      font-family: 'Pretendard Variable';
      src: url('data:font/ttf;base64,${loadFontAsBase64()}') format('truetype-variations');
      font-weight: 100 900;
      font-style: normal;
    }
      
    :root {
      overflow-wrap: break-word;
      text-size-adjust: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
      font-size: 16px;
      line-height: 1.6;

      --tt-color-highlight-yellow: #fef9c3;
      --tt-color-highlight-green: #dcfce7;
      --tt-color-highlight-blue: #e0f2fe;
      --tt-color-highlight-purple: #f3e8ff;
      --tt-color-highlight-red: #ffe4e6;

      --horizontal-rule-color: rgba(37, 39, 45, 0.1);
    }

    html, body {
      background: transparent !important;
    }

    body {
      padding: ${padding}px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      border: 0 solid;
    }

    p:not(:first-child) {
      font-weight: normal;
      margin-top: 20px;
    }

    img {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      margin: 32px auto;
      outline: 2px solid transparent;
      border-radius: 4px;
    }

    ul,
    ol {
      margin-top: 1.5em;
      margin-bottom: 1.5em;
      padding-left: 1.5em;
    }

    ul:first-child,
    ol:first-child {
      margin-top: 0;
    }

    li p {
      margin-top: 0;
      line-height: 1.6;
    }

    blockquote {
      position: relative;
      padding: 1em 1.125em;
      margin: 1.5em 0;
      border: 1px solid #333;
      border-radius: 1px;
    }

    blockquote p:not(:first-child) {
      margin-top: 0.75em;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 1.5em 0;
    }

    td {
      position: relative;
      padding: 0.3125em;
      padding-left: 1.75em;
    }

    table:has(> tbody > tr:first-child > td:nth-child(3):last-child)>tbody>tr:nth-child(1)>td:nth-child(1)::before,
    table:has(> tbody > tr:first-child > td:nth-child(1):last-child)>tbody>tr:nth-child(1)>td:nth-child(1)::before,
    table:has(> tbody > tr:first-child > td:nth-child(5):last-child)>tbody>tr:nth-child(1)>td:nth-child(1)::before {
      content: "① ";
      position: absolute;
      left: 0.5em;
      user-select: none;
      pointer-events: none;
    }

    table:has(> tbody > tr:first-child > td:nth-child(3):last-child)>tbody>tr:nth-child(1)>td:nth-child(2)::before,
    table:has(> tbody > tr:first-child > td:nth-child(1):last-child)>tbody>tr:nth-child(2)>td:nth-child(1)::before,
    table:has(> tbody > tr:first-child > td:nth-child(5):last-child)>tbody>tr:nth-child(1)>td:nth-child(2)::before {
      content: "② ";
      position: absolute;
      left: 0.5em;
      user-select: none;
      pointer-events: none;
    }

    table:has(> tbody > tr:first-child > td:nth-child(3):last-child)>tbody>tr:nth-child(1)>td:nth-child(3)::before,
    table:has(> tbody > tr:first-child > td:nth-child(1):last-child)>tbody>tr:nth-child(3)>td:nth-child(1)::before,
    table:has(> tbody > tr:first-child > td:nth-child(5):last-child)>tbody>tr:nth-child(1)>td:nth-child(3)::before {
      content: "③ ";
      position: absolute;
      left: 0.5em;
      user-select: none;
      pointer-events: none;
    }

    table:has(> tbody > tr:first-child > td:nth-child(3):last-child)>tbody>tr:nth-child(2)>td:nth-child(1)::before,
    table:has(> tbody > tr:first-child > td:nth-child(1):last-child)>tbody>tr:nth-child(4)>td:nth-child(1)::before,
    table:has(> tbody > tr:first-child > td:nth-child(5):last-child)>tbody>tr:nth-child(1)>td:nth-child(4)::before {
      content: "④ ";
      position: absolute;
      left: 0.5em;
      user-select: none;
      pointer-events: none;
    }

    table:has(> tbody > tr:first-child > td:nth-child(3):last-child)>tbody>tr:nth-child(2)>td:nth-child(2)::before,
    table:has(> tbody > tr:first-child > td:nth-child(1):last-child)>tbody>tr:nth-child(5)>td:nth-child(1)::before,
    table:has(> tbody > tr:first-child > td:nth-child(5):last-child)>tbody>tr:nth-child(1)>td:nth-child(5)::before {
      content: "⑤ ";
      position: absolute;
      left: 0.5em;
      user-select: none;
      pointer-events: none;
    }

    table:has(> tbody > tr:first-child > td:nth-child(3):last-child)>tbody>tr:nth-child(2)>td:nth-child(3) {
      position: relative;
      pointer-events: none;
      user-select: none;
      color: transparent;
    }

    span[data-type="inline-math"] {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 0px;
      vertical-align: baseline;
    }

    .katex {
      font-size: 1em;
    }

    .katex-display {
      margin: 0;
    }

    div[data-type=horizontalRule] {
      margin-top: 2.25em;
      margin-bottom: 2.25em;
      padding-top: 0.75em;
      padding-bottom: 0.75em;
    }

    hr {
      border: none;
      height: 1px;
      background-color: var(--horizontal-rule-color);
    }
  </style>
</head>

<body>
  ${serializeJSONToHTML(problemContent)}
  <script>
    (function () {
      function notifyReactNativeContentReady() {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "contentReady" }));
        }
      }

      function renderInlineMath() {
        var spans = document.querySelectorAll('span[data-type="inline-math"]');
        spans.forEach(function (el) {
          var latex = el.getAttribute("data-latex") || "";
          try {
            if (window.katex && window.katex.render) {
              window.katex.render(latex, el, {
                throwOnError: false,
                displayMode: true,
              });
            } else {
              el.textContent = latex;
            }
          } catch (e) {
            console.error("katex error", e, latex);
            el.textContent = latex;
          }
        });
      }

      function init() {
        renderInlineMath();
        notifyReactNativeContentReady();
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    })();
  </script>
</body>

</html>
`;

  return (
    <View style={{ height: webViewHeight, minHeight, position: 'relative' }}>
      <WebView
        originWhitelist={['*']}
        injectedJavaScript={GET_WEBVIEW_HEIGHT_SCRIPT}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'setHeight') {
              setWebViewHeight(Math.max(minHeight, data.height));
            }
            if (data.type === 'contentReady') {
              setIsContentLoading(false);
            }
          } catch {}
        }}
        source={{ html: HTML_TEMPLATE }}
        style={{
          height: webViewHeight,
          backgroundColor: 'transparent',
          opacity: isContentLoading ? 0 : 1,
        }}
        containerStyle={{ backgroundColor: 'transparent' }}
        androidLayerType='software'
      />
      {isContentLoading && (
        <View
          pointerEvents='none'
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
};

export default ProblemViewer;
