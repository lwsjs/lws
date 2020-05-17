module.exports = [
  {
    name: 'port',
    alias: 'p',
    type: Number,
    description: 'The port number to listen on.',
    section: 'server'
  },
  {
    name: 'hostname',
    type: String,
    description: 'The hostname or IP address to bind to. Defaults to 0.0.0.0 (any host).',
    section: 'server'
  },
  {
    name: 'max-connections',
    type: Number,
    description: 'The maximum number of concurrent connections supported by the server.',
    section: 'server'
  },
  {
    name: 'keep-alive-timeout',
    type: Number,
    description: 'The period (in milliseconds) of inactivity a connection will remain open before being destroyed. Set to `0` to keep connections open indefinitely.',
    section: 'server'
  },
  {
    name: 'https',
    type: Boolean,
    description: 'Enable HTTPS using a built-in TLS certificate registered to the hosts 127.0.0.1 and localhost.',
    section: 'tls'
  },
  {
    name: 'http2',
    type: Boolean,
    description: 'Enable HTTP2 using a built-in TLS certificate registered to the hosts 127.0.0.1 and localhost.',
    section: 'tls'
  },
  {
    name: 'key',
    type: String,
    typeLabel: '{underline file}',
    description: 'Private key. Supply along with --cert to launch a https server.',
    section: 'tls'
  },
  {
    name: 'cert',
    type: String,
    typeLabel: '{underline file}',
    description: 'Certificate chain. Supply along with --key to launch a https server.',
    section: 'tls'
  },
  {
    name: 'pfx',
    type: String,
    typeLabel: '{underline file}',
    description: 'Optional PFX or PKCS12 encoded private key and certificate chain. An alternative to providing --key and --cert.',
    section: 'tls'
  },
  {
    name: 'ciphers',
    type: String,
    description: 'Optional cipher suite specification, replacing the default.',
    section: 'tls'
  },
  {
    name: 'secure-protocol',
    type: String,
    description: 'Optional SSL method to use, default is "SSLv23_method".',
    section: 'tls'
  },
  {
    name: 'stack',
    type: String,
    multiple: true,
    description: 'Construct a middleware stack using the modules provided.',
    typeLabel: '{underline path} {underline ...}',
    section: 'extension'
  },
  {
    name: 'view',
    type: String,
    description: 'A path to a custom view module',
    typeLabel: '{underline path}',
    section: 'extension'
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Print these usage instructions.',
    section: 'core'
  },
  {
    name: 'version',
    type: Boolean,
    description: 'Print the version number.',
    section: 'core'
  },
  {
    name: 'config-file',
    alias: 'c',
    type: String,
    description: 'Filename to retrieve stored config from. Defaults to "lws.config.js".',
    typeLabel: '{underline file}',
    section: 'core'
  },
  {
    name: 'config',
    type: Boolean,
    description: 'Print the active config.',
    section: 'core'
  },
  {
    name: 'open',
    alias: 'o',
    type: Boolean,
    description: 'Automatically open the default system browser.',
    section: 'core'
  },
  {
    name: 'list-network-interfaces',
    type: Boolean,
    description: 'Print a list of available network interfaces. Used in conjunction with `--qr`.',
    section: 'core'
  }
]
