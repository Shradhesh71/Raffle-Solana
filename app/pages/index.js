import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

import Header from "../components/Header";
import PotCard from "../components/PotCard";
import Table from "../components/Table";
import Footer from "../components/Footer";
import style from "../styles/Home.module.css";
import { AppProvider } from "../context/context";

export default function Home() {
  // const endpoint = clusterApiUrl(WalletAdapterNetwork.Devnet);
  // const endpoint = "https://solana-devnet.rpcprovider.com";
  // const endpoint = "https://solana-devnet.g.alchemy.com/v2/pqmbh7GUUW8TL3-W8zdaHusUATir33ZK";
  const endpoint = "https://rpc.ankr.com/solana_devnet";

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppProvider>
            <div className={style.wrapper}>
              <Header />
              <PotCard />
              <Table />
              <Footer/>
            </div>
          </AppProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}