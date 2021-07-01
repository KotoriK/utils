import { VercelResponse, VercelRequest } from '@vercel/node'

import Cheerio from 'cheerio'
import fetch from 'node-fetch'
export default async function (req: VercelRequest, res: VercelResponse) {
    let ok = false
    let data = ''
    const query = req.query;
    const url: string = query.url as any
    if (url) {
        try {
            const search = query.search ? true : false
            const resp = await fetch(url)
            if (resp.ok) {
                const $ = Cheerio.load(await resp.text())
                const listName = $("#p_name_show").text()
                const listAuthor = $(".data__cont .data__singer > a").text()
                const coverImg = $('.data__cover > .data__photo').attr().src
                if (search) {

                } else {
                    ok = true
                    data = JSON.stringify({
                        listName,
                        listAuthor,
                        coverImg
                    })
                }
            } else {
                data = 'fetch failed:' + resp.status
            }
        } catch (error) {
            data = JSON.stringify(error)
        }
    } else {
        data = 'argument miss: "url"'
    }
    res.send(`{ok:${ok ? 'true' : 'false'},data:${data}}`);
}