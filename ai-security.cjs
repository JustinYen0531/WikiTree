function trustedAiRequest(req) {
  const remote = req.socket.remoteAddress;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)) return false;
  try {
    const host = new URL(`http://${req.headers.host}`).hostname;
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) return false;
    if (req.headers.origin) {
      const origin = new URL(req.headers.origin);
      if (!['http:', 'https:'].includes(origin.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)) return false;
    }
    return req.headers['x-wikitree-ai'] === '1';
  } catch { return false; }
}

module.exports = { trustedAiRequest };
