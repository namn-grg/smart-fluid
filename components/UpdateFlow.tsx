const UpdateFlow = ({ setReceiverAdd, handleFlowRateChange, updateFlow, flowRateDisplay }: any) => {
  return (
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
  )
}

export default UpdateFlow
