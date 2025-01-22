# Project Overview

## Table of Contents
- [Introduction](#introduction)
- [Applications](#applications)
  - [Infra](#infra)
  - [Express](#express)
  - [Electron](#electron)
  - [Frontend](#frontend)
- [Libraries](#libraries)
  - [Frontend Common](#frontend-common)
- [Features](#features)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Introduction
This project is organized into multiple applications, each designed to address specific needs. The repository uses pnpm for efficient dependency management and workspace organization. Each application has its own dedicated document for detailed information.

## Applications

### Infra
This is the infrastructure application, responsible for managing the foundational elements required by other applications. It leverages AWS CDK to provision serverless infrastructure on AWS, adhering to consistent naming conventions to distinguish its subcomponents. Infra deploys three key stacks: User Stack, Backend Stack, and Frontend Stack.

[Read more about Infra](./infra/README.md)

### Express
The Express application serves as the API backend for the project. It provides APIs for user authentication, user management, and media management.

[Read more about Express](./express/README.md)

### Electron
The Electron application serves as the frontend application, built using Electron Vite for optimized performance. It integrates with the backend to handle authentication, user management, and media upload.

[Read more about Electron](./electron/README.md)

### Frontend
The Frontend application is built using Vite and React to provide a fast and responsive user interface. It includes authentication, user management, and media upload features.

[Read more about Frontend](./frontend/README.md)

## Libraries

### Frontend Common
The Frontend Common library contains shared code for the frontend and Electron applications. It provides reusable components, utilities, and styles to maintain consistency and reduce redundancy across both applications. All common frontend code should reside in this library.

[Read more about Frontend Common](./frontend-common/README.md)

## Features
This project supports the following features:
- **Authentication**: Secure login and session management across all applications.
- **User Management**: Tools for managing user profiles, roles, and settings.
- **Media Upload**: Functionality to upload, organize, and retrieve media files.

## Getting Started

1. Clone the repository (this is a template repository, so ensure you provide a custom name for your folder):
   ```bash
   git clone https://github.com/miguelludert/ml-express-boilerplate <custom-folder-name>
   ```
2. Navigate to the project directory:
   ```bash
   cd <custom-folder-name>
   ```
3. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```
4. Start the development server:
   ```bash
   pnpm start
   ```

## Contributing
We welcome contributions! Please review our [contribution guidelines](CONTRIBUTING.md) for more details.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

