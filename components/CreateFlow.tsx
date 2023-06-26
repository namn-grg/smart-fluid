const CreateFlow = ({ item, createFlow, flowRateDisplay }: any) => {
  return (
      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <input
            type="text"
            value={item.address}
            onChange={(e) => item.setAddress(e.target.value)}
            placeholder="Receiver Address"
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <input
            type="text"
            value={item.input}
            onChange={(e) => item.setInput(e.target.value)}
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
      )
}

export default CreateFlow
