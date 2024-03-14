'use strict'

const forever = require('forever')

const child = new (forever.Monitor)('./dist/server.js', {
  // options : options
})

// These events not required, but I like to hear about it.
child.on('exit', function () {
  console.log('./dist/server.js has exited!')
})
child.on('restart', function () {
  console.log('./dist/server.js has restarted.')
})
child.on('watch:restart', function (info) {
  console.error('Restarting script because ' + info.file + ' changed')
})

// These lines actually kicks things off.
child.start()
forever.startServer(child)

// You can catch other signals too
process.on('SIGINT', function () {
  console.log("\nGracefully shutting down \'node forever\' from SIGINT (Ctrl-C)")
  // some other closing procedures go here
  process.exit()
})

process.on('exit', function () {
  console.log('About to exit \'node forever\' process.')
})

// Sometimes it helps...
process.on('uncaughtException', function (err) {
  console.log('Caught exception in \'node forever\': ' + err)
})
