import fs from 'fs';
import path from 'path';

// Calculate path based on process.cwd() to handle dev and prod uniformly
const CONFIG_PATH = path.join(process.cwd(), 'server', 'data', 'config.json');

const DEFAULT_CONFIG = {
  commission_percentage: 5.0,
  integrations: [
    {
      id: 'fapshi',
      provider: 'Fapshi API',
      type: 'payment',
      isActive: false,
      config: {
        apiUser: '',
        apiKey: '',
        baseUrl: 'https://sandbox.fapshi.com'
      }
    },
    {
      id: 'smtp_hostinger',
      provider: 'Hostinger SMTP',
      type: 'email',
      isActive: false,
      config: {
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        user: '',
        pass: '',
        from: 'contact@mercaply.com'
      }
    }
  ]
};

export const getConfig = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      // Merge with default to ensure keys exist
      return { ...DEFAULT_CONFIG, ...parsed, integrations: parsed.integrations || DEFAULT_CONFIG.integrations };
    }
  } catch (err) {
    console.error('Error reading config:', err);
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = (newConfig: any) => {
  try {
    if (!fs.existsSync(path.dirname(CONFIG_PATH))) {
      fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
  } catch (err) {
    console.error('Error saving config:', err);
  }
};
