// src/data/aiAssignmentsData.js
export const aiAssignments = [
    {
        task: "Build a CLI-based local file integrity checker.",
        description:
          "Develop a command-line tool that monitors the integrity of files using cryptographic hashes. The tool should compute and store both MD5 and SHA256 hashes, detect changes on recheck, and handle internal errors gracefully with appropriate messaging.",
        checkpoints: [
          {
            id: 1,
            title: "Modified file is detected by API",
            description:
              "The tool must correctly identify and report if any file has been altered since its hashes were last saved.",
          },
          {
            id: 2,
            title: "API returns 500 on internal error",
            description:
              "If an unexpected internal error occurs (e.g., file read error, missing hash file), the program should simulate returning a 500-like error message and terminate gracefully.",
          },
          {
            id: 3,
            title: "Both MD5 and SHA256 hashes are computed",
            description:
              "For every file, the program must compute and store both MD5 and SHA256 hash values for verification purposes.",
          },
        ],
        github_link: "https://github.com/navyarathore/file-integrity-checker.git",
      },
      {
        task: "Create a To-Do List Web Application",
        description:
          "Build a basic to-do list web application that allows users to add, view, and remove tasks. The application should be accessible via a web browser and must run on port 3000.",
        checkpoints: [
          {
            id: 1,
            title: "Task Addition",
            description: "Verify if tasks can be added to the list.",
          },
          {
            id: 2,
            title: "Task Display",
            description: "Verify if tasks are displayed after being added.",
          },
          {
            id: 3,
            title: "Task Removal",
            description: "Verify if tasks can be removed from the list.",
          },
          {
            id: 4,
            title: "Application Port Check",
            description: "Check if the application is running on port 3000.",
          },
        ],
        github_link: "https://github.com/navyarathore/todolist.git",
      },
      {
        task: "Build a CLI-based ASCII Image Converter",
        description:
          "Develop a tool that converts images to ASCII art using a command-line interface and a FastAPI web API. The tool should support image uploads or remote image URLs, resizing, grayscale conversion, and contrast adjustments.",
        checkpoints: [
          {
            id: 1,
            title: "Server Health Check",
            description:
              "Ensure the FastAPI server is running and accessible at the /docs endpoint.",
            command:
              'curl.exe -s -o nul -w "%{http_code}" http://localhost:8000/docs',
          },
          {
            id: 2,
            title: "Test POST with Minimal Valid Data (URL Input)",
            description:
              "Submit an image URL with a width parameter to confirm ASCII conversion works via URL.",
            command:
              "curl.exe -s -X POST http://localhost:8000/convert -F url=https://upload.wikimedia.org/wikipedia/commons/b/b8/Uniform_polyhedron-33-t0.png -F width=60",
          },
          {
            id: 3,
            title: "Test File Upload",
            description:
              "Upload a local image file with grayscale enabled to test file handling and filter functionality.",
            command:
              "curl.exe -s -X POST http://localhost:8000/convert -F file=@test.jpg -F width=60 -F grayscale=true",
          },
          {
            id: 4,
            title: "Invalid URL Handling",
            description:
              "Send a non-image URL to check whether the API handles invalid image input gracefully.",
            command:
              "curl.exe -s -X POST http://localhost:8000/convert -F url=https://example.com/not-an-image -F width=80",
          },
        ],
        github_link: "https://github.com/navyarathore/ascii-image.git",
      },
      {
        task: "Build a Smart Grocery List App",
        description:
          "Develop a smart grocery list app that supports item creation, retrieval, updating, and provides appropriate server responses. The application should feature endpoints to manage grocery items, including auto-categorization.",
        checkpoints: [
          {
            id: 1,
            title: "Server Health Check",
            description: "Ensure the server is running and accessible.",
          },
          {
            id: 2,
            title: "Test POST /api/groceries",
            description:
              "Validate POST /api/groceries successfully adds a new grocery item.",
          },
          {
            id: 3,
            title: "Test GET /api/groceries",
            description:
              "Validate GET /api/groceries returns a list of all items.",
          },
          {
            id: 4,
            title: "Test PUT /api/groceries/:id",
            description:
              "Validate PUT /api/groceries/:id updates an existing item.",
          },
        ],
        github_link: "https://github.com/navyarathore/grocery.git",
      },
      {
        task: "Build a CLI-based Port Scanner",
        description:
          "Create a network port scanning tool that functions both as a command-line utility and as a web API. The scanner should detect open ports on specified IP addresses across a defined range, with support for both TCP and UDP protocols. Additionally, implement banner grabbing functionality to identify services running on open ports.",
        checkpoints: [
          {
            id: 1,
            title: "Basic Functionality Check",
            description:
              "The scanner should run with required arguments without crashing",
            command:
              "python scanner.py --ip 127.0.0.1 --start-port 300 --end-port 457 --tcp",
          },
          {
            id: 2,
            title: "Port Detection Accuracy",
            description:
              "The scanner should correctly identify open and closed ports",
            command:
              "python scanner.py --ip 127.0.0.1 --start-port 50 --end-port 90 --tcp",
          },
          {
            id: 3,
            title: "Banner Grabbing Functionality",
            description:
              "The `--banner` flag should trigger banner grabbing on open ports",
            command:
              "python scanner.py --ip 127.0.0.1 --start-port 80 --end-port 80 --tcp --banner",
          },
          {
            id: 4,
            title: "UDP Scanning",
            description:
              "Validate UDP handling doesn't crash, even if the result is filtered",
            command:
              "python scanner.py --ip 8.8.8.8 --start-port 53 --end-port 53 --udp",
          },
        ],
        github_link: "https://github.com/navyarathore/port-scanner.git",
      },
      {
        task: "Create a Real-Time Chat Application",
        description: "Build a real-time chat application using WebSocket technology. The application should support multiple chat rooms, private messaging, and message persistence. Implement features like user authentication, message history, and typing indicators.",
        checkpoints: [
          {
            id: 1,
            title: "WebSocket Connection",
            description: "Establish WebSocket connection between client and server",
            command: "npm run test:websocket"
          },
          {
            id: 2, 
            title: "Chat Room Implementation",
            description: "Create and join chat rooms with message broadcasting",
            command: "npm run test:rooms"
          },
          {
            id: 3,
            title: "Private Messaging",
            description: "Implement user-to-user private messaging functionality",
            command: "npm run test:private"
          },
          {
            id: 4,
            title: "Message Persistence",
            description: "Store and retrieve message history from database",
            command: "npm run test:persistence"
          }
        ],
        github_link: "https://github.com/navyarathore/chat-app.git"
      },
      {
        task: "Develop an E-commerce API",
        description: "Create a RESTful API for an e-commerce platform with features like product management, shopping cart functionality, order processing, and user authentication. Implement proper error handling and input validation.",
        checkpoints: [
          {
            id: 1,
            title: "Product Management",
            description: "CRUD operations for products with image upload support",
            command: "npm test -- --grep 'Product API'"
          },
          {
            id: 2,
            title: "Shopping Cart",
            description: "Add/remove items from cart with quantity updates",
            command: "npm test -- --grep 'Cart API'"
          },
          {
            id: 3,
            title: "Order Processing",
            description: "Create and manage orders with status updates",
            command: "npm test -- --grep 'Order API'"
          },
          {
            id: 4,
            title: "Authentication",
            description: "Implement JWT-based user authentication",
            command: "npm test -- --grep 'Auth API'"
          }
        ],
        github_link: "https://github.com/navyarathore/ecommerce-api.git"
      },
      {
        task: "Build a Weather Dashboard",
        description: "Create a weather dashboard that displays current weather conditions and forecasts for multiple cities. Integrate with a weather API, implement geolocation, and add features like weather alerts and historical data visualization.",
        checkpoints: [
          {
            id: 1,
            title: "API Integration",
            description: "Successfully fetch and display weather data",
            command: "npm run test:api"
          },
          {
            id: 2,
            title: "Geolocation",
            description: "Implement current location weather detection",
            command: "npm run test:geolocation"
          },
          {
            id: 3,
            title: "Multiple Cities",
            description: "Add and remove cities with local storage",
            command: "npm run test:cities"
          },
          {
            id: 4,
            title: "Data Visualization",
            description: "Create charts for temperature and precipitation trends",
            command: "npm run test:charts"
          }
        ],
        github_link: "https://github.com/navyarathore/weather-dashboard.git"
      },
      {
        task: "Implement a Task Management System",
        description: "Build a Kanban-style task management system with drag-and-drop functionality, task assignments, due dates, and progress tracking. Include features for team collaboration and task dependencies.",
        checkpoints: [
          {
            id: 1,
            title: "Board Setup",
            description: "Create draggable boards and cards implementation",
            command: "npm run test:drag-drop"
          },
          {
            id: 2,
            title: "Task Features",
            description: "Add task details, assignments, and due dates",
            command: "npm run test:task-features"
          },
          {
            id: 3,
            title: "Collaboration",
            description: "Implement team sharing and commenting system",
            command: "npm run test:collaboration"
          },
          {
            id: 4,
            title: "Dependencies",
            description: "Add and validate task dependencies",
            command: "npm run test:dependencies"
          }
        ],
        github_link: "https://github.com/navyarathore/task-manager.git"
      },
      {
        task: "Create a File Storage Service",
        description: "Develop a cloud storage service with features like file upload/download, folder organization, file sharing, and access control. Implement proper security measures and handle large file transfers.",
        checkpoints: [
          {
            id: 1,
            title: "File Operations",
            description: "Handle basic file upload and download operations",
            command: "npm test file-ops"
          },
          {
            id: 2,
            title: "Folder Structure",
            description: "Implement folder creation and navigation",
            command: "npm test folder-structure"
          },
          {
            id: 3,
            title: "Sharing System",
            description: "Create file sharing with permission controls",
            command: "npm test sharing"
          },
          {
            id: 4,
            title: "Large Files",
            description: "Handle chunked upload for large files",
            command: "npm test large-files"
          }
        ],
        github_link: "https://github.com/navyarathore/file-storage.git"
      },
      {
        task: "Build a Social Media Analytics Dashboard",
        description: "Create a dashboard for tracking and analyzing social media metrics across multiple platforms. Include features for data visualization, engagement tracking, and automated reporting.",
        checkpoints: [
          {
            id: 1,
            title: "API Integration",
            description: "Connect with multiple social media platforms",
            command: "npm run test:social-apis"
          },
          {
            id: 2,
            title: "Metrics Collection",
            description: "Gather and store engagement metrics",
            command: "npm run test:metrics"
          },
          {
            id: 3,
            title: "Visualization",
            description: "Create interactive charts and graphs",
            command: "npm run test:charts"
          },
          {
            id: 4,
            title: "Reporting",
            description: "Generate automated performance reports",
            command: "npm run test:reports"
          }
        ],
        github_link: "https://github.com/navyarathore/social-analytics.git"
      },
      {
        task: "Develop a Recipe Management API",
        description: "Create an API for managing recipes, including features like ingredient tracking, meal planning, nutritional information calculation, and recipe sharing capabilities.",
        checkpoints: [
          {
            id: 1,
            title: "Recipe CRUD",
            description: "Implement basic recipe management operations",
            command: "npm test recipe-ops"
          },
          {
            id: 2,
            title: "Ingredient System",
            description: "Add ingredient database and relationships",
            command: "npm test ingredients"
          },
          {
            id: 3,
            title: "Meal Planning",
            description: "Implement meal calendar and planning features",
            command: "npm test meal-planning"
          },
          {
            id: 4,
            title: "Nutrition Calculator",
            description: "Calculate and store nutritional information",
            command: "npm test nutrition"
          }
        ],
        github_link: "https://github.com/navyarathore/recipe-api.git"
      }
    ];