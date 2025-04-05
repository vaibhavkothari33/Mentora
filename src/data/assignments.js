export const assignments = [
  {
    id: 'todo-list',
    title: 'To-Do List',
    description: 'Create a command-line to-do list application that allows users to add, remove, and manage tasks.',
    estimatedTime: '2-3 hours',
    difficulty: 'beginner',
    checkpoints: [
      {
        id: 1,
        title: 'Basic Task Management',
        description: 'Implement functionality to add, remove, and list tasks',
        command: 'npm install && npm start'
      },
      {
        id: 2,
        title: 'Task Status',
        description: 'Add ability to mark tasks as complete/incomplete',
        command: 'npm run test'
      },
      {
        id: 3,
        title: 'Data Persistence',
        description: 'Save tasks to a local file',
        command: 'npm run build'
      }
    ]
  },
  {
    id: 'grocery-list',
    title: 'Grocery List',
    description: 'Develop a grocery list manager with features to add items, categorize them, and track quantities.',
    estimatedTime: '2-3 hours',
    difficulty: 'beginner',
    checkpoints: [
      {
        id: 1,
        title: 'Item Management',
        description: 'Add, remove, and list grocery items',
        command: 'npm install && npm start'
      },
      {
        id: 2,
        title: 'Categories',
        description: 'Organize items into categories',
        command: 'npm run test'
      },
      {
        id: 3,
        title: 'Quantity Tracking',
        description: 'Track quantities and units for items',
        command: 'npm run build'
      }
    ]
  },
  {
    id: 'cli-port-scanner',
    title: 'CLI Port Scanner',
    description: 'Build a command-line port scanner that can scan a range of ports on a given IP address.',
    estimatedTime: '3-4 hours',
    difficulty: 'intermediate',
    checkpoints: [
      {
        id: 1,
        title: 'Basic Scanning',
        description: 'Implement basic port scanning functionality',
        command: 'npm install && npm start'
      },
      {
        id: 2,
        title: 'Range Support',
        description: 'Add support for scanning port ranges',
        command: 'npm run test'
      },
      {
        id: 3,
        title: 'Service Detection',
        description: 'Detect services running on open ports',
        command: 'npm run build'
      }
    ]
  },
  {
    id: 'cli-image-to-ascii',
    title: 'CLI Image to ASCII',
    description: 'Create a tool that converts images to ASCII art in the command line.',
    estimatedTime: '3-4 hours',
    difficulty: 'intermediate',
    checkpoints: [
      {
        id: 1,
        title: 'Image Loading',
        description: 'Load and process image files',
        command: 'npm install && npm start'
      },
      {
        id: 2,
        title: 'ASCII Conversion',
        description: 'Convert image pixels to ASCII characters',
        command: 'npm run test'
      },
      {
        id: 3,
        title: 'Output Formatting',
        description: 'Format and display ASCII art',
        command: 'npm run build'
      }
    ]
  },
  {
    id: 'cli-file-integrity',
    title: 'CLI File Integrity Checker',
    description: 'Develop a tool that checks file integrity using hash functions and can detect changes in files.',
    estimatedTime: '3-4 hours',
    difficulty: 'intermediate',
    checkpoints: [
      {
        id: 1,
        title: 'Hash Generation',
        description: 'Generate file hashes using different algorithms',
        command: 'npm install && npm start'
      },
      {
        id: 2,
        title: 'Change Detection',
        description: 'Detect changes in files by comparing hashes',
        command: 'npm run test'
      },
      {
        id: 3,
        title: 'Report Generation',
        description: 'Generate reports of file changes',
        command: 'npm run build'
      }
    ]
  }
]; 