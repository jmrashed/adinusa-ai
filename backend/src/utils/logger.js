const prefix = '[Adinusa Backend]';
module.exports = {
  info: (msg) => console.log(`${prefix} [INFO] ${msg}`),
  warn: (msg) => console.warn(`${prefix} [WARN] ${msg}`),
  error: (msg) => console.error(`${prefix} [ERROR] ${msg}`),
};
