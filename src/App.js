import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Box } from '@mui/material';
import CreditDiv from './Components/CreditDiv/CreditDiv';
import LogIn from './Pages/LogIn/LogIn';
import ResearcherProfileForm from './Pages/AddNew/Researcher/ResearcherProfileForm';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <Box className='w-full pt-16'>
        <Router>
          <Routes>
            <Route path="/" element={<LogIn/>}/>
            <Route path='/add-new/researcher' element={<ResearcherProfileForm/>}/>
            {/* <Route path={["/Contact-us" , "/join-us" , "/Join-BIKE","/Latest"]} exact element={<ContactUs/>}/> */}
          </Routes>
          <CreditDiv/>
        </Router>
        
      </Box>
    </HelmetProvider>
  );
}

export default App;
