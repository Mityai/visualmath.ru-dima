export default {
  'development': {
    mongoose: {
      uri: 'mongodb://localhost/visualmath'
    }
  },
  'production': {
    mongoose: {
      uri: 'mongodb://localhost/visualmath'
    }
  }
}[process.env.NODE_ENV || 'development']
