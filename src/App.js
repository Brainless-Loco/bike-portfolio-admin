import './App.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Box } from '@mui/material';
import CreditDiv from './Components/CreditDiv/CreditDiv';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import LogIn from './Pages/LogIn/LogIn';
import ResearcherProfileForm from './Pages/AddNew/Researcher/ResearcherProfileForm';
import { HelmetProvider } from 'react-helmet-async';
import AddActivity from './Pages/AddNew/Activity/AddActivity';
import AddResearch from './Pages/AddNew/Researches/AddResearch';
import AddTeachingCourse from './Pages/AddNew/Teaching/Courses/AddTeachingCourse';
import AddPartner from './Pages/AddNew/Partners/AddPartner';
import AddProject from './Pages/AddNew/Project/AddProject';
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
import UpdateSubtopics from './Pages/AddNew/Project/UpdateSubtopics';
import ManageActivities from './Pages/Update/Activity/ManageActivities';
import UpdateActivityPage from './Pages/Update/Activity/UpdateActivityPage';
import ViewProjectsList from './Pages/Update/Projects/ViewProjectsList';
import ViewProjectDetail from './Pages/Update/Projects/ViewProjectDetail';
import UserManagement from './Pages/RBAC/UserManagement';
import RoleManagement from './Pages/RBAC/RoleManagement';
import ScrollingNews from './Pages/Others/ScrollingNews';
import FeaturedMembersManager from './Pages/AddNew/FeaturedMembers/FeaturedMembersManager';

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

            {/* Update Routes - Protected */}
            <Route path='/update/researchers' element={
              <ProtectedRoute resource="researchers" operation="update">
                <UpdateResearchersList/>
              </ProtectedRoute>
            }/>
            <Route path='/update/researchers/:id' element={
              <ProtectedRoute resource="researchers" operation="update">
                <UpdateSingleResearcherInfo/>
              </ProtectedRoute>
            }/>

            <Route path='/update/publications' element={
              <ProtectedRoute resource="publications" operation="read">
                <PublicationsList/>
              </ProtectedRoute>
            }/>
            <Route path='/update/publications/:id' element={
              <ProtectedRoute resource="publications" operation="read">
                <UpdateSignlePublication/>
              </ProtectedRoute>
            }/>

            <Route path='/update/projects' element={
              <ProtectedRoute resource="projects" operation="read">
                <UpdateProjects/>
              </ProtectedRoute>
            }/>
            <Route path="/update/subtopics/:id" element={
              <ProtectedRoute resource="projects" operation="read">
                <UpdateSubtopics />
              </ProtectedRoute>
            } />

            <Route path='/update/activities' element={
              <ProtectedRoute resource="activities" operation="read">
                <ManageActivities/>
              </ProtectedRoute>
            }/>
            <Route path='/update/activities/:id' element={
              <ProtectedRoute resource="activities" operation="read">
                <UpdateActivityPage/>
              </ProtectedRoute>
            }/>

            {/* View Routes - Read Only - Protected */}
            <Route path='/view/researchers' element={
              <ProtectedRoute resource="researchers" operation="read">
                <UpdateResearchersList viewOnly={true}/>
              </ProtectedRoute>
            }/>
            <Route path='/view/publications' element={
              <ProtectedRoute resource="publications" operation="read">
                <PublicationsList viewOnly={true}/>
              </ProtectedRoute>
            }/>
            <Route path='/view/projects' element={
              <ProtectedRoute resource="projects" operation="read">
                <ViewProjectsList/>
              </ProtectedRoute>
            }/>
            <Route path='/view/projects/:id' element={
              <ProtectedRoute resource="projects" operation="read">
                <ViewProjectDetail/>
              </ProtectedRoute>
            }/>
            <Route path='/view/activities' element={
              <ProtectedRoute resource="activities" operation="read">
                <ManageActivities viewOnly={true}/>
              </ProtectedRoute>
            }/>

            {/* Others - Protected */}
            <Route path='others/messages' element={
              <ProtectedRoute resource="messages" operation="read">
                <ContactMessages/>
              </ProtectedRoute>
            }/>
            <Route path='others/applications' element={
              <ProtectedRoute resource="applications" operation="read">
                <VacancyList/>
              </ProtectedRoute>
            }/>
            <Route path="/Applications/:vacancy_id" element={
              <ProtectedRoute resource="applications" operation="read">
                <ApplicationsList />
              </ProtectedRoute>
            } />
            <Route path="/Applications/:vacancy_id/applicant/:applicant_id" element={
              <ProtectedRoute resource="applications" operation="read">
                <ApplicantDetails />
              </ProtectedRoute>
            } />
            
            <Route path='/update/activities' element={<ManageActivities/>}/>
            <Route path='/update/activities/:id' element={<UpdateActivityPage/>}/>


            {/* Others */}

            <Route path='others/messages' element={<ContactMessages/>}/>
            <Route path='others/scrolling-news' element={<ScrollingNews/>}/>
            <Route path='others/featured-members' element={<FeaturedMembersManager/>}/>
            <Route path='others/applications' element={<VacancyList/>}/>
            <Route path="/Applications/:vacancy_id" element={<ApplicationsList />} />
            <Route path="/Applications/:vacancy_id/applicant/:applicant_id" element={<ApplicantDetails />} />

            {/* RBAC - Access Control */}
            <Route path="/rbac/users" element={
              <ProtectedRoute resource="users" operation="read" allowSuperAdmin={true}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/rbac/roles" element={
              <ProtectedRoute resource="roles" operation="read" allowSuperAdmin={true}>
                <RoleManagement />
              </ProtectedRoute>
            } />

          </Routes>
          <CreditDiv/>
        </Router>
        
      </Box>
    </HelmetProvider>
  );
}

export default App;
