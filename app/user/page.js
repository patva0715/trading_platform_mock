'use client'
import React, { useState } from 'react'
import Login from './login'
import { useRouter } from 'next/navigation';

const Page = () => {
    const [user,setUser] = useState({username:''})
    const router = useRouter()
    if(user.username){
        router.push('/')
    }
    else {return (<Login/>)}
}

export default Page