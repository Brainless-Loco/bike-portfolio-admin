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
import AddProject from './Pages/AddNew/Project/AddProject';
import UpdateBasicInfo from './Pages/Update/BasicInfo/UpdateBasicInfo';
import UpdateDirectorInfo from './Pages/Update/BasicInfo/UpdateDirectorInfo';
import UpdateTeachingStatement from './Pages/Update/BasicInfo/UpdateTeachingStatement';
import AddDataset from './Pages/AddNew/Dataset/AddDataset';
import Dashboard from './Pages/Dashboard/Dashboard';
import UpdateResearchersList from './Pages/Update/Researchers/Researchers';
import UpdateSingleResearcherInfo from './Pages/Update/Researchers/UpdateSingleResearcherInfo';
import PublicationsList from './Pages/Update/Researches/PublicationsList';
import UpdateSignlePublication from './Pages/Update/Researches/UpdateSinglePublication';
import UpdateProjects from './Pages/Update/Projects/UpdateProjects';
import ContactMessages from './Pages/Others/ContactMessages';
import VacancyForm from './Pages/AddNew/Vacancy/VacancyForm';
import VacancyList from './Pages/Others/Applications/VacancyList'
import ApplicantDetails from './Pages/Others/Applications/ApplicantDetails';
import ApplicationsList from './Pages/Others/Applications/ApplicationsList';

function App() {
  return (
    <HelmetProvider>
      <Box className='w-full pt-5'>
        <Router>
          <Routes>
            <Route path="/" element={<LogIn/>}/>
            
            <Route path="/Dashboard" element={<Dashboard/>}/>


            <Route path='/add-new/researcher' element={<ResearcherProfileForm/>}/>
            <Route path='/add-new/activity' element={<AddActivity/>}/>
            <Route path='/add-new/researches' element={<AddResearch/>}/>
            <Route path='/add-new/teaching-courses' element={<AddTeachingCourse/>}/>
            <Route path='/add-new/partner' element={<AddPartner/>}/>
            <Route path='/add-new/project' element={<AddProject/>}/>
            <Route path='/add-new/dataset' element={<AddDataset/>}/>
            <Route path='/add-new/vacancy' element={<VacancyForm/>}/>

            {/* Update */}
            <Route path='/update' element={<UpdateBasicInfo/>}/>
            <Route path='/update/director-info' element={<UpdateDirectorInfo/>}/>
            <Route path='/update/teaching-statement' element={<UpdateTeachingStatement/>}/>

            <Route path='/update/researchers' element={<UpdateResearchersList/>}/>
            <Route path='/update/researchers/:id' element={<UpdateSingleResearcherInfo/>}/>

            
            <Route path='/update/vacancy' element={<VacancyForm/>}/>

            
            <Route path='/update/publications' element={<PublicationsList/>}/>
            <Route path='/update/publications/:id' element={<UpdateSignlePublication/>}/>

            <Route path='/update/projects' element={<UpdateProjects/>}/>


            {/* Others */}

            <Route path='others/messages' element={<ContactMessages/>}/>
            <Route path='others/applications' element={<VacancyList/>}/>
            <Route path="/Applications/:vacancy_id" element={<ApplicationsList />} />
            <Route path="/Applications/:vacancy_id/applicant/:applicant_id" element={<ApplicantDetails />} />


          </Routes>
          <CreditDiv/>
        </Router>
        
      </Box>
    </HelmetProvider>
  );
}

export default App;
