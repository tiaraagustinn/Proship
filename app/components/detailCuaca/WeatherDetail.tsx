'use client'

import React from 'react'

const WeatherDetail = () => {
    const handleClick = () => alert('klik');
  return (
    <>
        <button onClick={handleClick} className="text-xl text-gray-900">Lihat User</button>
    </>
  )
}

export default WeatherDetail