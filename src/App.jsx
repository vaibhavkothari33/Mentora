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
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';

// Create wagmi config
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Create a client for react-query
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="courses">
                  <Route index element={<Courses />} />
                  <Route path=":id" element={<CourseDetails />} />
                </Route>
                <Route path="roadmap" element={<RoadmapGenerator />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="faq" element={<FAQ/>} />
                <Route path="create-course" element={<CreateCourse />} />
                <Route path="about" element={<About />} />
                <Route path="ai-assignment/:id" element={<AIAssignment />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="create-assignment" element={<CreateAssignment />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
