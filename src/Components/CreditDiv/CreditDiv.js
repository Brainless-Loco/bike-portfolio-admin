import React from 'react';
import './CreditDiv.css';
import { Box } from '@mui/material';

const CreditDiv = () => {
    return (
        <Box className="footerCredit text-white text-center">
            <Box className="pt-2 pt-md-0">
                <span className="float-md-left mt-md-2 mx-md-5 mx-4">&copy; BIKE&nbsp; 2025</span> 
                <span className="float-md-right mt-md-2 mx-md-5 mx-4">Developed By: BIKE</span>
            </Box>
            
        </Box>
    );
};

export default CreditDiv;