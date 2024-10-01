import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import style from "../styles/PotCard.module.css";
import { shortenPk } from "../utils/helper";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "../context/context";
// Temp imports
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

const PotCard = () => {
  const {
    connected,
    isMasterInitialized,
    lotteryId,
    lotteryPot,
    initMaster,
    createLottery,
    buyTicket,
    isLotteryAuthority,
    pickWinner,
    isFinished,
    canClaim,
    lotteryHistory,
    claimPrize,
  } = useAppContext();
  console.log(connected, " :Connection established status");
  // console.log(canClaim," :canClaim status");

  // Static Data
  // const lotteryHistory = [
  //   {
  //     lotteryId: 3,
  //     winnerId: 3,
  //     winnerAddress: new PublicKey("11111111111111111111111111111111"),
  //     prize: "15",
  //   },
  // ];

  // Static States:

  // Is Wallet connected?
  // const [connected, setConnected] = useState(true)

  // Did the connected wallet create the lottery?
  // const isLotteryAuthority = true;

  // Is the master created for smart contract?
  // const [isMasterInitialized, setIsMasterInitialized] = useState(true)

  // Is there already a winner for the lottery?
  // const [isFinished, setIsFinished] = useState(false);
  // // If there is a winner can that winner claim the prize?
  // const [canClaim, setCanClaim] = useState(false);

  // Static Functions
  // const pickWinner = () => {
  //   setCanClaim(true);
  //   console.log(
  //     "Picking a winner and allowing that winner to claim the ticket"
  //   );
  // };
  // const claimPrize = () => {
  //   setCanClaim(false);
  //   console.log("You're the winner! Claiming your prize now...");
  // };

  if (!isMasterInitialized)
    return (
      <div className={style.wrapper}>
        <div className={style.title}>
          Lottery <span className={style.textAccent}>#{lotteryId}</span>
        </div>
        {connected ? (
          <>
            <div className={style.btn} onClick={initMaster}>
              Initialize master
            </div>
          </>
        ) : (
          // Wallet multibutton goes here
          <WalletMultiButton />
        )}
      </div>
    );

  return (
    <div className={style.wrapper}>
      <Toaster />
      <div className={style.title}>
        Lottery <span className={style.textAccent}>#{lotteryId}</span>
      </div>
      <div className={style.pot}>Pot 🍯: {lotteryPot} SOL</div>
      <div className={style.recentWinnerTitle}>🏆Recent Winner🏆</div>
      <div className={style.winner}>
        {lotteryHistory?.length &&
          shortenPk(
            lotteryHistory[lotteryHistory.length - 1].winnerAddress.toBase58()
          )}
      </div>
      {connected ? (
        <>
          {!isFinished && (
            <div className={style.btn} onClick={buyTicket}>
              Enter
            </div>
          )}

          {isLotteryAuthority && !isFinished && (
            <div className={style.btn} onClick={pickWinner}>
              Pick Winner
            </div>
          )}

          {canClaim && (
            <div className={style.btn} onClick={claimPrize}>
              Claim prize
            </div>
          )}

          <div className={style.btn} onClick={createLottery}>
            Create lottery 🖊️
          </div>
        </>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
};

export default PotCard;
