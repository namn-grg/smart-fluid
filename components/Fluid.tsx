import React, { useEffect, useState } from "react"
import { BigNumber, Framework } from "@superfluid-finance/sdk-core"
import GetSF from "../hooks/GetSF"
import SmartAccount from "@biconomy/smart-account"
import { ethers } from "ethers"
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

  const fDAIxAddress = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
  const getDetails = async () => {
    const sf = await GetSF()
    setSf(sf)
    const fDAIx = await sf.loadSuperToken("0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f")
    console.log(fDAIx)
  }

  const upgrade = async () => {
    const sf = await GetSF()
    const fdaix = await sf.loadSuperToken(fDAIxAddress)
    const fdai = fdaix?.underlyingToken
    const approve = fdai?.approve({
      receiver: fdaix.address || "0x0",
      amount: ethers.utils.parseEther(amount) as any,
    })
    // const apv = await approve.exec(signer)
    // await apv.wait()
    const op = fdaix.upgrade({ amount: ethers.utils.parseEther(amount) })
    // const res = op.exec(signer)
  }

  const downgrade = async () => {
    const sf = await GetSF()
    const fdaix = await sf.loadSuperToken("0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00")
    // const approve = fdaix.approve({
    //   receiver: fdaix.address || "0x0",
    //   amount: ethers.utils.parseEther(amount),
    // })
    // const apv = await approve.exec(signer)
    // await apv.wait()
    // const op = fdaix.downgrade({ amount: ethers.utils.parseEther(amount) })
    // const res = op.exec(signer)
  }

  useEffect(() => {
    getDetails()
  }, [])

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
    <div>
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
      <button className="btn btn-primary" onClick={upgrade}>
        Upgrade
      </button>
      <input type="number" onChange={(e) => setAmount(e.target.value)} />
      <button className="btn btn-primary" onClick={downgrade}>
        Downgrade
      </button>
    </div>
  )
}

export default Fluid
