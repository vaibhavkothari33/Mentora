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
        task: "Build a CLI and API-based ASCII Image Converter",
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
    ];