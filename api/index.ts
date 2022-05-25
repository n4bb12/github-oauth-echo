import { VercelRequest, VercelResponse } from "@vercel/node"
import axios from "axios"

const client_id = process.env.GITHUB_CLIENT_ID
const client_secret = process.env.GITHUB_CLIENT_SECRET
const cookieName = "github-oauth-echo"

export default async function (req: VercelRequest, res: VercelResponse) {
  const user = JSON.parse(req.cookies[cookieName] || "null")
  const code = req.query.code

  if (user) {
    return res.json(user)
  }

  if (code) {
    const tokenRes = await axios({
      method: "POST",
      url: "https://github.com/login/oauth/access_token",
      params: { code, client_id, client_secret },
      headers: { Accept: "application/json" },
    })

    const userRes = await axios({
      method: "GET",
      url: "https://api.github.com/user",
      headers: { Authorization: `${tokenRes.data.token_type} ${tokenRes.data.access_token}` },
    })

    const setCookie = `${cookieName}=${JSON.stringify(userRes.data)}`

    return res.setHeader("Set-Cookie", setCookie).redirect("/api")
  }

  return res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}`)
}
