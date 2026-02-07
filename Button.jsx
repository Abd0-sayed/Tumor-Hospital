function Button({content,change}) {

  return (
    <>
      <button className="btnoutline" onClick={() => { change(content) }}> {content} </button>
    </>
  )
}

export default Button