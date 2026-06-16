import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.thebidvault.app",
  appName: "The Bid Vault",
  webDir: "capacitor-static",
  server: {
    url: "https://the-bid-vault-frx2.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },
};

export default config;
