// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import directly from Remix
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EduChain is Ownable, ReentrancyGuard {
    // Structs
    struct Section {
        string title;
        string content;
        bool isLocked;
    }

    struct Course {
        uint256 id;
        string title;
        string description;
        string imageUrl;
        uint256 price;
        address instructor;
        bool isActive;
        uint256 studentCount;
        Section[] sections;
        mapping(address => bool) enrolledStudents;
    }

    struct CourseSection {
        string title;
        string description;
        string videoURI;        // IPFS URI for video content
        string materialURI;     // IPFS URI for additional materials
        uint256 duration;       // in minutes
    }

    struct Enrollment {
        uint256 courseId;
        uint256 enrolledAt;
        uint256 completedSections;
        bool isCompleted;
        mapping(uint256 => bool) sectionProgress;
    }

    // State variables
    uint256 public courseCounter;
    mapping(uint256 => Course) private courses;
    mapping(address => uint256[]) public instructorCourses;
    mapping(address => mapping(uint256 => Enrollment)) public enrollments;
    mapping(address => bool) public instructors;
    
    // Events
    event CourseCreated(
        uint256 indexed courseId,
        string title,
        address instructor,
        uint256 price
    );
    event CourseUpdated(
        uint256 indexed courseId,
        string title,
        uint256 price
    );
    event StudentEnrolled(
        uint256 indexed courseId,
        address indexed student
    );
    event CourseStatusToggled(
        uint256 indexed courseId,
        bool isActive
    );
    event SectionCompleted(uint256 indexed courseId, address indexed student, uint256 sectionIndex);
    event CourseCompleted(uint256 indexed courseId, address indexed student);
    event InstructorRegistered(address indexed instructor);
    event SectionAdded(
        uint256 indexed courseId,
        uint256 sectionIndex,
        string title
    );
    event SectionUpdated(
        uint256 indexed courseId,
        uint256 sectionIndex,
        string title
    );

    // Modifiers
    modifier validCourseId(uint256 courseId) {
        require(courses[courseId].instructor != address(0), "Course does not exist");
        _;
    }

    modifier onlyInstructor(uint256 courseId) {
        require(courses[courseId].instructor == msg.sender, "Not the course instructor");
        _;
    }

    modifier notEnrolled(uint256 courseId) {
        require(!courses[courseId].enrolledStudents[msg.sender], "Already enrolled");
        _;
    }

    modifier sufficientPayment(uint256 courseId) {
        require(msg.value >= courses[courseId].price, "Insufficient payment");
        _;
    }

    modifier validSection(uint256 courseId, uint256 sectionIndex) {
        require(sectionIndex < courses[courseId].sections.length, "Invalid section index");
        _;
    }

    // Constructor - Pass msg.sender as the initial owner
    constructor() Ownable(msg.sender) {
        courseCounter = 1;
    }

    // Instructor functions
    function registerAsInstructor() external {
        require(!instructors[msg.sender], "Already registered as instructor");
        instructors[msg.sender] = true;
        emit InstructorRegistered(msg.sender);
    }

    // Course Creation
    function createCourse(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _price
    ) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_price > 0, "Price must be greater than 0");

        courseCounter++;
        
        Course storage newCourse = courses[courseCounter];
        newCourse.id = courseCounter;
        newCourse.title = _title;
        newCourse.description = _description;
        newCourse.imageUrl = _imageUrl;
        newCourse.price = _price;
        newCourse.instructor = msg.sender;
        newCourse.isActive = true;
        newCourse.studentCount = 0;

        emit CourseCreated(courseCounter, _title, msg.sender, _price);
    }

    // Section Management
    function addSection(
        uint256 courseId,
        string memory _title,
        string memory _content,
        bool _isLocked
    ) 
        public 
        validCourseId(courseId)
        onlyInstructor(courseId) 
    {
        Course storage course = courses[courseId];
        course.sections.push(Section({
            title: _title,
            content: _content,
            isLocked: _isLocked
        }));

        emit SectionAdded(courseId, course.sections.length - 1, _title);
    }

    function updateSection(
        uint256 courseId,
        uint256 sectionIndex,
        string memory _title,
        string memory _content,
        bool _isLocked
    ) 
        public 
        validCourseId(courseId)
        onlyInstructor(courseId)
        validSection(courseId, sectionIndex)
    {
        Section storage section = courses[courseId].sections[sectionIndex];
        section.title = _title;
        section.content = _content;
        section.isLocked = _isLocked;

        emit SectionUpdated(courseId, sectionIndex, _title);
    }

    // Get Section
    function getSection(
        uint256 courseId,
        uint256 sectionIndex
    ) 
        public 
        view 
        validCourseId(courseId)
        validSection(courseId, sectionIndex)
        returns (string memory title, string memory content, bool isLocked) 
    {
        Section storage section = courses[courseId].sections[sectionIndex];
        
        // If section is locked, only enrolled students or instructor can view content
        if (section.isLocked && 
            msg.sender != courses[courseId].instructor && 
            !courses[courseId].enrolledStudents[msg.sender]) {
            return (section.title, "", section.isLocked);
        }

        return (section.title, section.content, section.isLocked);
    }

    // Get Section Count
    function getSectionCount(uint256 courseId) 
        public 
        view 
        validCourseId(courseId)
        returns (uint256) 
    {
        return courses[courseId].sections.length;
    }

    // Course Enrollment
    function enrollInCourse(uint256 courseId) 
        public 
        payable 
        validCourseId(courseId)
        notEnrolled(courseId)
        sufficientPayment(courseId)
    {
        Course storage course = courses[courseId];
        require(course.isActive, "Course is not active");

        course.enrolledStudents[msg.sender] = true;
        course.studentCount++;

        // Transfer payment to instructor
        payable(course.instructor).transfer(msg.value);

        emit StudentEnrolled(courseId, msg.sender);
    }

    // Course Update
    function updateCourse(
        uint256 courseId,
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _price
    ) 
        public 
        validCourseId(courseId)
        onlyInstructor(courseId) 
    {
        Course storage course = courses[courseId];
        course.title = _title;
        course.description = _description;
        course.imageUrl = _imageUrl;
        course.price = _price;

        emit CourseUpdated(courseId, _title, _price);
    }

    // View Functions
    function getCourse(uint256 courseId) 
        public 
        view 
        validCourseId(courseId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            string memory imageUrl,
            uint256 price,
            address instructor,
            bool isActive,
            uint256 studentCount,
            uint256 sectionCount
        ) 
    {
        Course storage course = courses[courseId];
        return (
            course.id,
            course.title,
            course.description,
            course.imageUrl,
            course.price,
            course.instructor,
            course.isActive,
            course.studentCount,
            course.sections.length
        );
    }

    function isEnrolled(uint256 courseId, address student) 
        public 
        view 
        validCourseId(courseId)
        returns (bool) 
    {
        return courses[courseId].enrolledStudents[student];
    }

    function getTotalCourses() public view returns (uint256) {
        return courseCounter;
    }

    // Course Status Management
    function toggleCourseActive(uint256 courseId) 
        public 
        validCourseId(courseId)
        onlyInstructor(courseId)
    {
        courses[courseId].isActive = !courses[courseId].isActive;
        emit CourseStatusToggled(courseId, courses[courseId].isActive);
    }

    // Get all active courses
    function getActiveCourses() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // First, count active courses
        for (uint256 i = 1; i <= courseCounter; i++) {
            if (courses[i].isActive) {
                activeCount++;
            }
        }

        // Create array of active course IDs
        uint256[] memory activeCourseIds = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= courseCounter; i++) {
            if (courses[i].isActive) {
                activeCourseIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return activeCourseIds;
    }

    function getInstructorCourses(address instructor) external view returns (uint256[] memory) {
        return instructorCourses[instructor];
    }

    function getEnrollmentStatus(address student, uint256 courseId) external view returns (
        bool enrolled,
        uint256 completedSections,
        bool isCompleted
    ) {
        Enrollment storage enrollment = enrollments[student][courseId];
        return (
            enrollment.enrolledAt > 0,
            enrollment.completedSections,
            enrollment.isCompleted
        );
    }

    function completeCourseSection(uint256 courseId, uint256 sectionIndex) external 
        validCourseId(courseId) 
    {
        require(enrollments[msg.sender][courseId].enrolledAt > 0, "Not enrolled");
        require(sectionIndex < courses[courseId].sections.length, "Invalid section");
        
        Enrollment storage enrollment = enrollments[msg.sender][courseId];
        require(!enrollment.sectionProgress[sectionIndex], "Section already completed");

        enrollment.sectionProgress[sectionIndex] = true;
        enrollment.completedSections++;

        emit SectionCompleted(courseId, msg.sender, sectionIndex);

        // Check if all sections are completed
        if (enrollment.completedSections == courses[courseId].sections.length) {
            enrollment.isCompleted = true;
            emit CourseCompleted(courseId, msg.sender);
        }
    }

    // Get enrolled student count for a course
    function getEnrolledStudentCount(uint256 _courseId) public view returns (uint256) {
        return courses[_courseId].studentCount;
    }

    // Check if a course exists
    function courseExists(uint256 _courseId) public view returns (bool) {
        return courses[_courseId].id != 0;
    }
} 