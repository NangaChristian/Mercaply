module.exports = {
  apps: [
    {
      name: "react-app-server",
      script: "./dist/server.cjs",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
