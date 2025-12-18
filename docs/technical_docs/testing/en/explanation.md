# Testing Strategy Documentation

## Overview
This document outlines the testing strategy for the PharmaXcess project, covering both backend and frontend components.

## Backend Testing

### Frameworks
- **Test Runner**: `pytest`
- **Mocking**: `unittest.mock` or `pytest-mock`

### Types of Tests
1.  **Unit Tests**:
    - Test individual functions and classes in isolation.
    - Example: Testing the `haversine` distance calculation function.
2.  **Integration Tests**:
    - Test the interaction between different modules or with the database.
    - Example: Testing the `/get_pharmacies` endpoint with a test database.

### Running Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_backend.py
```

## Frontend Testing

### Frameworks
- **Test Runner**: `Jest`
- **E2E**: `Cypress`

### Types of Tests
1.  **Component Tests**:
    - Verify that individual UI components render correctly and handle user interactions.
    - Example: Testing the `InsufficientStock` modal behavior.
2.  **Snapshot Tests**:
    - Ensure UI does not change unexpectedly.

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Continuous Integration
Tests are automatically run on every push to the repository as part of the CI/CD pipeline. See [CI/CD Documentation](../cicd/en/explanation.md) for more details.
