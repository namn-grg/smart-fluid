import React, { useEffect, useState } from "react"
import { BigNumber, Framework } from "@superfluid-finance/sdk-core"
// import GetSF from "../hooks/GetSF"
import SmartAccount from "@biconomy/smart-account"
import { ethers } from "ethers"
import { supererc20abi, erc20abi } from "../utils"
/*
 There are 4 type of transaction in Superfluid

 1. Wrap and Unwrap - amount
 2. Create flow - amount and receiver address
 3. Update flow - amount and receiver address
 4. Delete flow - receiver address
                    token address was optional in all of them
 Also a faucet to get the test token if possible fDAI or fDAIx

 batch the approve and send txn
*/
interface Question {
  id: number
  text: string
}

interface Answer {
  questionId: number
  answer: string
}

interface Props {
  smartAccount: SmartAccount
  provider: any
}

const Fluid: React.FC<Props> = ({ smartAccount, provider }) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [sf, setSf] = useState<Framework | null>(null)
  const [amount, setAmount] = useState<string>("0.1")
  const [fDAIAmount, setFDAIAmount] = useState<string>("")
  const [fDAIxAmount, setFDAIxAmount] = useState<string>("")

  const qProvider = new ethers.providers.JsonRpcProvider(
    "https://thrumming-quiet-yard.matic-testnet.discover.quiknode.pro/e8d17c21d6f86cdc291e6c8fa44a6868c51ee863/"
  )

  const fDAIxAddress = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
  const fDAIAddress = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7"
  const fDAIxcontract = new ethers.Contract(fDAIxAddress, supererc20abi, qProvider)
  const fDAIcontract = new ethers.Contract(fDAIAddress, erc20abi, qProvider)

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

  const upgrade = async () => {
    const approveTx = await fDAIcontract.populateTransaction.approve(fDAIxAddress, ethers.utils.parseEther(amount))
    const downgradeTx = await fDAIxcontract.populateTransaction.upgrade(ethers.utils.parseEther(amount))
    const tx1 = {
      to: fDAIAddress,
      data: approveTx.data || "0x0",
    }
    const tx2 = {
      to: fDAIxAddress,
      data: downgradeTx.data || "0x0",
    }

    const txs = [tx1, tx2]
    // const txResponse = await smartAccount.sendTransaction({ transaction: tx1 })
    const txResponse = await smartAccount.sendTransactionBatch({ transactions: txs })
    const txHash = await txResponse.wait()
    console.log({ txHash })
  }

  const downgrade = async () => {
    const approveTx = await fDAIxcontract.populateTransaction.approve(fDAIxAddress, ethers.utils.parseEther(amount))
    const downgradeTx = await fDAIxcontract.populateTransaction.downgrade(ethers.utils.parseEther(amount))
    const tx1 = {
      to: fDAIxAddress,
      data: approveTx.data || "0x0",
    }
    const tx2 = {
      to: fDAIxAddress,
      data: downgradeTx.data || "0x0",
    }

    const txs = [tx1, tx2]
    const txResponse = await smartAccount.sendTransactionBatch({ transactions: txs })
    const txHash = await txResponse.wait()
    console.log({ txHash })
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

  const createFlow = async () => {}

  const updateFlow = async () => {}

  const deleteFlow = async () => {}

  const handleQuestionChange = (questionId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setAnswers((prevAnswers) => {
      const existingAnswer = prevAnswers.find((answer) => answer.questionId === questionId)
      if (existingAnswer) {
        return prevAnswers.map((answer) => (answer.questionId === questionId ? { ...answer, answer: value } : answer))
      }
      return [...prevAnswers, { questionId, answer: value }]
    })
  }

  const handleAddQuestion = () => {
    const newQuestionId = questions.length + 1
    setQuestions((prevQuestions) => [...prevQuestions, { id: newQuestionId, text: `Question ${newQuestionId}` }])
  }

  const handleSubmit = () => {
    // Perform your desired action with the answers
    console.log(answers)
  }

  return (
    <div className="flex flex-col items-center justify-around min-h-screen">
      {/* {questions.map((question) => (
        <div key={question.id}>
          <label htmlFor={`question-${question.id}`}>{question.text}</label>
          <input
            id={`question-${question.id}`}
            type="text"
            onChange={(event) => handleQuestionChange(question.id, event)}
          />
        </div>
      ))}

      <button onClick={handleAddQuestion}>Add Question</button>

      <button onClick={handleSubmit}>Submit</button> */}
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
        <div className="card-body items-center text-center">
          <input
            type="text"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount of fDAI"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <div className="card-actions justify-end">
            {/* <button className="btn btn-neutral" onClick={() => wrapOrUnwrap("wrap", fDAIcontract)}> */}
            <button className="btn btn-neutral" onClick={() => wrapOrUnwrap("wrap", fDAIcontract)}>
              Wrap
            </button>
            <button className="btn btn-neutral" onClick={() => wrapOrUnwrap("unwrap", fDAIxcontract)}>
              Unwrap
            </button>
          </div>
        </div>
      </div>

      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <input
            type="text"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Receiver Address"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <input
            type="text"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Flow Rate"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <div className="card-actions justify-end">
            <button className="btn btn-neutral" onClick={createFlow}>
              Create Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Fluid
