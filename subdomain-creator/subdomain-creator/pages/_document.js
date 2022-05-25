// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
      <link
            href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap"
            rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
            __html: `
              // Request the sprite
              var ajax = new XMLHttpRequest();
              ajax.open("GET", "//static.ksl.com/ksl-svg-sprite/sprite.svgz", true);
              ajax.send();
              ajax.onload = function(e) {
                // Once you receive it, inject it into the HTML
                var div = document.createElement("div");
                div.style.display = "none";
                div.innerHTML = ajax.responseText;
                document.body.insertBefore(div, document.body.childNodes[0]);
              }
            `}} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}