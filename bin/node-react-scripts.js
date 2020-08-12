#!/usr/bin/env node

// module dependencies
const path = require('path')
const { spawn } = require('child_process')
const waitOn = require('wait-on')
const yargs = require('yargs')
const pjson = require('../package.json')

// ensure server port
const ports = {
  http: process.env.REACT_PORT || 1337,
  react: process.env.REACT_PORT || 3000
}

// node bin
let bindir = path.join(process.cwd(), 'node_modules/.bin')
let bin = {
  nodemon: path.join(bindir, 'nodemon'),
  reactScripts: path.join(bindir, 'react-scripts')
}
// use .cmd alternatives on win32
if (process.platform === 'win32') {
  Object.keys(bin).forEach(key => {
    bin[key] += '.cmd'
  })
}

yargs
  .usage('$0 <cmd> [args]')
  // start command
  .command(
    'start [show-fps]',
    'Start node & react development servers',
    yargs => {
      yargs.option('show-fps', {
        type: 'boolean',
        describe: 'Show fps counter'
      })
    },
    argv => {
      let react = spawn(bin.reactScripts, ['start'], {
        env: {
          // extend env
          ...process.env,
          BROWSER: 'none',
          PORT: ports.react
        },
        stdio: 'pipe'
      })
      react.stdout.on('data', data => process.stdout.write(data))
      react.stderr.on('data', data => process.stderr.write(data))

      waitOn({
        resources: ['tcp:' + ports.react],
        timeout: 30 * 1000
      }, err => {
        if (err) {
          console.error(err)
          process.exit(1)
        }

        let args = [path.join(process.cwd(), pjson.main)]
        if (argv['show-fps']) args.push('--show-fps')

        // spawn nodemon
        let nodemon = spawn(bin.nodemon, args, {
          env: {
            // extend env
            ...process.env,
            PORT: ports.http
          }
        }, {
          stdio: 'pipe'
        })
        nodemon.stdout.on('data', data => process.stdout.write(data))
        nodemon.stderr.on('data', data => process.stderr.write(data))
      })
    }
  )
  // browser command
  .command('browser', 'Start *only* react development server', argv => {
    const react = spawn(bin.reactScripts, ['start'], {
      env: {
        ...process.env,
        PORT: ports.react
      },
      shell: true,
      stdio: 'inherit'
    })
  })
  // build command
  .command(
    'build [dir]',
    'Build react',
    argv => {
      spawn(bin.reactScripts, ['build'], {
        shell: true,
        stdio: 'inherit'
      })
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .version(pjson.version)
  .help()
  .argv
