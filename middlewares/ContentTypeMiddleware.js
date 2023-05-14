export const contentType = (req, res, next) => {
    const expectedContentType = 'application/json'
  
    if (req.headers['content-type'] !== expectedContentType) {
      return res.status(415).json({ error: 'Unsupported Media Type' })
    }
  
    next();
}
  

  