import { Container, makeStyles, Paper, CssBaseline } from "@material-ui/core";
import Head from "next/head";
import useHorse from "../compo/horse";

import '../../node_modules/github-markdown-css/github-markdown.css'
const useStyles = makeStyles(theme => {
    return {
        gap: {
            height: theme.spacing(5)
        },
    }
})
export default function App({ Component, pageProps }) {
    const styles = useStyles()
    useHorse()
    return <>
        <CssBaseline />
        <Head>
            <title>kotorik/utils</title>
        </Head>
        <Container>
            <Paper>
                <div className={styles.gap}></div>
                <Container className="markdown-body">
                    <Component {...pageProps} />
                </Container>
                <div className={styles.gap}></div>
            </Paper>
        </Container></>

}