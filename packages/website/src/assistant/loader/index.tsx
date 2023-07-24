import React from 'react'

import s from './index.module.css' // Import the CSS file for styling

const Loader = (): JSX.Element => {
  return (
    <div className={s.loaderContainer}>
      <div className={s.message}></div>
      <div className={s.message}></div>
      <div className={s.message}></div>
      <div
        className="fldsfjdalskfjaslkfjsadlkf;jasdlkfjasdlk;fdsa"
      >
        <p></p>
      </div>
    </div>

  )
}

export default Loader
