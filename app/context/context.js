import { createContext, useContext, useMemo, useEffect, useState } from "react";
import { BN } from "@project-serum/anchor";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { bs58 } from "bs58";

import {
  getLotteryAddress,
  getMasterAddress,
  getProgram,
  getTicketAddress,
  getTotalPrize,
} from "../utils/program";
import { confirmTx, mockWallet } from "../utils/helper";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [masterAddress, setMasterAddress] = useState();
  const [initialized, setInitialized] = useState(false);
  const [lotteryId, setLotteryId] = useState();
  const [lotteryPot, setLotteryPot] = useState();
  const [lottery, setLottery] = useState();
  const [lotteryAddress, setLotteryAddress] = useState();
  const [userWinningId, setUserWinningId] = useState(false);
  const [lotteryHistory, setLotteryHistory] = useState([]);

  // get provider
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connection) {
      return getProgram(connection, wallet ?? mockWallet);
    }
  }, [connection, wallet]);

  useEffect(() => {
    updateState();
  }, [program]);

  useEffect(() => {
    if (!lottery) return;
    getPot();
    getHistory();
  }, [lottery]);

  const getPot = async () => {
    const pot = getTotalPrize();
    setLotteryPot(pot);
  };

  const getHistory = async () => {
    if (!lotteryId) return;

    const history = [];

    for (const i in new Array(lotteryId).fill(null)) {
      const id = lotteryId - parseInt(i);
      // console.log("id: ", id);
      // console.log("lotteryId: ", lotteryId);
      if (!id) break;

      const lotteryAddress = await getLotteryAddress(id);
      const lottery = await program.account.lottery.fetch(lotteryAddress);

      const winnerId = lottery.winnerId;
      // console.log("winnerId: ", winnerId);
      if (!winnerId) continue;

      const ticketAddress = await getTicketAddress(lotteryAddress, winnerId);
      const ticket = await program.account.ticket.fetch(ticketAddress);

      history.push({
        lotteryId: id,
        winnerId,
        winnerAddress: ticket.authority,
        prize: getTotalPrize(lottery),
      });
    }
    // console.log("history: " + history);

    setLotteryHistory(history);
  };

  const updateState = async () => {
    if (!program) return;

    try {
      if (!masterAddress) {
        // get mastewr address
        const masterAddress = await getMasterAddress();
        // how to we save master address
        setMasterAddress(masterAddress);
      }
      const master = await program.account.master.fetch(
        masterAddress ?? (await getMasterAddress())
      );
      setInitialized(true);
      setLotteryId(master.lastId);

      const lotteryAddress = await getLotteryAddress(master.lastId);
      setLotteryAddress(lotteryAddress);
      const lottery = await program.account.lottery.fetch(lotteryAddress);
      setLottery(lottery);

      // Get user's tickets for the current lottery
      if (!wallet?.publicKey) return;
      const userTicket = await program.account.ticket
        .all
        //   [
        //   {
        //     memcmp: {
        //       bytes: bs58.encode(new BN(lotteryId).toArrayLike(Buffer, "le", 4)),
        //       offset: 12,
        //     },
        //   },
        //   { memcmp: { bytes: wallet.publicKey.toBase58(), offset: 16 } },
        // ]
        ();

      // Check whether any of the user tickets win
      const userWin = userTicket.some((t) => t.account.id === lottery.winnerId);
      if (userWin) {
        setUserWinningId(lottery.winnerId);
      } else {
        setUserWinningId(null);
      }

      console.log("masterAddress: ", masterAddress);
    } catch (error) {
      console.log(error);
    }
  };

  // call solana program instruction initMaster
  const initMaster = async () => {
    // setError("");
    // setSuccess("");
    console.log("Running");
    try {
      console.log("here: ", masterAddress);
      const txHash = await program.methods
        .initMaster()
        .accounts({
          master: masterAddress,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("txHash: " + txHash);
      await confirmTx(txHash, connection);

      updateState();
      toast.success("Initialized Master");
    } catch (err) {
      console.log("err.message: ", err.message);
      console.log("error: ", err);
      // setError(err.message);
      toast.error("Initializing FAILED!");
    }
  };

  const createLottery = async () => {
    try {
      const lotteryAddress = await getLotteryAddress(lotteryId + 1);
      const txHash = await program.methods
        .createLottery(new BN(1).mul(new BN(LAMPORTS_PER_SOL)))
        .accounts({
          // lottery:lotteryAddress,
          lottery: "CZ4jrCHZrSPGYWZj5jsjrBpAfcmz2eFpJe9bUL8wvDJg",
          master: masterAddress,
          // master:"7Rf4ENGoSyNDZptcxP9VJmxV8rck6PaYkwfM3zGcjryw",
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("here createdlottery after rpc");
      await confirmTx(txHash, connection);

      updateState();
      toast.success("Lottery Created!");
    } catch (err) {
      console.log("err.message: ", err.message);
      console.log("error: ", err);
      toast.error(err.message);
    }
  };

  const buyTicket = async () => {
    try {
      const ticketAddress = await getTicketAddress(
        lotteryAddress,
        lottery.lastTicketId + 1
      );
      const txHash = await program.methods
        .buyTicket(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          ticket: ticketAddress,
          buyer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);
      updateState();
      toast.success("Bought a ticket");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pickWinner = async () => {
    try {
      const txHash = await program.methods
        .pickWinner(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          authority: wallet.publicKey,
        })
        .rpc();
      await confirmTx(txHash, connection);
      updateState();
      toast.success("Picked a winner");
    } catch (err) {
      toast.error(err.message);
      console.log(err.message);
    }
  };

  const claimPrize = async () => {
    try {
      const txHash = await program.methods
        .claimPrize(lotteryId, userWinningId)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(lotteryAddress, userWinningId),
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);
      updateState();
      toast.success("Claimed prize");
    } catch (err) {
      toast.error(err.message);
      console.log(err.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Put functions/variables you want to bring out of context to App in here
        connected: wallet?.publicKey ? true : false,
        isMasterInitialized: initialized,
        lotteryId,
        lotteryPot,
        isLotteryAuthority:
          wallet && lottery && wallet.publicKey.equals(lottery.authority),
        isFinished: lottery && lottery.winnerId,
        canClaim: lottery && !lottery.claimed && userWinningId,
        lotteryHistory,
        initMaster,
        createLottery,
        buyTicket,
        pickWinner,
        claimPrize,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
