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
const registrationSchema = z.object({
  email: z.string({required_error: "Email is required"}).email({ message: 'Invalid email address' }),
  firstName: z.string({required_error: "First name is required"}).min(3,{ message: 'First name is required' }),
  lastName: z.string({required_error: "Last name is required"}).min(3, { message: 'Last name is required' }),
  password: z.string({required_error: "Password is required"}).min(6, { message: 'Password must be at least 6 characters' }),
})

const Register = () => {
  const { user } = useStore((state) => state);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({resolver: zodResolver(registrationSchema)});
  // const { register, handleSubmit, formState: { errors } } = useForm();

  const [isLoading, setIsLoading] = useState(false);

     // Handle form submission   
    const onSubmit = async (data) => {
      try {
        // console.log("submit", data);
        setIsLoading(true);
        // Handle registration logic here
        // For example, you can send a request to your backend API to register the user
        const { data: response } = await api.post('/auth/register', data);
        // console.log("response", data);
        // if(response?.user){
          toast.success(response.message || "Registration successful");
          // Redirect to login page after successful registration
          setTimeout(() => {
            navigate('/login');
          },1500)
        // }
      } catch (error) {
        console.error("Error during registration:", error);
        toast.error("Registration failed. Please try again.");
      }finally{
        setIsLoading(false);
      }  
    };

    // NEW CODE
    // Redirect to dashboard if user is already logged in
    // This effect runs when the component mounts and checks if a user is logged in 
    useEffect(() => {
      if (user) {
        navigate('/dashboard');
      }
    }, [user, navigate]);

  return (

    <div className='flex items-center justify-center w-full min-h-screen py-10'>
      {/* Form Container */}
        <Card
        className ='w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden'>
          {/* Header for the FORM */}
          <div className='p-6 md:-8'>
            <CardHeader className='py-0'>
                <CardTitle className='mb-8 text-center dark:text-white text-2xl font-semibold'>
                  CREATE AN ACCOUNT
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
                    type='text'
                    label='FirstName:'
                    placeholder='Enter your FirstName'
                    register={register("firstName", { required: "FirstName is required" })}
                    name='firstName'
                    error={errors.firstName ? errors.firstName.message : null}
                    className='w-full rounded-lg'
                  />

                  <Input
                    disable ={isLoading}
                    type='text'
                    label='LastName:'
                    placeholder='Enter your LastName'
                    register={register("lastName", { required: "LastName is required" })}
                    name='lastName'
                    error={errors.lastName ? errors.lastName.message : null}
                    className='w-full rounded-lg'
                  />

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
                {isLoading ? <Loader className="animate-spin text-2xl text-white"/> : "Create an Account"}
                </Button>
              </form>
              <p className='align-baseline text-center font-medium mt-4 text-sm'>
                Already have an account? <Link to="/login" className='text-red-500'>Login</Link>
              </p>
                
            </CardContent>

          </div>
        
          
        </Card>
    </div>     
  )
}

export default Register
