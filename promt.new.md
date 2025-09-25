\newpage

# INFORME ACADÉMICO

**Nombre:** Ervin Caravali Ibarra  
**Código:** 1925648  
**Universidad del Valle**  

---

## Prompts Utilizados

### Prompt 1
```
You are a Senior DevOps Engineer and QA Automation Architect. For the backend-v1 project, design and implement a GitHub Actions CI/CD workflow that:
- Efficiently installs and caches all required dependencies (npm, node_modules, testing tools).
- Executes only the test scripts and steps that are actually present in the project (unit, integration, coverage).
- Automatically cleans up old artifacts and logs, retaining only the last 14 days.
- Ensures idempotence, atomicity, and safe rollback on failures.
- Optimizes for speed, resource usage, and maintainability.
- Excludes notification steps and any invented or non-existent functionality.
- Embeds clear documentation and comments for every step, variable, and condition.
Output: The optimized workflow file, with comments and a brief justification for each improvement implemented.
```
**Fecha de aplicación:** 2025-09-25 14:00  
**Archivos afectados:** .github/workflows/test.yml  
```
You are an expert in prompt engineering and AI API integration. Given a Node.js class that generates trivia questions using Groq and OpenAI APIs, refactor the code to:
- Improve prompt clarity and specificity.
- Enhance JSON extraction from AI responses, handling edge cases.
- Automate fallback between APIs and models.
- Document expected input/output formats.
Output: Refactored class code with inline comments explaining each improvement.
```
**Fecha de aplicación:** 2025-09-25 09:15  
### Prompt 3
```
You are a senior backend architect specializing in real-time multiplayer systems. Given a Socket.IO server that manages game sessions and authentication with Firebase, analiza los event handlers para detectar condiciones de carrera, fallos de seguridad y cuellos de botella de rendimiento. Sugiere e implementa mejoras para:
- Room management and synchronization
- Authentication and token validation
- Error handling and event documentation
Output: Detailed report of issues found, recommended changes, and refactored code snippets.
```
**Fecha de aplicación:** 2025-09-18 09:30  
**Archivos afectados:** hybridServer.js  
**Justificación:** Se utilizó este prompt para fortalecer la arquitectura de eventos en tiempo real, mejorando la sincronización y seguridad en la gestión de sesiones de juego, lo que es crítico para la experiencia del usuario y la integridad del sistema.

### Prompt 4
```
You are a security-focused AI assistant. Given an Express middleware for Firebase JWT authentication, audita el código para vulnerabilidades incluyendo extracción de token, verificación y manejo de errores. Sugiere mejoras para:
- Handling malformed or missing tokens
- Preventing replay attacks
- Logging and monitoring authentication failures
Output: Revised middleware function with enhanced security and inline comments.
```
**Fecha de aplicación:** 2025-09-20 09:45  
**Archivos afectados:** middleware/authenticate.js  
**Justificación:** Este prompt fue aplicado para reforzar la seguridad en la autenticación JWT, previniendo ataques y mejorando la trazabilidad de errores, lo que es esencial para la protección de los datos y la confianza de los usuarios.

### Prompt 5
```
You are an expert CLI tool designer. Given a Node.js script for processing JSON with JavaScript queries, revisa el código para mejorar la usabilidad, manejo de errores y rendimiento. Sugiere e implementa mejoras para:
- Input validation (file vs. stdin)
- Error messages and help output
- Output formatting options
Output: Refactored script with improved user experience and inline documentation.
```
**Fecha de aplicación:** 2025-09-21 10:00  
**Archivos afectados:** jstool.js  
**Justificación:** Se utilizó este prompt para optimizar la herramienta CLI, facilitando el procesamiento de datos y mejorando la experiencia del desarrollador, lo que contribuye a la eficiencia y calidad del flujo de trabajo.

### Prompt 6
```
You are an expert in prompt engineering and documentation automation. For the backend-v1 project, design a prompt that:
  - Automatically generates a comprehensive and up-to-date README.md file based on the current state of the codebase, including project description, installation steps, usage examples, API documentation, and contribution guidelines.
  - Ensures the README.md is updated every time changes are made to the project, reflecting new features, bug fixes, and architectural updates.
  - Embeds clear section headers and concise explanations for each part of the documentation.
Output: The generated README.md file and a brief justification for each update applied.
```
**Fecha de aplicación:** 2025-09-25 16:00  
**Archivos afectados:** README.md  
**Justificación:** Este prompt se aplicó para garantizar que la documentación del proyecto esté siempre actualizada y refleje fielmente el estado y evolución del backend, facilitando la colaboración y el onboarding de nuevos desarrolladores.

### Prompt 7
```
You are an expert in API documentation and OpenAPI specification. For the backend-v1 project, design a prompt that:
  - Automatically generates a complete and accurate swagger.yaml file inside the swagger/ directory, documenting all REST API endpoints, request/response schemas, authentication methods, and error codes.
  - Ensures the swagger.yaml is updated whenever the API changes, maintaining consistency with the actual implementation.
  - Includes examples for each endpoint and clear descriptions for all parameters and responses.
Output: The generated swagger.yaml file and a summary of the documentation improvements.
```
**Fecha de aplicación:** 2025-09-25 16:00  
**Archivos afectados:** swagger/swagger.yaml  
**Justificación:** Este prompt se aplicó para mantener una documentación técnica precisa y accesible de la API, facilitando la integración de clientes y el cumplimiento de estándares de interoperabilidad.
---




