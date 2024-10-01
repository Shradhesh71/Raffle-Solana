import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import style from "../styles/Header.module.css";

const Header = () => {
  return (
    <div className={style.wrapper}>
      <div className={style.title}>Decentralized Lottery 💰</div>
      <WalletMultiButton/>
    </div>
  );
};

export default Header;
