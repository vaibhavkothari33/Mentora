import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
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
// import { EduChainABI, CertificateNFTABI } from './contracts/abis';
// import { EduChainAddress, CertificateNFTAddress } from './contracts/addresses';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [provider, setProvider] = useState(null);
  const [eduChain, setEduChain] = useState(null);
  const [certificateNFT, setCertificateNFT] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        // const signer = await provider.getSigner();

        // const eduChainContract = new ethers.Contract(
        //   EduChainAddress,
        //   EduChainABI,
        //   signer
        // );
        // setEduChain(eduChainContract);

        // const certificateNFTContract = new ethers.Contract(
        //   CertificateNFTAddress,
        //   CertificateNFTABI,
        //   signer
        // );
        // setCertificateNFT(certificateNFTContract);
      }
    };

    init();
  }, []);

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
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="about" element={<About />} />
            <Route path="ai-assignment" element={<AIAssignment />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
