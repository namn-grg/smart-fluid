const WrapUnwrap = ({ item, wrapOrUnwrap, fDAIcontract, fDAIxcontract }: any) => {
  return (
      <div className="card w-96 border-2 border-secondary">
        <div className="card-body items-center text-center">
          <input
            type="text"
            value={item.amount}
            onChange={(e) => item.setAmount(e.target.value)}
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
  )
}

export default WrapUnwrap
