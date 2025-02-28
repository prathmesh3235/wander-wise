import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, title = 'Wander Wise - Your Personal Travel Companion' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Plan your perfect trip with personalized itineraries, local experiences, and hidden gems." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}