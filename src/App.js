import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Box } from '@mui/material';
import CreditDiv from './Components/CreditDiv/CreditDiv';
import LogIn from './Pages/LogIn/LogIn';
import ResearcherProfileForm from './Pages/AddNew/Researcher/ResearcherProfileForm';
import { HelmetProvider } from 'react-helmet-async';
import AddActivity from './Pages/AddNew/Activity/AddActivity';
import AddResearch from './Pages/AddNew/Researches/AddResearch';
import AddTeachingCourse from './Pages/AddNew/Teaching/Courses/AddTeachingCourse';
import AddPartner from './Pages/AddNew/Partners/AddPartner';

function App() {
  return (
    <HelmetProvider>
      <Box className='w-full pt-16'>
        <Router>
          <Routes>
            <Route path="/" element={<LogIn/>}/>
            <Route path='/add-new/researcher' element={<ResearcherProfileForm/>}/>
            <Route path='/add-new/activity' element={<AddActivity/>}/>
            <Route path='/add-new/researches' element={<AddResearch/>}/>
            <Route path='/add-new/teaching-courses' element={<AddTeachingCourse/>}/>
            <Route path='/add-new/partner' element={<AddPartner/>}/>

          </Routes>
          <CreditDiv/>
        </Router>
        
      </Box>
    </HelmetProvider>
  );
}

export default App;
