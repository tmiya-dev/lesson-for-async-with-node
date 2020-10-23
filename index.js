const fs = require('fs');
const downloadPath = './downloads'
if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath);
}
const files = fs.readdirSync(downloadPath);
for (const file of files) {
  fs.unlinkSync(downloadPath + '/' + file);
}
const sourcesPath = './sources.json';
const sources = require(sourcesPath);
if (!Array.isArray(sources)) {
  console.error(`sources must be array of URLs: ${sourcesPath}`);
} else {
  const Path = require('path');
  const axios = require('axios');
  const downloadFile = (sources) => {
    return new Promise((resolve, reject) => {
      if (sources.length === 0) {
        resolve();
        return;
      }
      const url = sources.shift();
      const fileName = Path.basename(url);
      const ws = fs.createWriteStream(downloadPath + '/' + fileName);
      ws.on('finish', () => {
        downloadFile(sources).then(() => {
          resolve();
        })
      });
      ws.on('error', reject);
      console.log('GET ' + url);
      axios.get(url, { responseType: 'stream' }).then((res) => {
        res.data.pipe(ws);
      }).catch((err) => {
        throw err;
      });
    })
  }
  downloadFile(sources).then(() => {
    console.log('finished');
  }).catch((err) => {
    console.error(err);
  })
}
