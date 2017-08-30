export default function loadAuth(req) {
  console.info('loading auth')
  console.info(`req: ${!!req}`)
  console.info(`req.session: ${!!req.session}`)
  console.info(`req.session.user: ${!!req.session.user}`)
  return Promise.resolve(req.session.user || null);
}
