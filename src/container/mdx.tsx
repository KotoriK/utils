import { Container, makeStyles, Paper } from "@material-ui/core";
import '../../node_modules/github-markdown-css/github-markdown.css'
const useStyles = makeStyles(theme => {
    return {
        gap: {
            height: theme.spacing(5)
        },
    }
})

export default function Mdx({ children }: { children: JSX.Element }) {
    const styles = useStyles()
    return <Container>
        <Paper>
            <div className={styles.gap}></div>
            <Container className="markdown-body">
                {children}
            </Container>
            <div className={styles.gap}></div>
        </Paper>
    </Container>
}