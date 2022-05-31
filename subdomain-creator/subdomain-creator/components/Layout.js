import Head from 'next/head'
import Typography from '@deseretdigital/cascade.typography';
import colors from '@deseretdigital/cascade.colors';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
    const router = useRouter();
  return (
    <>
      <Head>
        <title>Subdomain Creator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="subdomain-creator-header">
            <Link href="/"><a style={{background: router.pathname === '/' ? colors['dark-blue'] : colors.blue}}>Subdomains</a></Link>
            <Link href="/repos"><a style={{background: router.pathname === '/repos' ? colors['dark-blue'] : colors.blue}}>Repositories</a></Link>
            <Link href="/scripts"><a style={{background: router.pathname === '/scripts' ? colors['dark-blue'] : colors.blue}}>Post Run Scripts</a></Link>
        </div>
        <div className="body">
            {children}
        </div>
      </main>
      <style jsx>{`
        .subdomain-creator-header {
            background: ${colors.blue};
            color: ${colors.white};
            padding: 0 20px;
            display: flex;
            justify-content: flex-start;
            vertical-align: middle;
        }
        .body {
            padding: 20px;
        }
        :global(.subdomain-creator-header a) {
            margin-right: 5px;
            padding: 20px;
            color: ${colors.white} !important;
            text-decoration: none;
        }
      `}</style>
      <style global jsx>{`
        body {
            font-family: "Nunito Sans", sans-serif;
            color: ${colors.black};
            margin: 0;
        }
      `}</style>
    </>
  )
}
