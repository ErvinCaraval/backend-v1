# Academic Report: AI Usage in backend-v1 Project

**Author:** Ervin Caravali Ibarra  
**Student Code:** 1925648  
**Institution:** Universidad del Valle  
**Course:** Software Engineering / DevOps  
**Period:** September 20–25, 2025

---
## Table of Contents
1. Introduction
2. AI Usage Log
3. Prompts Used (Full Text)
4. Conclusions

---
## 1. Introduction
This report documents the use of Artificial Intelligence (AI) tools and prompts in the development and automation of the backend-v1 project. It details the objectives, actions, and results of each intervention, ensuring transparency and reproducibility.

---
## 2. AI Usage Log
A summary of all moments where AI was used to assist, generate, or optimize code, workflows, and documentation in the project.

---
## 3. Prompts Used (Full Text)

## 2. Advanced CI/CD Workflow Engineering
- **Complexity:** Requires deep knowledge of DevOps, automation, security, reporting, and multi-environment orchestration.
- **Why AI Needed:** To design and implement a workflow that is robust, fast, secure, and maintainable, covering all quality and operational requirements for backend-v1.
- **Location:** `.github/workflows/test.yml` (CI/CD workflow)
- **AI Prompt:**
  ```
You are a Senior DevOps Engineer and QA Automation Architect. For the backend-v1 project, design and implement a GitHub Actions CI/CD workflow that:

- Efficiently installs and caches all required dependencies (npm, node_modules, testing tools).
- Executes only the test scripts and steps that are actually present in the project (unit, integration, coverage).
- Generates and publishes coverage and log artifacts for every run.
- Strictly validates global coverage (≥95%) and supports a Node.js version matrix (at least two LTS and latest stable).
- Runs dependency and secret scanning for enhanced security, using the latest CodeQL v3 actions.
- Automatically cleans up old artifacts and logs, retaining only the last 14 days.
- Ensures idempotence, atomicity, and safe rollback on failures.
- Optimizes for speed, resource usage, and maintainability.
- Excludes notification steps and any invented or non-existent functionality.
- Embeds clear documentation and comments for every step, variable, and condition.

Output: The optimized workflow file, with comments and a brief justification for each improvement implemented.

  ```
# Technical Complexity Analysis (English)

