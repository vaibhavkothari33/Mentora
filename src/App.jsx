import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import About from './pages/About';
import CourseDetails from './pages/CourseDetails';
import NotFound from './pages/NotFound';
import RoadmapGenerator from './pages/RoadmapGenerator';
import AIAssignment from './pages/AIAssignment';
import Contact from './pages/Contact';
import Assignments from './pages/Assignments';
import CreateAssignment from './pages/CreateAssignment';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';
import FAQ from './pages/FAQ';

function App() {

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses">
              <Route index element={<Courses />} />
              <Route path=":courseId" element={<CourseDetails />} />
            </Route>
            <Route path="roadmap" element={<RoadmapGenerator />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="faq" element={<FAQ/>} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="about" element={<About />} />
            <Route path="ai-assignment" element={<AIAssignment />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="create-assignment" element={<CreateAssignment />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
