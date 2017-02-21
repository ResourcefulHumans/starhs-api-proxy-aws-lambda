import nconf from 'nconf'

nconf.use('memory')

nconf
  .env({
    whitelist: [
      'starhsapi__key',
      'starhsapi__user',
      'starhsapi__password',
      'mount_url',
      'version',
      'deploy_time'
    ],
    lowerCase: true,
    separator: '__'
  })

nconf.defaults({
  'environment': process.env.NODE_ENV,
  'mount_url': 'https://api.example.com/',
  'starhsapi': {
    'key': 'myapikey',
    'user': 'apiuser',
    'password': 'apipass'
  },
  'version': '0.0.0-development',
  'deploy_time': Date.now()
})

export default nconf
