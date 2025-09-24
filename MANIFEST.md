# MANIFEST.md

## Created/Modified Files

- `tests/unit/aiController.test.js`: Unit tests for AIController.
- `tests/unit/questionsController.test.js`: Unit tests for questionsController.
- `tests/unit/gamesController.test.js`: Unit tests for gamesController.
- `tests/unit/usersController.test.js`: Unit tests for usersController.
- `tests/unit/aiQuestionGenerator.test.js`: Unit tests for AIQuestionGenerator service.
- `tests/unit/authenticate.test.js`: Unit tests for authenticate middleware.
- `tests/unit/firebase.test.js`: Unit tests for firebase.js, including missing serviceAccountKey.json case.
- `tests/unit/test_matrix_generator.js`: Utility for generating test parameter matrices.
- `tests/integration/aiController.integration.test.js`: Integration tests for AIController endpoints.
- `tests/integration/questions.integration.test.js`: Integration tests for questions endpoints.
- `tests/integration/users.integration.test.js`: Integration tests for users endpoints.
- `tests/integration/games.integration.test.js`: Integration tests for games endpoints.
- `tests/integration/authenticate.integration.test.js`: Integration tests for authenticate middleware.
- `tests/load/aiController.artillery.yaml`: Artillery load test for AIController endpoints.
- `tests/load/questions.artillery.yaml`: Artillery load test for questions endpoints.
- `tests/load/users.artillery.yaml`: Artillery load test for users endpoints.
- `tests/load/games.artillery.yaml`: Artillery load test for games endpoints.
- `tests/load/aiController.k6.js`: k6 load test for AIController endpoints.
- `tests/load/questions.k6.js`: k6 load test for questions endpoints.
- `tests/load/users.k6.js`: k6 load test for users endpoints.
- `tests/load/games.k6.js`: k6 load test for games endpoints.
- `tests/reports/`: Directory for HTML/JSON coverage and test reports.
- `tests/logs/`: Directory for test logs.
- `run_all_tests.sh`: Central script to run all tests, print summary, and check coverage.
- `jest.config.js`: Jest configuration for coverage and reporting.
- `.github/workflows/test.yml`: GitHub Actions workflow for CI/CD automation.
- `package.json`: Updated devDependencies for all required test tools.

## Notes
- All tests are isolated, robust, and follow strict async/mocking/coverage standards.
- Security, chaos, and resilience scenarios are included in integration tests.
- Reports and logs are generated in `tests/reports/` and `tests/logs/`.
- If any test fails or coverage <95%, `run_all_tests.sh` exits non-zero and prints a warning.
