import { CssBaseline } from "@material-ui/core";
import Head from "next/head";
import useHorse from "../compo/horse";
import { PageTransition } from 'next-page-transitions'
import '../page-transition.css'
import { useRouter } from "next/dist/client/router";
export default function App({ Component, pageProps }) {
    useHorse()
    const router = useRouter()
    return <>
        <CssBaseline />
        <Head>
            <title>kotorik/utils</title>
        </Head>
        <PageTransition timeout={300} classNames="page-transition">
            <Component {...pageProps} key={router.route}/>
        </PageTransition>
    </>

}