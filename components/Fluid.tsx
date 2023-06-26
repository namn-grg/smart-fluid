import React, { useEffect, useState } from "react"
import { BigNumber, Framework } from "@superfluid-finance/sdk-core"
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
  const [fDAIAmount, setFDAIAmount] = useState<string>("")
  const [fDAIxAmount, setFDAIxAmount] = useState<string>("")
  const [finalArr, setFinalArr] = useState<any[]>([])
  const [finalTxArr, setFinalTxArr] = useState<any[]>([])

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

  // Do not pass random address for testing will give error
  async function finalSubmit() {
    console.log(finalArr)
    let tx: any, tx2: any
    for (let index = 0; index < finalArr.length; index++) {
      const element = finalArr[index]
      console.log("type: ", element.type)
      if (element.type == "wrapunwrap") {
        tx = await wrapOrUnwrap(element.operation, element.amount)
      } else if (element.type == "createflow") {
        tx = await createFlow(smartAccount, element.address, element.flowRate)
      } else if (element.type == "updateflow") {
        tx = await updateFlow(smartAccount, element.address, element.flowRate)
      } else if (element.type == "deleteflow") {
        tx = await deleteFlow(smartAccount, element.address)
      }
      if (tx.length > 1) {
        setFinalTxArr((oldArray) => [...oldArray, tx[0], tx[1]])
      } else {
        setFinalTxArr((oldArray) => [...oldArray, tx])
      }
      console.log("tx: ", await tx)
      console.log("Finaltx ", await finalTxArr)
    }
    console.log("finalTxArr: ", finalTxArr)
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
