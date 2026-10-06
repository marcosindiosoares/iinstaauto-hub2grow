import { type NextRequest, NextResponse } from "next/server"

// Senha única no site inteiro (painel + API). Só ficam abertos os endereços
// que a Meta chama sozinha (webhook e retorno do login) e a política de
// privacidade, que a Meta exige pública.
const PUBLIC_PATHS = ["/api/instagram/webhook", "/api/instagram/callback", "/privacy"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next()
  }

  const password = process.env.APP_PASSWORD
  if (!password) {
    return new NextResponse("APP_PASSWORD não configurada", { status: 503 })
  }

  const header = request.headers.get("authorization") || ""
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6))
    const given = decoded.slice(decoded.indexOf(":") + 1)
    if (given === password) return NextResponse.next()
  }

  return new NextResponse("Acesso restrito", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="InstaAuto Hub2Grow"' },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
}
