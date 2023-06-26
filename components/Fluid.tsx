import React, { useEffect, useState } from "react"
import { BigNumber, Framework } from "@superfluid-finance/sdk-core"
// import GetSF from "../hooks/GetSF"
import SmartAccount from "@biconomy/smart-account"
import _ from "lodash"
import { ethers } from "ethers"
import { supererc20abi, erc20abi, CFAv1ForwarderABI } from "../utils"
import WrapUnwrap, { wrapOrUnwrap } from "./WrapUnwrap"
import CreateFlow, { createFlow } from "./CreateFlow"
import DeleteFlow, { deleteFlow } from "./DeleteFlow"
import UpdateFlow, { updateFlow } from "./UpdateFlow"
import {
  fDAIxcontract,
  fDAIcontract,
  cfav1Contract,
  qProvider,
  fDAIxAddress,
  fDAIAddress,
  cfv1Address,
} from "../utils/const"

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

  const getDetails = async () => {
    console.log("Inside getDetails")

    const fDAIx = await fDAIxcontract.balanceOf(smartAccount.address)
    const fDAI = await fDAIcontract.balanceOf(smartAccount.address)
    setFDAIAmount(ethers.utils.formatEther(fDAI))
    setFDAIxAmount(ethers.utils.formatEther(fDAIx))
  }

  useEffect(() => {
    getDetails
  }, [])

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

  function finalSubmit() {
    console.log(finalArr)
    for (let index = 0; index < finalArr.length; index++) {
      const element = finalArr[index]
      console.log("type: ", element.type)
    }
  }

  const handleClick = (object: any) => {
    setFinalArr((oldArray) => [...oldArray, object])
  }

  const getComponent = (item: any) => {
    if (item.type == "wrapunwrap") {
      return <WrapUnwrap item={item} />
    } else if (item.type == "createflow") {
      return <CreateFlow item={item} />
    } else if (item.type == "updateflow") {
      return <UpdateFlow item={item} />
    } else if (item.type == "deleteflow") {
      return <DeleteFlow item={item} />
    }
  }

  function wrapUnwrapObject() {
    let amount = 0
    let operation = ""
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

    function setOperation(value: string) {
      setFinalArr((oldArray) => {
        return oldArray.map((item) => {
          if (item.id == id) {
            item.operation = value
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
      operation,
      setOperation,
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
    <div className="flex flex-col items-center space-y-10 min-h-screen mt-10">
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

      <div className="grid grid-cols-2 gap-6">
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
      <button className="btn btn-primary justify-around" onClick={finalSubmit}>
        Submit
      </button>
    </div>
  )
}

export default Fluid
