import { ethers } from "ethers"
import {
  fDAIxcontract,
  fDAIcontract,
  cfav1Contract,
  qProvider,
  fDAIxAddress,
  fDAIAddress,
  cfv1Address,
} from "../utils/const"

export const wrapOrUnwrap = async (type: string, amount: string) => {
  console.log("Inside wrapOrUnwrap", type, amount)
  let contract: ethers.Contract
  if (type == "wrap") {
    contract = fDAIcontract
  } else {
    contract = fDAIxcontract
  }

  const approveTx = await contract.populateTransaction.approve(fDAIxAddress, ethers.utils.parseEther(amount))
  const actionTx =
    type == "wrap"
      ? await fDAIxcontract.populateTransaction.upgrade(ethers.utils.parseEther(amount))
      : await fDAIxcontract.populateTransaction.downgrade(ethers.utils.parseEther(amount))

  const tx1 = {
    to: type == "wrap" ? fDAIAddress : fDAIxAddress,
    data: approveTx.data || "0x0",
  }
  const tx2 = {
    to: fDAIxAddress,
    data: actionTx.data || "0x0",
  }

  const txs = [tx1, tx2]
  // const txResponse = await smartAccount.sendTransactionBatch({ transactions: txs })
  // const txHash = await txResponse.wait()
  // console.log({ txHash })
  // getDetails()
  console.log(txs)
  return txs
}

const WrapUnwrap = ({ item }: any) => {
  return (
    <div className="card p-0 w-96 bg-fbg">
      <div className="card-body items-center text-center p-6 space-y-2">
        <h2 className=" text-lg font-medium hover:text-orange60">Wrap/Unwrap</h2>
        <input
          type="text"
          value={item.amount}
          onChange={(e) => item.setAmount(e.target.value)}
          placeholder="Enter amount"
          className="rounded-md border px-3 py-2 transition-colors border-gray40 bg-blue18 hover:border-blue36 hover:bg-blue24 hover:focus-within:border-blue60 hover:focus-within:bg-blue10 focus:border-blue60 focus:bg-blue10 w-full max-w-xs"
        />
        <div className="card-actions justify-end">
          <button className="btn" onClick={() => item.setOperation("wrap")}>
            Wrap
          </button>
          <button className="btn" onClick={() => item.setOperation("unwrap")}>
            Unwrap
          </button>
        </div>
      </div>
    </div>
  )
}

export default WrapUnwrap
