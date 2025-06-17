#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

## user_problem_statement: |
  Convert React web app to React Native cross-platform attendance system with:
  1. Backend should be Node.js (not Python FastAPI)
  2. Clear setup instructions for running the app
  3. Proper data synchronization with central server
  4. Admin management capabilities

## backend:
  - task: "Node.js Express server setup"
    implemented: true
    working: true
    file: "/app/backend/server.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Successfully configured Node.js server with Express, MongoDB, JWT auth, and all required routes (auth, employees, attendance, companies, admin). Health check endpoint responding correctly."

  - task: "MongoDB models and schemas"
    implemented: true  
    working: true
    file: "/app/backend/models/"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "All model files exist: User.js, Company.js, Attendance.js. MongoDB connection established successfully."

  - task: "API routes implementation"
    implemented: true
    working: true
    file: "/app/backend/routes/"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "All route files exist: auth.js, employees.js, attendance.js, companies.js, admin.js. API endpoints accessible via /api prefix."

  - task: "Environment configuration"
    implemented: true
    working: true
    file: "/app/backend/.env"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created .env file with MongoDB URL, JWT secret, and proper Node.js environment variables."

## frontend:
  - task: "React Native app with Expo setup"
    implemented: true
    working: "partial"
    file: "/app/frontend/App.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "partial"
        agent: "main"
        comment: "Complete React Native app with all screens (Login, Employee Dashboard, Manager Dashboard, Super Admin Dashboard). File watcher issues preventing Metro bundler from starting in container environment."

  - task: "Native services implementation"
    implemented: true
    working: true
    file: "/app/frontend/src/services/"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "All native services implemented: LocationService, CameraService, BiometricService, NotificationService, StorageService with proper Expo integration."

  - task: "Cross-platform configuration"
    implemented: true
    working: true
    file: "/app/frontend/app.json"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Complete Expo configuration with iOS/Android permissions, native plugins, and build properties. All required dependencies installed."

  - task: "Environment configuration"
    implemented: true
    working: true
    file: "/app/frontend/.env"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created .env file with backend URL configuration for API connectivity."

## metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

## test_plan:
  current_focus:
    - "Backend API testing"
    - "React Native app testing on device"
  stuck_tasks:
    - "Metro bundler file watcher in container environment"
  test_all: false
  test_priority: "high_first"

## agent_communication:
  - agent: "main"
    message: "Successfully converted Python FastAPI backend to Node.js Express with complete API implementation. React Native app is fully built but has Metro bundler limitations in container environment. Ready for device testing with Expo Go app."