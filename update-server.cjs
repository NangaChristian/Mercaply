const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Add import
content = content.replace('import paymentRoutes from "./server/routes/payments.js";', 'import paymentRoutes from "./server/routes/payments.js";\nimport orderRoutes from "./server/routes/orders.js";');

// Mount route
const routes = `  // API routes FIRST
  app.use("/api/admin", adminRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/fapshi", paymentRoutes);
  app.use("/api/orders", orderRoutes);`;

content = content.replace(/  \/\/ API routes FIRST[\s\S]*?app\.use\("\/api\/fapshi", paymentRoutes\);/, routes);

fs.writeFileSync('server.ts', content);
