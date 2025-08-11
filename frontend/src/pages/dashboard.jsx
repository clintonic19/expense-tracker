import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { set } from 'zod';
import api from '../utils/api';
import Loader from '../components/Loader';
import { FaSadCry } from 'react-icons/fa';
import Stats from '../components/Statistics';
import Information from '../components/Information';
import { FcDoughnutChart } from 'react-icons/fc';
import Chart from '../components/Chart';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from the API
  const getDashboardStatistics = async() =>{
  const URL = `/transactions/dashboard`; // Adjust the endpoint as per your API structure
    try {
      const response = await api.get(URL);
      setData(response?.data?.data);// Set the fetched data to state
      console.log("Dashboard data updated", response?.data);
      toast.success("Dashboard statistics fetched successfully!");     
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error.message);
      toast.error(error?.response?.data?.message || "Failed to fetch dashboard statistics. Please try again later.", );         
      if(error?.response?.data.status === "authentication_error" || error?.response?.status === 401){ 
        // Handle unauthorized access, e.g., redirect to login
        localStorage.removeItem("user"); // Clear user data from local storage
        window.location.reload();
      }     
    }finally{
      setIsLoading(false);
  }
  };

  // Call the function to fetch data when the component mounts
  useEffect(() => {
    setIsLoading(true);
    getDashboardStatistics();
  }, []);

 

  // If data is still loading, show a loader
  if(isLoading){
    return (
    <div className='flex items-center justify-center w-full h-[80vh]'>
      <Loader/>
    </div>
    )
  }

  if (!data) {
  return (
    <div className="flex items-center justify-center w-full h-[80vh]">
      <p className="text-gray-500 text-lg">No data found for dashboard.</p>
    </div>
  );
}

  return (
        <>
        <div className="px-0 md:px-5 2xl:px-20">
          <Information title ="Dashboard Statistics" subTitle={"Financial Overview"}>
            <Stats
             dt = 
             {
              { 
              balance: data?.balance || 0,
              income: data?.totalIncome || 0,
              expense: data?.totalExpenses || 0,
              // balance: data?.dt.balance || 0,
              // income: data?.dt.totalIncome || 0,
              // expense: data?.dt.totalExpenses || 0,
              // transactions: data?.totalTransactions || 0,
              
            }
            }
            />

            <div className="flex flex-col-reverse items-center gap-10 w-full md:flex-row">
              <Chart data={data?.chartData}/>
              {data?.totalIncome > 0 &&(
                // <DoughnutChart
                //   dt = {{
                //         balance: data?.balance || 0,
                //         income: data?.totalIncome || 0,
                //         expense: data?.totalExpenses || 0,
                //   }}
                // />
                <div></div>
              )}
            </div>
          </Information>
        </div>
    </>
  )
}

export default Dashboard
