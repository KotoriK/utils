import { Button, Container, Grid, Toolbar, makeStyles, Typography, Divider, Card, Slider, Switch, FormControlLabel, CircularProgress, Fade } from '@material-ui/core'
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createStyles } from '@material-ui/core'
import { readImage, KMeansResult, readImageDownsampling, normalizeRGBA, rgbaToHSLA, sortHSL } from 'palette'
import GitHubIcon from '@material-ui/icons/GitHub';
import Placeholder from '../compo/placeholder'
import Color from '../compo/color'
import Link from 'next/link'
import PromiseWorker from 'promise-worker';
function useThemeColorWorker() {
    const promiseWorker = useRef<PromiseWorker>()
    useEffect(() => {
        const worker = new Worker(new URL('../ThemeColorWorker.ts', import.meta.url))
        promiseWorker.current = new PromiseWorker(worker)
        return () => {
            worker.terminate()
        }
    }, [])
    return promiseWorker.current
}
const useStyles = makeStyles((theme) => createStyles({
    "color": {
        height: '3vh',
        width: "3vh"
    },
    vgap: {
        height: 20
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
    },
    "result": {
        display:"flex",
        "& span": {
            marginLeft: 8,

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

function useControlledValue<T>(initialValue?: T) {
    const [value, set] = useState(initialValue)
    const cb = useCallback((_, next: T) => {
        set(next)
    }, [])
    return [value, cb] as [T, (_: any, next: T) => void]
}
export default function ThemeColor() {
    const [currentImageUrl, setImageBlobUrl] = useState<string>('')
    const [result, setResult] = useState<ThemeColorStateResult>()
    const [doDownSample, setDoDownSample] = useControlledValue(true)
    const [kMeansSetting_k, setKMeansSetting_k] = useControlledValue(defaultKSetting.k)
    const [kMeansSetting_iteration, setKMeansSetting_iteration] = useControlledValue(defaultKSetting.iteration)
    const refImageElement = useRef<HTMLImageElement>()
    const themeColorWorker = useThemeColorWorker()
    const [inProgress, setInProgress] = useState(false)
    const changeImage = useCallback<ChangeEventHandler<HTMLInputElement>>(
        async (e) => {
            const files = e.target.files
            if (files && files.length > 0) {
                const buf = new Blob([await files[0].arrayBuffer()])
                if (currentImageUrl) URL.revokeObjectURL(currentImageUrl)
                setImageBlobUrl(URL.createObjectURL(buf))
            }
        }, [])
    const execute = useCallback(async () => {
        const { current } = refImageElement
        const data = doDownSample ? readImageDownsampling(current, 10 * 1000) : readImage(current)
        setInProgress(true)
        const result: any = await themeColorWorker.postMessage({
            k: kMeansSetting_k, iteration: kMeansSetting_iteration,
            img: data
        })
        const { size } = result
        result.label = (result as KMeansResult).label.map(value => (value / size * 100).toFixed(2) + '%')
        setResult(result)
        setInProgress(false)
    }, [refImageElement, kMeansSetting_k, kMeansSetting_iteration, doDownSample, themeColorWorker])
    const styles = useStyles()
    const mappedResult = useMemo(() =>
        result && <>
            <div className={styles.result}>
            <Typography component="span" variant="subtitle1"><strong>像素个数：</strong>{result.size}</Typography>
            <Typography component="span"  variant="subtitle1"><strong>达到拟合要求：</strong>{result.fit_thresold ? "是" : "否"}</Typography>
            <Typography component="span" variant="subtitle1"><strong>迭代次数：{result.iterate_time}</strong></Typography>
            </div>
            <br/>
            {result.cluster_center.map(v => [v, rgbaToHSLA(normalizeRGBA(v))])
                .sort((a, b) => sortHSL([2, 0, 1, 3])(a[1], b[1]))
                .map(([pixel, _], index) => <Grid key={index} item>
                    <Color color={pixel} className={styles.color} percent={result.label[index]}></Color>
                </Grid>)}
        </>
        , [result])
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
                            <input id="image" type="file" accept="image/*" onChange={changeImage}></input>
                            <Button variant="outlined" color="primary" onClick={execute} disabled={inProgress}>执行</Button><Fade
                                in={inProgress}
                                unmountOnExit
                                timeout={800}
                            >
                                <CircularProgress size={18} />
                            </Fade>
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
                            <div className={styles.vgap}></div>
                            <span >
                                <Typography component="span" id="label-iteration" variant="subtitle1">迭代次数:</Typography>
                                <Slider
                                    step={1}
                                    min={KMeansSetting_iteration_range[0]}
                                    max={KMeansSetting_iteration_range[KMeansSetting_iteration_range.length - 1]}
                                    value={kMeansSetting_iteration}
                                    aria-labelledby="label-iteration"
                                    valueLabelDisplay="auto"
                                    marks={KMeansSetting_iteration_marks}
                                    onChange={setKMeansSetting_iteration}
                                ></Slider>
                            </span>
                            <span>
                                <Typography component="span" id="label-k" variant="subtitle1">类的个数(k)</Typography>
                                <Slider
                                    step={1}
                                    min={KMeansSetting_k_range[0]}
                                    max={KMeansSetting_k_range[KMeansSetting_k_range.length - 1]}
                                    value={kMeansSetting_k}
                                    aria-labelledby="label-k"
                                    valueLabelDisplay="auto"
                                    marks={KMeansSetting_k_marks}
                                    onChange={setKMeansSetting_k}
                                ></Slider>
                            </span>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={doDownSample}
                                        onChange={setDoDownSample}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label="开启降采样"
                            />
                        </Container>
                    </Card>
                </Grid>
                {result && <Grid item md xs={12}>
                    <Card>
                        <Container className={styles.has_vertical_gap}>
                            <Typography variant="h5">结果</Typography>
                            <Divider />
                            <Grid container spacing={2} className={styles.has_vertical_gap}>
                                {mappedResult}
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


