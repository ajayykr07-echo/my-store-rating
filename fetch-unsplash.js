const https = require('https');

const options = {
  hostname: 'unsplash.com',
  path: '/photos/a-store-front-with-a-white-awning-wxKh0THYy1Q',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/g);
    if (match) {
      console.log(match[0]);
    } else {
      console.log('Not found');
    }
  });
});
