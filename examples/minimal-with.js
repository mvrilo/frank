with (require('../lib/frank')()) {
  get('/').send('minimal api ftw');
  log('tiny');
  run(8800);
}
