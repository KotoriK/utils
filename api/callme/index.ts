import { NowRequest, NowResponse } from '@vercel/node'
import { APIResult } from '../../src/api'
import {performance} from 'perf_hooks'
export default async function (req: NowRequest, res: NowResponse) {
    const { url } = req.query
    let isOK = false
    let data

    if (typeof url == 'string') {
        try {
            const timeBeforeReq = performance.now()
            const resp = await fetch(url)
            const timeAfterReq = performance.now()
            const {status,statusText,headers,redirected,type} = resp
            const trailer = await resp.trailer
            data = {
                status,
                statusText,
                headers,
                redirected,
                type,
                trailer,
                time:timeAfterReq-timeBeforeReq
            }
        } catch (e) {
            data = {type:'error',error:e}
        }
    } else {
        data = `malform url. Expect string, but get ${typeof url}`
    }
    res.setHeader("Cache-Control", "no-cache")
    res.send(JSON.stringify({
        ok: isOK, data
    } as APIResult<any>))
}