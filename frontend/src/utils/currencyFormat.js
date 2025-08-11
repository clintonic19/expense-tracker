import {v4 as uuidv4} from 'uuid';

export const maskAccountNumber = (accountNumber) => {
    if(typeof accountNumber !== 'string' || accountNumber.length < 11) {
        return accountNumber; 
    }
    const first4Digits = accountNumber.substring(0, 4);
    const last4Digits = accountNumber.substring(accountNumber.length - 4);

    const maskedNumber = "*".repeat(accountNumber.length - 8);
    return `${first4Digits}${maskedNumber}${last4Digits}`;  
};

 export const formatCurrency = (value, code) =>{
    const user = JSON.parse(localStorage.getItem("user"));

    if(!value || isNaN(value)) {
        return "Invalid input Number";
    }

    const valueNumber = typeof value === 'string' ? parseFloat(value) : value;

    return new Intl.NumberFormat(user?.locale || 'en-NGN', {
        style: 'currency',
        currency: code || user?.currency || 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valueNumber);
};

export const getSevenDaysAgo = () =>{
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
}