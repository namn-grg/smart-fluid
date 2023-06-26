import React, { useEffect, useState } from "react"
import { BigNumber, Framework } from "@superfluid-finance/sdk-core"
// import GetSF from "../hooks/GetSF"
import SmartAccount from "@biconomy/smart-account"
import _ from "lodash"
import { ethers } from "ethers"
import { supererc20abi, erc20abi, CFAv1ForwarderABI } from "../utils"
import WrapUnwrap from "./WrapUnwrap"
import CreateFlow from "./CreateFlow"
import DeleteFlow from "./DeleteFlow"
import UpdateFlow from "./UpdateFlow"

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
  const cfv1Address = "0xcfA132E353cB4E398080B9700609bb008eceB125"
  const fDAIxcontract = new ethers.Contract(fDAIxAddress, supererc20abi, qProvider)
  const fDAIcontract = new ethers.Contract(fDAIAddress, erc20abi, qProvider)
  const cfav1Contract = new ethers.Contract(cfv1Address, CFAv1ForwarderABI, qProvider)

  const getDetails = async () => {
    console.log("Inside getDetails")

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
    // const txResponse = await smartAccount.sendTransactionBatch({ transactions: txs })
    // const txHash = await txResponse.wait()
    // console.log({ txHash })
    // getDetails()
    return txs
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
      to: cfv1Address,
      data: createFlowTx.data || "0x0",
    }

    // const txResponse = await smartAccount.sendTransaction({ transaction: tx })
    // const txHash = await txResponse.wait()
    // console.log({ txHash })
    return tx
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
      to: cfv1Address,
      data: updateFlowTx.data || "0x0",
    }

    // const txResponse = await smartAccount.sendTransaction({ transaction: tx })
    // const txHash = await txResponse.wait()
    // console.log({ txHash })
    return tx
  }

  const deleteFlow = async () => {
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

  const handleClick = (object: any) => {
    setFinalArr((oldArray) => [...oldArray, object])
  }

  const getComponent = (item: any) => {
    if (item.type == "wrapunwrap") {
      return (
        <WrapUnwrap item={item} wrapOrUnwrap={wrapOrUnwrap} fDAIcontract={fDAIcontract} fDAIxcontract={fDAIxcontract} />
      )
    } else if (item.type == "createflow") {
      return (
        <CreateFlow item={item} wrapOrUnwrap={wrapOrUnwrap} fDAIcontract={fDAIcontract} fDAIxcontract={fDAIxcontract} />
      )
    } else if (item.type == "updateflow") {
      return (
        <UpdateFlow item={item} wrapOrUnwrap={wrapOrUnwrap} fDAIcontract={fDAIcontract} fDAIxcontract={fDAIxcontract} />
      )
    } else if (item.type == "deleteflow") {
      return (
        <DeleteFlow item={item} wrapOrUnwrap={wrapOrUnwrap} fDAIcontract={fDAIcontract} fDAIxcontract={fDAIxcontract} />
      )
    }
  }

  function wrapUnwrapObject() {
    let amount = 0
    const id = _.uniqueId()
    const type = "wrapunwrap"

    function setAmount(value: number) {
      setFinalArr((oldArray) => {
        return oldArray.map((item) => {
          if (item.id == id) {
            item.amount = value
          }
          return item
        })
      })
    }

    return {
      id,
      type,
      amount,
      setAmount,
    }
  }

  function generalFlowObject(rand: string) {
    let flowRate = ""
    let address = ""
    const id = _.uniqueId()
    const type = rand == "create" ? "createflow" : "updateflow"

    function setFlowRate(value: string) {
      setFinalArr((oldArray) => {
        return oldArray.map((item) => {
          if (item.id == id) {
            item.flowRate = value
          }
          return item
        })
      })
    }

    function setAddress(value: string) {
      setFinalArr((oldArray) => {
        return oldArray.map((item) => {
          if (item.id == id) {
            item.address = value
          }
          return item
        })
      })
    }

    return {
      id,
      type,
      flowRate,
      setFlowRate,
      address,
      setAddress,
    }
  }

  function deleteFlowObject() {
    let address = ""
    const id = _.uniqueId()
    const type = "deleteflow"

    function setAddress(value: string) {
      setFinalArr((oldArray) => {
        return oldArray.map((item) => {
          if (item.id == id) {
            item.address = value
          }
          return item
        })
      })
    }

    return {
      id,
      type,
      address,
      setAddress,
    }
  }

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
      {finalArr && finalArr.map((item) => getComponent(item))}

      <div className="card w-96 border-2 border-secondary">
        <button className="btn" onClick={() => handleClick(wrapUnwrapObject())}>
          Wrap or Unwrap
        </button>
        <button className="btn" onClick={() => handleClick(generalFlowObject("create"))}>
          Create Flow
        </button>
        <button className="btn" onClick={() => handleClick(generalFlowObject("update"))}>
          Update Flow
        </button>
        <button className="btn" onClick={() => handleClick(deleteFlowObject())}>
          Delete Flow
        </button>
      </div>
    </div>
  )
}

export default Fluid
