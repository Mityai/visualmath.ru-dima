import mongoose from 'mongoose'

export default config => {
  // connected or connecting
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return mongoose
  }

  mongoose.connect(config.mongoose.uri)

  mongoose.connection.on('error', err => {
    console.error('Connection error:', err.message)
  })

  mongoose.connection.once('open', () => {
    console.info('Connected to DB!')
  })
  
  return mongoose
}
