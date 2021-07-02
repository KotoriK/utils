import { RGBA } from "palette"
import { Grid, Tooltip, Typography, } from '@material-ui/core'
import { useState } from "react"
import { useCallback } from "react"
import { useRef } from "react"
import { useEffect } from "react"

interface ColorProps {
    color: RGBA
    className: string
    percent: string
}
const toHex = (num: number) => {
    const result = parseInt(num.toString()).toString(16)
    if (result.length == 1) return '0' + result
    else return result
}
const Color = ({ color: [r, g, b, a], className, percent }: ColorProps) => {
    /**“已复制”工具提示 */
    const [tooltipCopied, setTootipCopied] = useState(false)
    const refTimer = useRef<number | undefined>(undefined)
    const clickHandler = useCallback((e) => {
        navigator.clipboard.writeText(e.target.innerText)
        //TODO:???
        requestAnimationFrame(() => {
            refTimer.current = window.setTimeout(() => {
                setTootipCopied(false)
            }, 1000)
        })
        setTootipCopied(true)
    }, [])
    useEffect(() => () => {
        const { current } = refTimer
        if (current) clearTimeout(current)
    })
    const _a = toHex(a)
    return <Grid container spacing={1}>
        <Grid item style={{ backgroundColor: `rgba(${r},${g},${b},${a})` }}>
            <div className={className}></div>
        </Grid>
        <Grid item >
            <Tooltip arrow title={tooltipCopied ? "已复制！" : "点击可以复制颜色值"}>
                <Typography onClick={clickHandler}>{`#${toHex(r)}${toHex(g)}${toHex(b)}${_a.match(/ff/i) ? '' : _a}`}</Typography>
            </Tooltip>
        </Grid>

        <Grid item>{percent}</Grid>
    </Grid>
}
export default Color