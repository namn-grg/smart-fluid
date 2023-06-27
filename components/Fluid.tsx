import React, { useEffect, useState } from "react"
import { BigNumber, Framework } from "@superfluid-finance/sdk-core"
import SmartAccount from "@biconomy/smart-account"
import _, { set } from "lodash"
import { ethers } from "ethers"
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
import { ToastContainer, toast } from "react-toastify"
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
  const [interval, enableInterval] = useState(false)
  const [sendTxn, setSendTxn] = useState(false)

  const getDetails = async () => {
    console.log("Inside getDetails")

    const fDAIx = await fDAIxcontract.balanceOf(smartAccount.address)
    const fDAI = await fDAIcontract.balanceOf(smartAccount.address)
    setFDAIAmount(ethers.utils.formatEther(fDAI))
    setFDAIxAmount(ethers.utils.formatEther(fDAIx))
    getCorrectValue(fDAIAmount, fDAIxAmount)
  }

  useEffect(() => {
    if (interval) {
      const interval = setInterval(() => {
        getDetails()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [interval])

  useEffect(() => {
    const intervalId = setInterval(() => {
      getDetails()
    }, 20000)

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // Do not pass random address for testing will give error
  async function finalSubmit() {
    console.log("Inside finalSubmit, final arr: ", finalArr)
    let tempFinalTxArr: any[] = []
    let tx: any
    setSendTxn(true)
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
      console.log("tx: ", tx)
      if (tx.length > 1) {
        tempFinalTxArr.push(tx[0])
        tempFinalTxArr.push(tx[1])
      } else {
        tempFinalTxArr.push(tx)
      }
      console.log("loop: ", index, ": ", tempFinalTxArr)
    }
    toast.success("Transaction prepared, sending batch transaction")
    setFinalTxArr(tempFinalTxArr)
    console.log("Finish finalTxArr: ", finalTxArr)
  }

  useEffect(() => {
    console.log("FinalTxArr has been updated: ", finalTxArr)

    if (finalTxArr.length > 0 && sendTxn) {
      sendBatch()
    }
  }, [finalTxArr])

  const showSuccessMessage = (message: string, txHash?: string) => {
    toast.success(message, {
      onClick: () => {
        window.open(`https://mumbai.polygonscan.com//tx/${txHash}`, "_blank")
      },
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }

  async function sendBatch() {
    console.log("sending batch")

    const txResponse = await smartAccount.sendTransactionBatch({ transactions: finalTxArr })
    const txHash = await txResponse.wait()
    console.log({ txHash })
    toast.success("Transaction succefully sent")
    setSendTxn(false)
    showSuccessMessage("Transaction succefully sent", txHash.transactionHash)
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

  function getCorrectValue(test1: string, test2: string) {
    let amount: any = Number(test1)
    let amount2: any = Number(test2)
    amount = amount.toFixed(2)
    amount2 = amount2.toFixed(2)
    setFDAIAmount(amount)
    setFDAIxAmount(amount2)
  }

  return (
    <div className="flex flex-col items-center min-h-screen mt-10">
      {/* <button onClick={getDetails} className="btn btn-primary">
        Get Details
      </button> */}
      <h1 className="text-xl text-orange60 py-4"> Select the operations you want to perform</h1>
      <div className="card p-4 m-0 w-42 bg-fbg fixed top-40 left-20">
        <div className="items-center text-center">
          <h3 className="">Amount in SA:</h3>
          <p className=" font-extralight">fDAI: {fDAIAmount}</p>
          <p className=" font-extralight">fDAIx: {fDAIxAmount}</p>
        </div>
      </div>
      {finalArr &&
        finalArr.map((item) => (
          <>
            {getComponent(item)}
            <div className="w-[0.2px] h-8 mx-auto border-2 border-orange65"></div>
          </>
        ))}

      <div className="grid grid-cols-4 gap-6 mt-10">
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
      <button
        className="rounded-md border border-solid p-2 font-bold transition-colors border-orange40 bg-orange40 text-white hover:border-orange52 hover:bg-orange52 active:border-orange24 active:bg-orange24 my-5"
        onClick={finalSubmit}
      >
        Send Batch Transaction
      </button>
      <button
        className="text-md text-orange90 bg-transparent my-4"
        onClick={() =>
          window.open(
            `https://app.superfluid.finance/token/polygon-mumbai/0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f?view=${smartAccount.address}`,
            "_blank"
          )
        }
      >
        {" "}
        Verify the flows on superfluid console here{" "}
      </button>
    </div>
  )
}

export default Fluid
