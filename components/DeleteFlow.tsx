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
import SmartAccount from "@biconomy/smart-account"

export const deleteFlow = async (smartAccount: SmartAccount, receiverAdd: String) => {
  const deleteFlowTx = await cfav1Contract.populateTransaction.deleteFlow(
    fDAIxAddress,
    smartAccount.address,
    receiverAdd,
    "0x"
  )
  const tx = {
    to: cfv1Address,
    data: deleteFlowTx.data || "0x0",
  }

  // const txResponse = await smartAccount.sendTransaction({ transaction: tx })
  // const txHash = await txResponse.wait()
  // console.log({ txHash })
  return tx
}

const DeleteFlow = ({ item }: any) => {
  return (
    <div className="card p-0 w-96 bg-fbg">
      <div className="card-body items-center text-center p-6 space-y-2">
        <h2 className=" text-lg font-medium hover:text-orange60">Delete Flow</h2>
        <input
          type="text"
          onChange={(e) => item.setAddress(e.target.value)}
          placeholder="Receiver Address"
          className="input input-bordered input-primary w-full max-w-xs"
        />
        {/* <div className="card-actions justify-end">
          <button className="btn btn-neutral" onClick={deleteFlow}>
            Delete Flow
          </button>
        </div> */}
      </div>
    </div>
  )
}

export default DeleteFlow
