import { Button, Container, Grid, Toolbar, makeStyles, Typography, Divider, Card, Slider } from '@material-ui/core'
import { ChangeEventHandler, useCallback, useRef, useState } from 'react'
import { createStyles } from '@material-ui/core'
import { kmeans, readImage, toPixel, KMeansResult } from 'palette'
import GitHubIcon from '@material-ui/icons/GitHub';
import Placeholder from '../compo/placeholder'
import Color from '../compo/color'
import Link from 'next/link'
const useStyles = makeStyles((theme) => createStyles({
    "color": {
        height: '3vh',
        width: "3vh"
    },
    vgap: {
        height: 20
    },
    "2x_vgap": {
        height: 40
    },
    "has_vertical_gap": {
        marginTop: 15,
        marginBottom: 12
    },
    "preview": {
        height: "20vh",
        marginLeft: "auto",
        marginRight: "auto"
    },
    "footer": {
        display: 'flex',
        alignItems: 'flex-end',
        margin: "10px 0 10px",
        "& > a": {
            marginLeft: '5px',
            color: theme.palette.text.primary,
            textDecoration: 'none',
            "&:hover": {
                textDecoration: 'underline',
            }
        }
    }
}))
const defaultKSetting = {
    k: 3, iteration: 20
}
interface KMeansSetting {
    k: number
    iteration: number
}
const _mapRange = value => { return { value, label: value } }
const KMeansSetting_k_range = [1, 5, 10]
const KMeansSetting_iteration_range = [5, 100, 200]
const KMeansSetting_k_marks = KMeansSetting_k_range.map(_mapRange)
const KMeansSetting_iteration_marks = KMeansSetting_iteration_range.map(_mapRange)

type ThemeColorStateResult = Pick<KMeansResult, 'iterate_time' | 'cluster_center' | 'fit_thresold' | 'size'> & { label: string[] }
export default function ThemeColor() {
    const [currentImageUrl, setImageBlobUrl] = useState<string>('')
    const [result, setResult] = useState<ThemeColorStateResult>()
    const refImageInput = useRef<HTMLInputElement>()
    const refImageElement = useRef<HTMLImageElement>()
    const refKMeansSetting = useRef<KMeansSetting>(defaultKSetting)
    const changeHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(
        async () => {
            const files = refImageInput.current.files
            if (files && files.length > 0) {
                const buf = new Blob([await files[0].arrayBuffer()])
                if (currentImageUrl) URL.revokeObjectURL(currentImageUrl)
                setImageBlobUrl(URL.createObjectURL(buf))
            }
        }, [refImageInput])
    const clickHandler = useCallback(() => {
        //TODO:Worker
        const { current } = refImageElement
        const pixels = toPixel(readImage(current))
        const { k, iteration } = refKMeansSetting.current
        const result: any = kmeans(pixels, k, iteration)
        const { size } = result
        console.log(result)
        result.label = (result as KMeansResult).label.map(value => (value / size * 100).toFixed(2) + '%')
        setResult(result)
    }, [refImageElement, refKMeansSetting])
    const kChangeHandler = useCallback((_, value) => {
        const { current } = refKMeansSetting
        current.k = value
    }, [refKMeansSetting])
    const iterationChangeHandler = useCallback((_, value) => {
        const { current } = refKMeansSetting
        current.iteration = value
    }, [refKMeansSetting])
    const styles = useStyles()
    return <>
        <Toolbar>
            <Link href="/">    
                    <Button color="primary">{"< 返回"}</Button>
            </Link>
        </Toolbar>
        <Container>
            <Typography variant="h4">主题颜色</Typography>
            <Divider />
            <div className={styles.vgap}></div>

            <Grid container spacing={2}>
                <Grid item md={6} xs={12}>
                    <Card variant="outlined">
                        <Container className={styles.has_vertical_gap}>
                            <Typography variant="h5">选择图像</Typography>
                            <Divider />
                            <input ref={refImageInput} id="image" type="file" accept="image/*" onChange={changeHandler}></input>
                            <Button variant="outlined" color="primary" onClick={clickHandler}>执行</Button>
                            <Typography variant="subtitle1">当前图像</Typography>
                            <Placeholder className={styles.preview} caption="暂无预览" >
                                {currentImageUrl ? <img ref={refImageElement} className={styles.preview} src={currentImageUrl}></img> : null}
                            </Placeholder>
                        </Container>

                    </Card>
                </Grid>
                <Grid item md={6} xs={12}>
                    <Card>
                        <Container className={styles.has_vertical_gap}>
                            <Typography variant="h5">参数调整</Typography>
                            <Divider />
                            <div className={styles['2x_vgap']}></div>
                            <span >
                                <Typography component="span" id="label-iteration" variant="subtitle1">迭代次数:</Typography>
                                <Slider
                                    step={1}
                                    min={KMeansSetting_iteration_range[0]}
                                    max={KMeansSetting_iteration_range[KMeansSetting_iteration_range.length - 1]}
                                    defaultValue={defaultKSetting.iteration}
                                    aria-labelledby="label-iteration"
                                    valueLabelDisplay="auto"
                                    marks={KMeansSetting_iteration_marks}
                                    onChange={iterationChangeHandler}
                                ></Slider>
                            </span>
                            <span>
                                <Typography component="span" id="label-k" variant="subtitle1">类的个数(k)</Typography>
                                <Slider
                                    step={1}
                                    min={KMeansSetting_k_range[0]}
                                    max={KMeansSetting_k_range[KMeansSetting_k_range.length - 1]}
                                    defaultValue={defaultKSetting.k}
                                    aria-labelledby="label-k"
                                    valueLabelDisplay="auto"
                                    marks={KMeansSetting_k_marks}
                                    onChange={kChangeHandler}
                                ></Slider>
                            </span>
                        </Container>
                    </Card>
                </Grid>
                {result && <Grid item md xs={12}>
                    <Card>
                        <Container className={styles.has_vertical_gap}>
                            <Typography variant="h5">结果</Typography>
                            <Divider />
                            <Grid container spacing={2} className={styles.has_vertical_gap}>
                                {result.cluster_center.map((pixel, index) => <Grid key={index} item>
                                    <Color color={pixel} className={styles.color} percent={result.label[index]}></Color>
                                </Grid>)}
                            </Grid>
                        </Container>
                    </Card>
                </Grid>}
            </Grid>
            <Divider variant="fullWidth" className={styles.has_vertical_gap} />
            <div className={styles.footer}>
                <GitHubIcon />
                <a href="https://github.com/KotoriK/palette">
                    <Typography variant='caption'>KotoriK/palette</Typography>
                </a>
            </div>

        </Container>
    </>
}


