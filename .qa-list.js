const https = require('https');
const crypto = require('crypto');
const BUCKET = 'hui-memories-1312522042', REGION = 'ap-guangzhou';
const SECRET_ID = process.env.TSID, SECRET_KEY = process.env.TSKEY;
const sha1hex = s => crypto.createHash('sha1').update(s).digest('hex');
const hmac = (k, s) => crypto.createHmac('sha1', k).update(s).digest('hex');
const now = Math.floor(Date.now() / 1000), exp = now + 300, keyTime = `${now};${exp}`;
const signKey = hmac(SECRET_KEY, keyTime);
const uri = '/';
const httpString = `get\n${uri}\n\n\n`;
const stringToSign = `sha1\n${keyTime}\n${sha1hex(httpString)}\n`;
const signature = hmac(signKey, stringToSign);
const q = `q-sign-algorithm=sha1&q-ak=${SECRET_ID}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=&q-url-param-list=&q-signature=${signature}`;
https.get({ hostname: `${BUCKET}.cos.${REGION}.myqcloud.com`, path: uri + '?' + q }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const keys = [...d.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1]);
    console.log(keys.length + ' 个对象:');
    keys.forEach(k => console.log('  "' + k + '"'));
  });
}).on('error', e => console.log('ERR', e.message));
