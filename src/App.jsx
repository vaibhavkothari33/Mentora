// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Layout from './components/Layout';
// import Home from './pages/Home';
// import Courses from './pages/Courses';
// import Dashboard from './pages/Dashboard';
// import CreateCourse from './pages/CreateCourse';
// import About from './pages/About';
// import CourseDetails from './pages/CourseDetails';
// import NotFound from './pages/NotFound';
// import RoadmapGenerator from './pages/RoadmapGenerator';
// import AIAssignment from './pages/AIAssignment';
// import Contact from './pages/Contact';
// import Assignments from './pages/Assignments';
// import CreateAssignment from './pages/CreateAssignment';
// import Profile from './pages/Profile';
// import { ThemeProvider } from './context/ThemeContext';
// import FAQ from './pages/FAQ';
// import { WagmiProvider, createConfig } from 'wagmi';
// import { mainnet, sepolia } from 'wagmi/chains';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { http } from 'viem';

// // Create wagmi config
// const config = createConfig({
//   chains: [mainnet, sepolia],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
// });

// // Create a client for react-query
// const queryClient = new QueryClient();

// function App() {
//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         <ThemeProvider>
//           <Router>
//             <Routes>
//               <Route element={<Layout />}>
//                 <Route index element={<Home />} />
//                 <Route path="courses">
//                   <Route index element={<Courses />} />
//                   <Route path=":id" element={<CourseDetails />} />
//                 </Route>
//                 <Route path="roadmap" element={<RoadmapGenerator />} />
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="profile" element={<Profile />} />
//                 <Route path="faq" element={<FAQ/>} />
//                 <Route path="create-course" element={<CreateCourse />} />
//                 <Route path="about" element={<About />} />
//                 <Route path="ai-assignment/:id" element={<AIAssignment />} />
//                 <Route path="assignments" element={<Assignments />} />
//                 <Route path="create-assignment" element={<CreateAssignment />} />
//                 <Route path="contact" element={<Contact />} />
//                 <Route path="*" element={<NotFound />} />
//               </Route>
//             </Routes>
//           </Router>
//         </ThemeProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }

// export default App;



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
import { NetworkProvider } from './context/NetworkContext';
import FAQ from './pages/FAQ';
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';

// Import RainbowKit
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';

// Define Open Campus Codex network
const openCampusCodex = {
  id: 656476,
  name: 'Open Campus Codex',
  network: 'opencampuscodex',
  nativeCurrency: {
    name: 'EDU',
    symbol: 'EDU',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.open-campus-codex.gelato.digital']
    },
    public: {
      http: ['https://rpc.open-campus-codex.gelato.digital']
    }
  },
  blockExplorers: {
    default: {
      name: 'Open Campus Blockscout',
      url: 'https://opencampus-codex.blockscout.com'
    }
  },
  testnet: true
};

// Define Arbitrum Sepolia if not already imported
const arbitrumSepolia = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  network: 'arbitrum-sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc']
    },
    public: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc']
    }
  },
  blockExplorers: {
    default: {
      name: 'Arbitrum Sepolia Explorer',
      url: 'https://sepolia-explorer.arbitrum.io'
    }
  },
  testnet: true
};

// Configure chains including all needed networks
const chains = [openCampusCodex, arbitrumSepolia, sepolia, mainnet];

// Set up connectors for wallets
const { connectors } = getDefaultWallets({
  appName: 'Open Campus Learning Platform',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID, // Replace with your WalletConnect project ID
  chains
});

// Create wagmi config with the connectors
const config = createConfig({
  chains,
  connectors,
  transports: {
    [openCampusCodex.id]: http(openCampusCodex.rpcUrls.default.http[0]),
    [arbitrumSepolia.id]: http(arbitrumSepolia.rpcUrls.default.http[0]),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

// Create a client for react-query
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <ThemeProvider>
            <NetworkProvider defaultNetwork="OPENCAMPUS">
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
            </NetworkProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;