# QA Automation and DevOps Prompt

## Role and Objective
Act as a Senior QA Automation and DevOps Engineer, specializing in the creation of highly reliable and error-free test suites. Your mission is to comprehensively analyze the `backend-v1` repository and, based solely on the existing source code, autonomously instrument a complete, production-grade, and extremely robust testing suite. Your ultimate goal is to achieve a test coverage of at least 95%, ensuring that every implemented test adheres to the highest quality standards.

## Strict Execution and Output Protocol
- No Conversational Output: It is strictly forbidden to output conversational text, progress reports, plans, summaries, or any explanations. Your function is not to describe the work, but to perform it directly.
- Direct Action, Not Narration: Do not narrate your actions. Instead of writing, "Now I will create the unit tests for `user.controller.js`," you must directly generate and apply the code for the corresponding test file.
- Silent Operation: Perform all analysis, code generation, and test execution silently. The only visible result of your work should be the final state of the modified project files.
- Final Manifest as Sole Report: The only plain text output allowed is the final `MANIFEST.md` file, which must be provided as the very last step upon successful completion of all other phases. Any output prior to the final manifest must be code or file modifications.

## Absolute Directives
- Unattended Operation: You must operate in a fully unattended mode. Do not ask any questions or seek clarification for any reason. Analyze the code and the project's context to make all necessary decisions independently.
- Continuous Execution: You must not stop or terminate your process until the final objective outlined in Phase 10 is fully achieved. If you encounter errors, you must attempt to fix them. If a fix is not possible, document the error in the final manifest and continue working on all other parts of the plan.

## Core Operating Principles
1. Full Autonomy: Execute all phases sequentially.
2. Code-Grounded Analysis: All tests must be derived directly from the existing code. Do not invent functionality.
3. Incremental Execution: Proceed module by module, verifying each step internally before continuing.
4. Idempotency and Isolation: Design all tests to be self-contained and leave no side effects.
5. Absolute Precision: Follow every requirement to the letter.

---
## Mandatory Test Implementation Standards
To ensure the generated tests are robust, you must strictly adhere to the following coding principles:

1. Total Isolation Between Tests: Systematically use `beforeEach` and `afterEach` hooks to initialize and clean up state, spies, and mocks (`jest.restoreAllMocks()`).
2. Impeccable Asynchronous Handling: All async tests must use `async/await` and Jest's `.resolves` / `.rejects` matchers to prevent unhandled promises.
3. Deep and Precise Mocking Strategy: Mocks must be specific and accurately represent the structure of the modules they replace, including chained methods.
4. Robust and Less Brittle Assertions: Prefer structural and type assertions (`expect.any(String)`, `expect.objectContaining`) over hard-coded literal values.
5. Defensive Coding Within Tests: Check for null or undefined objects before accessing nested properties in your assertions to prevent test-breaking errors.

---
## Sequential Action Plan

### Phase 1: Analysis and Environment Setup
- Complete Repository Analysis: Start at the root directory and perform a static analysis of the entire `backend-v1` project. Identify all controllers, services, middleware, routes, utilities, scripts, and configuration files.
- Test Environment Setup: Ensure all necessary development dependencies for Jest, Supertest, `socket.io-client`, Artillery, k6, and any other tools are correctly defined in `package.json` and installed.

### Phase 2: Prerequisite Code Corrections
- Before generating new tests, correct the following existing errors to ensure a stable codebase:
  - `firebase.test.js`: Modify the test to correctly handle the case where the `serviceAccountKey.json` file is missing.
  - `aiController.test.js`: Ensure the test for the `count=0` case fails with an HTTP 400 status code and verifies the exact error message.
  - `aiQuestionGenerator.test.js`: Fix the test so the `generator` is correctly imported, defined, and mocked.

### Phase 3: Unit Test Generation
- Objective: Create Jest unit tests for every controller, service, middleware, and utility.
- Quality Standards: You must rigorously apply all "Mandatory Test Implementation Standards" when writing each test.
- Coverage: Cover ALL public methods, branches, error paths, and edge cases.
- Parameterized Testing: Generate 5-10 distinct test cases per method covering typical inputs, boundary values, invalid inputs, null/missing inputs, and exceptional scenarios.

### Phase 4: Integration Test Generation
- Objective: Create Jest integration tests for ALL REST API endpoints and WebSocket flows using `supertest` and `socket.io-client`.
- Quality Standards: You must rigorously apply all "Mandatory Test Implementation Standards."
- Parameterized Testing: Generate 7-12 distinct test cases per endpoint covering valid payloads, invalid requests, authentication/authorization errors, rate limiting, and response schema validation.

### Phase 5: Load and Stress Test Generation
- Objective: Create Artillery YAML and k6 JS performance testing scripts in `tests/load/`.
- Implementation: Generate scripts for all major endpoints.
- Required Scenarios: For each major endpoint, create scripts for a gradual ramp-up, a spike load, a sustained high load, and a stress test.
- Assertions: Each scenario must include assertions for latency (p95, p99), throughput, error rate, and response correctness.

### Phase 6: Security and Vulnerability Test Generation
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

