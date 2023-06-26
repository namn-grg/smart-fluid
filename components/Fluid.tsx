import React, { useEffect, useState } from "react"
import { BigNumber, Framework } from "@superfluid-finance/sdk-core"
// import GetSF from "../hooks/GetSF"
import SmartAccount from "@biconomy/smart-account"
import { ethers } from "ethers"
import { supererc20abi, erc20abi, CFAv1ForwarderABI } from "../utils"
/*
 There are 4 type of transaction in Superfluid

 1. Wrap and Unwrap - amount
 2. Create flow - flow rate and receiver address
 3. Update flow - flow rate and receiver address
 4. Delete flow - receiver address
                    token address was optional in all of them
 Also a faucet to get the test token if possible fDAI or fDAIx

 batch the approve and send txn
*/

interface Props {
  smartAccount: SmartAccount
  provider: any
}

const Fluid: React.FC<Props> = ({ smartAccount, provider }) => {
  const [amount, setAmount] = useState<string>("0.1")
  const [fDAIAmount, setFDAIAmount] = useState<string>("")
  const [fDAIxAmount, setFDAIxAmount] = useState<string>("")
  const [receiverAdd, setReceiverAdd] = useState<string>("")
  const [flowRate, setFlowRate] = useState<string>("0.1")
  const [flowRateDisplay, setFlowRateDisplay] = useState<string>("")
  const [finalArr, setFinalArr] = useState<any[]>([])

  const qProvider = new ethers.providers.JsonRpcProvider(
    "https://thrumming-quiet-yard.matic-testnet.discover.quiknode.pro/e8d17c21d6f86cdc291e6c8fa44a6868c51ee863/"
  )

  const fDAIxAddress = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
  const fDAIAddress = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7"
  const fDAIxcontract = new ethers.Contract(fDAIxAddress, supererc20abi, qProvider)
  const fDAIcontract = new ethers.Contract(fDAIAddress, erc20abi, qProvider)
  const cfav1Contract = new ethers.Contract("0xcfA132E353cB4E398080B9700609bb008eceB125", CFAv1ForwarderABI, qProvider)

  const getDetails = async () => {
    console.log("Inside getDetails")

    // const sf = Framework.create({
    //   chainId: 80001,
    //   provider,
    // })

    const fDAIx = await fDAIxcontract.balanceOf(smartAccount.address)
    const fDAI = await fDAIcontract.balanceOf(smartAccount.address)
    setFDAIAmount(ethers.utils.formatEther(fDAI))
    setFDAIxAmount(ethers.utils.formatEther(fDAIx))
  }

  const wrapOrUnwrap = async (type: string, contract: ethers.Contract) => {
    console.log("Inside wrapOrUnwrap")

    const approveTx = await contract.populateTransaction.approve(fDAIxAddress, ethers.utils.parseEther(amount))
    const actionTx =
      type == "wrap"
        ? await fDAIxcontract.populateTransaction.upgrade(ethers.utils.parseEther(amount))
        : await fDAIxcontract.populateTransaction.downgrade(ethers.utils.parseEther(amount))

    console.log("type", type)

    const tx1 = {
      to: type == "wrap" ? fDAIAddress : fDAIxAddress,
      data: approveTx.data || "0x0",
    }
    const tx2 = {
      to: fDAIxAddress,
      data: actionTx.data || "0x0",
    }

    const txs = [tx1, tx2]
    const txResponse = await smartAccount.sendTransactionBatch({ transactions: txs })
    const txHash = await txResponse.wait()
    console.log({ txHash })
    getDetails()
  }

  useEffect(() => {
    getDetails
  }, [])

  const createFlow = async () => {
    const createFlowTx = await cfav1Contract.populateTransaction.createFlow(
      fDAIxAddress,
      smartAccount.address,
      receiverAdd,
      flowRate,
      "0x"
    )
    const tx = {
      to: "0xcfA132E353cB4E398080B9700609bb008eceB125",
      data: createFlowTx.data || "0x0",
    }

    const txResponse = await smartAccount.sendTransaction({ transaction: tx })
    const txHash = await txResponse.wait()
    console.log({ txHash })
  }

  const updateFlow = async () => {
    const updateFlowTx = await cfav1Contract.populateTransaction.updateFlow(
      fDAIxAddress,
      smartAccount.address,
      receiverAdd,
      flowRate,
      "0x"
    )
    const tx = {
      to: "0xcfA132E353cB4E398080B9700609bb008eceB125",
      data: updateFlowTx.data || "0x0",
    }

    const txResponse = await smartAccount.sendTransaction({ transaction: tx })
    const txHash = await txResponse.wait()
    console.log({ txHash })
  }

  const deleteFlow = async () => {
    const deleteFlowTx = await cfav1Contract.populateTransaction.deleteFlow(
      fDAIxAddress,
      smartAccount.address,
      receiverAdd,
      "0x"
    )
    const tx = {
      to: "0xcfA132E353cB4E398080B9700609bb008eceB125",
      data: deleteFlowTx.data || "0x0",
    }

    const txResponse = await smartAccount.sendTransaction({ transaction: tx })
    const txHash = await txResponse.wait()
    console.log({ txHash })
  }

  const handleFlowRateChange = (e: any) => {
    setFlowRate(() => e)
    let newFlowRateDisplay = calculateFlowRate(e)
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

  function finalSubmit() {}

  return (
    <div className="flex flex-col items-center justify-around min-h-screen">
      <button onClick={getDetails} className="btn btn-primary">
        Get Details
      </button>
      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <h3 className="">fDAI: {fDAIAmount}</h3>
          <h3 className="">fDAIx: {fDAIxAmount}</h3>
        </div>
      </div>

      <div className="card w-96 border-2 border-secondary">
        <button className="btn">Wrap or Unwrap</button>
        <button className="btn"> Create Flow</button>
        <button className="btn"> Update Flow</button>
        <button className="btn"> Delete flow</button>
      </div>

      {/* Wrap/Unwrap div */}
      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <input
            type="text"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount of fDAI"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <div className="card-actions justify-end">
            <button className="btn btn-neutral" onClick={() => wrapOrUnwrap("wrap", fDAIcontract)}>
              Wrap
            </button>
            <button className="btn btn-neutral" onClick={() => wrapOrUnwrap("unwrap", fDAIxcontract)}>
              Unwrap
            </button>
          </div>
        </div>
      </div>

      {/* Create flow div */}
      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <input
            type="text"
            onChange={(e) => setReceiverAdd(e.target.value)}
            placeholder="Receiver Address"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <input
            type="text"
            onChange={(e) => handleFlowRateChange(e.target.value)}
            placeholder="Flow Rate"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <div className="card-actions justify-end">
            <button className="btn btn-neutral" onClick={createFlow}>
              Create Flow
            </button>
          </div>
          <h3>{flowRateDisplay} Currency/month</h3>
        </div>
      </div>

      {/* Update flow div */}
      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <input
            type="text"
            onChange={(e) => setReceiverAdd(e.target.value)}
            placeholder="Receiver Address"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <input
            type="text"
            onChange={(e) => handleFlowRateChange(e.target.value)}
            placeholder="Flow Rate"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <div className="card-actions justify-end">
            <button className="btn btn-neutral" onClick={updateFlow}>
              Update Flow
            </button>
          </div>
          <h3>{flowRateDisplay} Currency/month</h3>
        </div>
      </div>

      {/* Delete flow div */}
      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <input
            type="text"
            onChange={(e) => setReceiverAdd(e.target.value)}
            placeholder="Receiver Address"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <div className="card-actions justify-end">
            <button className="btn btn-neutral" onClick={deleteFlow}>
              Delete Flow
            </button>
          </div>
          <h3>{flowRateDisplay} Currency/month</h3>
        </div>
      </div>
    </div>
  )
}

export default Fluid