## 1. AI-Powered Question Generation
- **Complexity:** Integrates Groq/OpenAI APIs, prompt engineering, fallback logic, robust JSON extraction.
- **Why AI Needed:** Requires expertise in prompt engineering, error handling, and output validation.
- **Location:** `/services/aiQuestionGenerator.js` (Class: `AIQuestionGenerator`)
- **AI Prompt:**
  ```
  You are an expert in prompt engineering and AI API integration. Given a Node.js class that generates trivia questions using Groq and OpenAI APIs, refactor the code to:
  - Improve prompt clarity and specificity.
  - Enhance JSON extraction from AI responses, handling edge cases.
  - Automate fallback between APIs and models.
  - Document expected input/output formats.
  Output: Refactored class code with inline comments explaining each improvement.
- **Why AI Needed:** Prone to race conditions, synchronization issues, and security vulnerabilities.
- **Location:** `/hybridServer.js` (Socket.IO event handlers)
- **AI Prompt:**
  ```
  You are a senior backend architect specializing in real-time multiplayer systems. Given a Socket.IO server that manages game sessions and authentication with Firebase, analyze the event handlers for race conditions, security flaws, and performance bottlenecks. Suggest and implement improvements for:
  - Room management and synchronization
  - Authentication and token validation
  - Error handling and event documentation
  Output: Detailed report of issues found, recommended changes, and refactored code snippets.
  ```
- **Location:** `/middleware/authenticate.js` (Function: `authenticate`)
- **AI Prompt:**
  ```
  You are a security-focused AI assistant. Given an Express middleware for Firebase JWT authentication, audit the code for vulnerabilities including token extraction, verification, and error handling. Suggest improvements for:
  - Handling malformed or missing tokens
  - Preventing replay attacks
  - Logging and monitoring authentication failures
  Output: Revised middleware function with enhanced security and inline comments.
  ```
- **Location:** `/jstool.js` (Main script logic)
- **AI Prompt:**
  ```
  You are an expert CLI tool designer. Given a Node.js script for processing JSON with JavaScript queries, review the code for usability, error handling, and performance. Suggest and implement improvements for:
  - Input validation (file vs. stdin)
  - Error messages and help output
  - Output formatting options
  Output: Refactored script with improved user experience and inline documentation.
  ```
## Role and Objective
Act as a Senior QA Automation and DevOps Engineer, specializing in the creation of highly reliable and error-free test suites. Your mission is to comprehensively analyze the `backend-v1` repository and, based solely on the existing source code, autonomously instrument a complete, production-grade, and extremely robust testing suite. Your ultimate goal is to achieve a test coverage of at least 95%, ensuring that every implemented test adheres to the highest quality standards.

## Strict Execution and Output Protocol
- No Conversational Output: It is strictly forbidden to output conversational text, progress reports, plans, summaries, or any explanations. Your function is not to describe the work, but to perform it directly.
- Direct Action, Not Narration: Do not narrate your actions. Instead of writing, "Now I will create the unit tests for `user.controller.js`," you must directly generate and apply the code for the corresponding test file.
- Silent Operation: Perform all analysis, code generation, and test execution silently. The only visible result of your work should be the final state of the modified project files.
- Final Manifest as Sole Report: The only plain text output allowed is the final `MANIFEST.md` file, which must be provided as the very last step upon successful completion of all other phases. Any output prior to the final manifest must be code or file modifications.

## Core Operating Principles
1. Full Autonomy: Execute all phases sequentially.
2. Code-Grounded Analysis: All tests must be derived directly from the existing code. Do not invent functionality.
3. Incremental Execution: Proceed module by module, verifying each step internally before continuing.
4. Idempotency and Isolation: Design all tests to be self-contained and leave no side effects.
5. Absolute Precision: Follow every requirement to the letter.

---
## Mandatory Test Implementation Standards
3. Deep and Precise Mocking Strategy: Mocks must be specific and accurately represent the structure of the modules they replace, including chained methods.
4. Robust and Less Brittle Assertions: Prefer structural and type assertions (`expect.any(String)`, `expect.objectContaining`) over hard-coded literal values.
5. Defensive Coding Within Tests: Check for null or undefined objects before accessing nested properties in your assertions to prevent test-breaking errors.

---
## Sequential Action Plan

### Phase 1: Analysis and Environment Setup
- Complete Repository Analysis: Start at the root directory and perform a static analysis of the entire `backend-v1` project. Identify all controllers, services, middleware, routes, utilities, scripts, and configuration files.
  - `firebase.test.js`: Modify the test to correctly handle the case where the `serviceAccountKey.json` file is missing.
  - `aiController.test.js`: Ensure the test for the `count=0` case fails with an HTTP 400 status code and verifies the exact error message.
  - `aiQuestionGenerator.test.js`: Fix the test so the `generator` is correctly imported, defined, and mocked.

### Phase 3: Unit Test Generation
- Objective: Create Jest unit tests for every controller, service, middleware, and utility.
- Quality Standards: You must rigorously apply all "Mandatory Test Implementation Standards" when writing each test.
- Coverage: Cover ALL public methods, branches, error paths, and edge cases.
- Parameterized Testing: Generate 5-10 distinct test cases per method covering typical inputs, boundary values, invalid inputs, null/missing inputs, and exceptional scenarios.
- Parameterized Testing: Generate 7-12 distinct test cases per endpoint covering valid payloads, invalid requests, authentication/authorization errors, rate limiting, and response schema validation.

### Phase 5: Load and Stress Test Generation
- Objective: Create Artillery YAML and k6 JS performance testing scripts in `tests/load/`.
- Implementation: Generate scripts for all major endpoints.
- Required Scenarios: For each major endpoint, create scripts for a gradual ramp-up, a spike load, a sustained high load, and a stress test.
- Assertions: Each scenario must include assertions for latency (p95, p99), throughput, error rate, and response correctness.

- Objective: Generate automated security tests integrated with the integration suite.
- Scenarios to Cover: SQL Injection, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and Authentication Bypass.
- Integration: Ensure these tests run as part of the integration test suite.

### Phase 7: Production Simulation and Chaos Testing
- Objective: Validate system resilience using mocks in the test environment.
- Scenarios to Simulate: Database connection failure, third-party API downtime, network latency/packet loss, and high concurrent connections.
- Implementation: Set up tests that use mocks to simulate these failures and verify that the system responds gracefully.

### Phase 8: Automation and Execution Scripts
1. Test Matrix Generator Utility: Create a `test_matrix_generator.js` script to help generate parameter combinations for tests.
2. Central Execution Script: Create a Bash script `run_all_tests.sh` in the project root. This script must:
   - Sequentially run all unit, integration, and security tests.
   - Print a detailed summary of the results.
   - Exit with a non-zero status code (`exit 1`) only if any test fails.
   - At the end of the execution, check the coverage report. If coverage is below 95%, display a clear warning message in the console indicating the current coverage and the target.
3. Coverage Configuration: Modify `package.json` or `jest.config.js` to generate coverage reports, but do not include a `coverageThreshold` that would cause the test run to fail prematurely.

### Phase 9: Continuous Integration (CI/CD) Workflow
- Objective: Create a GitHub Actions workflow at `.github/workflows/test.yml` that automates all testing.
- Implementation: The workflow must trigger on `push` and `pull_request` to `main`. It will install dependencies, load secrets, and execute the main script: `chmod +x run_all_tests.sh && ./run_all_tests.sh`.
- The workflow will fail automatically only if the `run_all_tests.sh` script exits with a non-zero status.

### Phase 10: Finalization and Reporting
1. Applying Changes: Apply all new and modified files directly into the repository's folder structure.
2. Report Generation: Configure tools to generate HTML and JSON reports in `tests/reports/` and log files in `tests/logs/`.
3. Manifest of Changes: Provide a `MANIFEST.md` file listing every created or modified file with a one-line description.
4. Final Verification: Your task is considered complete only when you have generated enough tests for the `run_all_tests.sh` script to execute with all tests passing and the final coverage report showing an overall and per-file value of ≥95%.

---
## 4. Conclusions
The use of AI in backend-v1 enabled rapid, robust, and secure automation of testing, deployment, and code quality processes. All interventions were documented, reproducible, and aligned with academic and professional standards.
