import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";

export const metadata = {
  title: "PYUSD Payments App",
  description: "A Web3 DeFi/payments app powered by PayPal USD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
