import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>I2E Chatbot</title>
        <link rel="icon" href="/chatbot-icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
