import { VercelResponse, VercelRequest } from '@vercel/node'

import Cheerio from 'cheerio'
import fetch from 'node-fetch'
export default async function (req: VercelRequest, res: VercelResponse) {
    const query = req.query;
    const url: string = query.url as any
    const search = query.search ? true : false
    let ok = false
    let data = ''
    const resp = await fetch(url)
    if (resp.ok) {
        const $ = Cheerio.load(await resp.text())
        const listName = $("#p_name_show").text()
        const listAuthor = $(".data__cont .data__singer > a").text()
        const coverImg = $('.data__cover > .data__photo').attr().src
        if(search){

        }else{
            data = JSON.stringify({
                listName,
                listAuthor,
                coverImg
            })
        }
    } else {
        data = 'fetch failed:' + resp.status
    }
    res.send(`{ok:${ok ? 'true' : 'false'},data:${data}}`);
}