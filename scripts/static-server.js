const http = require('http');
const fs = require('fs');
const path = require('path');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 8090);
const root = path.join(process.cwd(), 'dist');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    });
    res.end(data);
  });
}

http
  .createServer((req, res) => {
    const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const requestPath = rawPath === '/' ? '/index.html' : rawPath;
    let filePath = path.join(root, requestPath);

    if (!path.extname(filePath)) {
      filePath = path.join(root, 'index.html');
    }

    if (!filePath.startsWith(root)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(res, filePath);
        return;
      }

      sendFile(res, path.join(root, 'index.html'));
    });
  })
  .listen(port, host, () => {
    console.log(`Static server ready on http://${host}:${port}`);
  });
