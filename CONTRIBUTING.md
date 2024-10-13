# Contributing to Editor Hub

We're thrilled that you're interested in contributing to Editor Hub! This document provides guidelines for contributing to the project. By participating in this project, you agree to abide by its terms.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Submitting a Pull Request](#submitting-a-pull-request)
6. [Coding Standards](#coding-standards)
7. [Reporting Bugs](#reporting-bugs)
8. [Requesting Features](#requesting-features)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [dev.dalia@shipmnts.com].

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Add the original repository as a remote named "upstream".
4. Create a new branch for your contribution.

## Development Setup

To set up your development environment, follow these steps:

1. Ensure you have Node.js (version 14 or later) and yarn installed.
2. Clone the repository:
   ```
   git clone https://github.com/your-username/editor-hub.git
   cd editor-hub
   ```
3. Install dependencies:
   ```
   yarn install
   ```
4. Build the project:
   ```
   yarn build
   ```
5. Link the package locally:
   ```
   yarn link
   ```

For more detailed setup instructions, refer to the README.md file

## Making Changes

1. Create a new branch for your changes:
   ```
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit them with a clear commit message.
3. Push your changes to your fork on GitHub.

## Submitting a Pull Request

1. Ensure your code adheres to the project's coding standards.
2. Update the README.md with details of changes to the interface, if applicable.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4. Submit a pull request to the `main` branch of the original repository.

## Coding Standards

- Follow the existing code style in the project.
- Use meaningful variable and function names.
- Write clear comments for complex logic.
- Ensure your code is properly formatted (you can use Prettier for consistent formatting).

## Reporting Bugs

1. Check if the bug has already been reported in the Issues section.
2. If not, create a new issue with a clear title and description.
3. Include steps to reproduce the bug and any relevant error messages or screenshots.

## Requesting Features

1. Check if the feature has already been requested in the Issues section.
2. If not, create a new issue with a clear title and detailed description of the proposed feature.
3. Explain why this feature would be useful to most Editor Hub users.

Thank you for contributing to Editor Hub!
