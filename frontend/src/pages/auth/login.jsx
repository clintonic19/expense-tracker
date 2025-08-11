/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react'
import * as z from 'zod'
import useStore from '../../utils/theme'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import  {  Card, CardContent, CardHeader, CardTitle }  from '../../components/Card'
import { SocialAuth } from '../../components/SocialAuth'
import { Separator } from '../../components/separator'
import Input from '../../components/Input'
import { Button } from '../../components/Button'
import Loader from '../../components/Loader'
import { toast } from 'sonner'
import api from '../../utils/api'

// Define the schema for the registration form
const loginSchema = z.object({
  email: z.string({required_error: "Email is required"}).email({ message: 'Invalid email address' }),
  password: z.string({required_error: "Password is required"}).min(6, { message: 'Password must be at least 6 characters' }),
})

const Login = () => {
  const { user, setCredentials } = useStore((state) => state);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({resolver: zodResolver(loginSchema)});
  // const { register, handleSubmit, formState: { errors } } = useForm();

  const [isLoading, setIsLoading] = useState(false);

     // Handle form submission   
    const onSubmit = async (data) => {
      try {
        // console.log("submit", data);
        setIsLoading(true);
        // Handle registration logic here
        // For example, you can send a request to your backend API to register the user
        const { data: response } = await api.post('/auth/login', data,{withCredentials: true});
        // console.log("response", data);
        if(response?.data.user){
          console.log("Login successful:", response?.data.user);
          toast.success("Login successful");
          const userInfo = {...response?.data.user, token: response?.data.token};
          // Set user information in the store
          localStorage.setItem('user', JSON.stringify(userInfo));
          setCredentials(userInfo);
     
          // Redirect to login page after successful registration
          setTimeout(() => {
            navigate('/dashboard');
          },1500)
        }
      } catch (error) {
        console.error("Error during registration:", error);
        toast.error("Login failed. Please try again.");
      }finally{
        setIsLoading(false);
      }  
    };

    // NEW CODE
    // Redirect to dashboard if user is already logged in
    // This effect runs when the component mounts and checks if a user is logged in 
    useEffect(() => {
      const user = localStorage.getItem('user');
      if (user) {
        // const user = JSON.parse(user);
        setCredentials(JSON.parse(user));
        navigate('/dashboard');
      }
    }, [ user, navigate]);

  return (

    <div className='flex items-center justify-center w-full min-h-screen py-10'>
      {/* Form Container */}
        <Card
        className ='w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden'>
          {/* Header for the FORM */}
          <div className='p-6 md:-8'>
            <CardHeader className='py-0'>
                <CardTitle className='mb-8 text-center dark:text-white text-2xl font-semibold'>
                  LOGIN
                </CardTitle>
            </CardHeader>

            {/* Form Input*/}
            <CardContent className='p-0'>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='mb-8 space-y-6'>
                  {/* Google Auth */}
                  <SocialAuth/> 
                  <Separator/>

                  {/* Input Form Fields */}
              
                  <Input
                    disable ={isLoading}
                    type='email'
                    label='Email Address:'
                    placeholder='Enter your Email Address'
                    register={register("email", { required: "Email Address is required" })}
                    name='email'
                    error={errors.email ? errors.email.message : null}
                    className='w-full rounded-lg'
                  />

                  <Input
                    disable ={isLoading}
                    type='password'
                    label='Password:'
                    placeholder='********'
                    register={register("password", { required: "Password is required" })}
                    name='password'
                    error={errors.password ? errors.password.message : null}
                    className='w-full rounded-lg'
                  />
                </div>
                <Button
                 disable ={isLoading}
                type='submit'
                className='w-full rounded-lg h-10'
                // label='SUBMIT'
                // className='w-full rounded-lg'
                > 
                {isLoading ? <Loader className="animate-spin text-2xl text-white"/> : "Login"}
                </Button>
              </form>
              <p className='align-baseline text-center font-medium mt-4 text-sm'>
                Don't have an account? <Link to="/register" className='text-red-500'>Register here</Link>
              </p>
                
            </CardContent>

          </div>
        
          
        </Card>
    </div>     
  )
}

export default Login
