import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.thebidvault.app",
  appName: "The Bid Vault",
  webDir: "capacitor-static",
  server: {
    androidScheme: "https",
  },
};

export default config;
