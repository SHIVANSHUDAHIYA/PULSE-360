import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState('')
    const [userData, setUserData] = useState(false)

    // Validate and set token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            try {
                // Basic JWT validation
                const payload = JSON.parse(atob(storedToken.split('.')[1]))
                if (payload.exp * 1000 > Date.now()) {
                    setToken(storedToken)
                } else {
                    localStorage.removeItem('token')
                    toast.error('Session expired. Please login again.')
                }
            } catch (error) {
                localStorage.removeItem('token')
                console.error('Token validation error:', error)
            }
        }
    }, [])

    // Getting Doctors using API
    const getDoctosData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting User Profile using API
    const loadUserProfileData = async () => {
        if (!token) return;

        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { 
                headers: { token } 
            })

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
                // Clear token if profile fetch fails
                localStorage.removeItem('token')
                setToken('')
            }
        } catch (error) {
            console.log(error)
            toast.error('Session expired. Please login again.')
            // Clear token on error
            localStorage.removeItem('token')
            setToken('')
        }
    }

    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider