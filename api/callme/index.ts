import { NowRequest, NowResponse } from '@vercel/node'
import { APIResult } from '../../src/api'
import { performance } from 'perf_hooks'
export default async function (req: NowRequest, res: NowResponse) {
    const { url } = req.query
    let isOK = false
    let data

    if (typeof url == 'string') {
        console.log(url)
            const timeBeforeReq = performance.now()
            await fetch(url).then(async resp => {
                const timeAfterReq = performance.now()
                const { status, statusText, headers, redirected, type } = resp
                const trailer = await resp.trailer
                data = {
                    status,
                    statusText,
                    headers,
                    redirected,
                    type,
                    trailer,
                    time: timeAfterReq - timeBeforeReq
                }
            })
                .catch(e => {
                    data = { type: 'error', error: e }
                })
    } else {
        data = `malform url. Expect string, but get ${typeof url}`
    }
    res.setHeader("Cache-Control", "no-cache")
    res.send(JSON.stringify({
        ok: isOK, data
    } as APIResult<any>))
}