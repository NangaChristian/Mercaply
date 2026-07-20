const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const imports = `import adminRoutes from "./server/routes/admin.js";
import paymentRoutes from "./server/routes/payments.js";`;

content = content.replace('import dotenv from "dotenv";', `import dotenv from "dotenv";\n${imports}`);

const routes = `  // API routes FIRST
  app.use("/api/admin", adminRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/fapshi", paymentRoutes);`;

content = content.replace('  // API routes FIRST', routes);

fs.writeFileSync('server.ts', content);
