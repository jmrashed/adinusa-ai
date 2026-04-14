const prefix = '[Adinusa Backend]';
module.exports = {
  info: (msg) => console.log(`${prefix} [INFO] ${msg}`),
  error: (msg) => console.error(`${prefix} [ERROR] ${msg}`),
};
