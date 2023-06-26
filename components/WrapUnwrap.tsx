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
    <div className="card w-96 border-2 border-secondary">
      <div className="card-body items-center text-center">
        <input
          type="text"
          value={item.amount}
          onChange={(e) => item.setAmount(e.target.value)}
          placeholder="Enter amount"
          className="input input-bordered input-primary w-full max-w-xs"
        />
        <div className="card-actions justify-end">
          <button className="btn btn-neutral" onClick={() => item.setOperation("wrap")}>
            Wrap
          </button>
          <button className="btn btn-neutral" onClick={() => item.setOperation("unwrap")}>
            Unwrap
          </button>
        </div>
      </div>
    </div>
  )
}

export default WrapUnwrap
