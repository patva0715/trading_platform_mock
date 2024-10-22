import React from 'react'
import '../../styles/login.css';
const Register = () => {
  return (
    <div className='flex min-h-svh text-sm'>
      <div className='basis-1/2 bg-black border-r-[1px] flex items-center border-neutral-700'>
        <Graphic/>
      </div>

      <div className='basis-1/2 flex items-center p-4'>
        <div className='flex flex-col p-4 w-full'>
          <h2 className='text-2xl mb-8 font-medium'>New Account Register</h2>
          <form className='w-full max-w-[650px]'>
            <span className=''>Email</span>
            <input className='mb-6 w-full mt-2  p-2 border-[1px] border-neutral-700 rounded-sm bg-transparent' />
            <span className=''>Password</span>
            <input className='mb-4 w-full mt-2 p-2 border-[1px] border-neutral-700 rounded-sm bg-transparent' />
            <span className=''>Confirm Password</span>
            <input className='mb-4 w-full mt-2 p-2 border-[1px] border-neutral-700 rounded-sm bg-transparent' />
            <p className='underline font-medium mb-2'>Forgot your password?</p>
            <p className='underline font-medium'>Forgot your email address?</p>
            <button className='bg-white p-3 mt-14  rounded-full text-black min-w-min w-1/4'>Register</button>
          </form>

       
        </div>
      </div>

    </div>
  )
}
const Graphic = () => {
  return (
    <div className="circle-container">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="square" style={{ '--i': index }}></div>
      ))}
    </div>
  );
}
export default Register