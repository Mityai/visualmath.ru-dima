export default function logout(req) {
  console.info('logout')
  return new Promise((resolve) => {
    req.session.destroy(() => {
      req.session = null;
      console.info('logout ok')
      return resolve(null);
    });
  });
}
