import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
const PrivateRoutes = () => {
    const location = useLocation();
    const user = localStorage.getItem('user');
    return user ? (<Outlet/>):(<Navigate to="/" state={{from:location}} replace/>)

};

export default PrivateRoutes;
