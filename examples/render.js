var frank = require('../lib/frank'),
    server = frank();

server
  .get('/')
  .render('jade', './public/text.jade', {
    name: 'murilo',
    email: 'mvrilo@gmail.com'
  });

server
  .get('/jade')
  .render('./public/text.jade', { // this also works!
    name: 'murilo',
    email: 'mvrilo@gmail.com'
  });

server.listen(8000)
