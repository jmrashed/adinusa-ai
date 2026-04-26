module.exports = {
  apps: [
    {
      name: 'adinusa-ai-backend',
      script: './src/app.js',
      cwd: __dirname,
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode for scalability
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
