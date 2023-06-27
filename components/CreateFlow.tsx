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
import { useState } from "react"

export const createFlow = async (smartAccount: SmartAccount, receiverAdd: string, flowRate: any) => {
  // console.log("Create flow:", smartAccount.address, receiverAdd, flowRate)

  const createFlowTx = await cfav1Contract.populateTransaction.createFlow(
    fDAIxAddress,
    smartAccount.address,
    receiverAdd,
    flowRate,
    "0x"
  )
  const tx = {
    to: cfv1Address,
    data: createFlowTx.data || "0x0",
  }

  // const txResponse = await smartAccount.sendTransaction({ transaction: tx })
  // const txHash = await txResponse.wait()
  // console.log({ txHash })
  console.log("Create flow:", tx)
  return tx
}

const CreateFlow = ({ item }: any) => {
  const [flowRateDisplay, setFlowRateDisplay] = useState("0")

  const handleFlowRateChange = (e: string) => {
    item.setFlowRate(e)
    let newFlowRateDisplay = calculateFlowRate(e as any)
    setFlowRateDisplay(newFlowRateDisplay.toString())
  }

  function calculateFlowRate(amount: Number) {
    if (typeof Number(amount) !== "number" || isNaN(Number(amount)) === true) {
      alert("You can only calculate a flowRate based on a number")
      return
    } else if (typeof Number(amount) === "number") {
      if (Number(amount) === 0) {
        return 0
      }
      const amountInWei = ethers.BigNumber.from(amount)
      const monthlyAmount: any = ethers.utils.formatEther(amountInWei.toString())
      const calculatedFlowRate: any = monthlyAmount * 3600 * 24 * 30
      return calculatedFlowRate
    }
  }

  return (
    <div className="card w-96 border-2 border-secondary">
      <div className="card-body items-center text-center">
        <h2 className="card-title">Create Flow</h2>
        <input
          type="text"
          value={item.address}
          onChange={(e) => item.setAddress(e.target.value)}
          placeholder="Receiver Address"
          className="input input-bordered input-primary w-full max-w-xs"
        />
        <input
          type="text"
          value={item.flowRate}
          onChange={(e) => handleFlowRateChange(e.target.value)}
          placeholder="Flow Rate"
          className="input input-bordered input-primary w-full max-w-xs"
        />
        {/* <div className="card-actions justify-end">
          <button className="btn btn-neutral" onClick={createFlow}>
            Create Flow
          </button>
        </div> */}
        <h3>{flowRateDisplay} Currency/month</h3>
      </div>
    </div>
  )
}

export default CreateFlow
