const getClientIp = (req) => {
  // If behind proxy (nginx, render, vercel)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();

  return req.socket.remoteAddress || req.ip;
};

module.exports = getClientIp;
