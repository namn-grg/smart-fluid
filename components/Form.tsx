import React, { useState } from "react"

// Define the question types
type QuestionType = "A" | "B" | "C" | "D"

// Define the question interface
interface Question {
  type: QuestionType
  inputs: string[]
}

const Form: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([{ type: "A", inputs: [""] }])
  const [answers, setAnswers] = useState<string[]>([])

  const handleQuestionTypeChange = (index: number, type: QuestionType) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].type = type
    updatedQuestions[index].inputs = [""]
    setQuestions(updatedQuestions)
  }

  const handleAnswerChange = (index: number, inputIndex: number, answer: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].inputs[inputIndex] = answer
    setQuestions(updatedQuestions)
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { type: "A", inputs: [""] }])
  }

  const handleSubmit = () => {
    const allAnswers = questions.reduce((acc: string[], question: Question) => {
      return [...acc, ...question.inputs]
    }, [])
    setAnswers(allAnswers)
  }

  return (
    <div>
      {questions.map((question, index) => (
        <div key={index}>
          <label>Question {index + 1}:</label>
          <select
            value={question.type}
            onChange={(e) => handleQuestionTypeChange(index, e.target.value as QuestionType)}
          >
            <option value="A">Type A</option>
            <option value="B">Type B</option>
            <option value="C">Type C</option>
            <option value="D">Type D</option>
          </select>

          {Array.from(Array(getInputCount(question.type)).keys()).map((inputIndex) => (
            <input
              key={inputIndex}
              type="text"
              value={question.inputs[inputIndex]}
              onChange={(e) => handleAnswerChange(index, inputIndex, e.target.value)}
            />
          ))}
        </div>
      ))}

      <button onClick={handleAddQuestion}>Add Question</button>
      <button onClick={handleSubmit}>Submit</button>

      <div>Answers: {JSON.stringify(answers)}</div>
    </div>
  )
}

// Helper function to determine the number of inputs for each question type
const getInputCount = (type: QuestionType) => {
  switch (type) {
    case "A":
    case "D":
      return 1
    case "B":
      return 2
    case "C":
      return 3
    default:
      return 0
  }
}

export default Form
