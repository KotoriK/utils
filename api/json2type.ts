import { VercelRequest, VercelResponse } from "@vercel/node";
import { parseToTypes } from 'json2type'
import fetch from "node-fetch";
export default async function (req: VercelRequest, res: VercelResponse) {
    const { url, json, name } = req.query
    let ok = false, data
    try {
        if (url) {
            const resp = await fetch(url as any)
            const txt = await resp.text()
            data = parseToTypes(txt, name as any)
        } else {
            if (json) {
                data = parseToTypes(json as any, name as any)
            } else {
                data = "miss argument"
            }
        }
        ok = true
    } catch (error) {
        data = error
    }
    res.send(`{"ok":${ok ? 'true' : 'false'},"data":"${data}}"`)
}