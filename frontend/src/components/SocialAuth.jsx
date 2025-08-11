import {
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    
} from 'firebase/auth';
import{ useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase.config';
import API from '../utils/api';
import{ toast } from 'sonner';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {FcGoogle} from 'react-icons/fc';
import {FaGithub} from 'react-icons/fa';
import useStore from '../utils/theme';

//GOOGLE PROVIDER
// const provider = new GoogleAuthProvider();

//GITHUB PROVIDER
const githubProvider = new GithubAuthProvider();

export const SocialAuth = ({ isLoading, setIsLoading }) => {
    const { user } = useAuthState(auth);
    const { setCredential } = useStore((state) => state);
    const [ selectedProvider, setSelectedProvider ] = useState('google');
    const navigate = useNavigate();

    // Sign up With Google Auth
    // const signUpWithGoogle = async () => {
    //    return await signInWithPopup(auth, provider)

    const signUpWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        setSelectedProvider('google');
        try {
            const result = await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing up with Google:", error);
            toast.error("Failed to sign up with Google. Please try again.");          
        }

    }

    // Sign up With Github Auth
    // const signUpWithGithub = async () => {
    //     setSelectedProvider('github');
    //     try {
    //         const result = await signInWithPopup(auth, githubProvider);
    //         const credential = GithubAuthProvider.credentialFromResult(result);
    //         const token = credential.accessToken;
    //         const user = result.user;
    //         setCredential({ user, token });
    //         navigate('/dashboard');
    //     } catch (error) {
    //         console.error("Error signing up with GitHub:", error);
    //         toast.error("Failed to sign up with GitHub. Please try again.");
    //     }
    // }

    //save user to database
    useEffect(() =>{
        const saveUserToDb = async () =>{
            try {
                const userData ={
                    name: user.displayName,
                    email: user.email,
                    provider: selectedProvider,
                    uid: user.uid,
                };
                isLoading(true);
                const {data: result } = await API.post('/auth/register', userData)
                console.log("User saved to database:", result);

                 // Check if user already exists in the database
                 if(result?.user){
                    toast.success("User registered successfully!", );
                    const userInfo = { ...result.user, token: result.token};
                    localStorage.setItem("user", JSON.stringify(userInfo));
                    setCredential(userInfo);

                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1000);
                 };             
                
            } catch (error) {
                console.error("Error saving user to database:", error);
                toast.error("Failed to save user data. Please try again.", error.message);                           
            }finally{
                    isLoading(false);
                }
        }
        if (user) {
            saveUserToDb();
        }        
    }, [user?.uid]);

    return(
      
        <div className="flex items-center gap-4 mb-8">
            <Button
                onClick={signUpWithGoogle}
                isLoading={isLoading}
                className="w-full bg-white  font-normal dark:bag-transparent dark:border-gray-800 dark:text-gray400 hover:bg-gray-300"
                type ="button"
                variant='outline'
            >
                <FcGoogle className="text-2xl mr-2 " />
                    Sign up with Google
                </Button>

            {/* <Button
                onClick={() => signInWithPopup(auth, githubProvider)}
                isLoading={isLoading}
                className="w-full bg-gray-500 text-sm text-white hover:bg-gray-600"
            >
                <FaGithub className="text-2xl mr-2" />
                Sign up with GitHub
            </Button>      */}
        </div>
    )


}
