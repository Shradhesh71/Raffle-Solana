export const mockWallet = () => {
  return {};
};

export const shortenPk = (pk, chars = 5) => {
  const pkStr = typeof pk === "object" ? pk.toBase58() : pk;
  return `${pkStr.slice(0, chars)}...${pkStr.slice(-chars)}`;
};

export const confirmTx = async (txHash, connection) => {
  console.log("here");
  const blockhashInfo = await connection.getLatestBlockhash();
  console.log("confirmTx: ",blockhashInfo)
  console.log("confirmTx 2: ",blockhashInfo.blockhash)
  
  await connection.confirmTransaction({
    blockhash: blockhashInfo.blockhash,
    lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
    signature: txHash,
  });
};
