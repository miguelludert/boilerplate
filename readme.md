# The Boilerplate

## Overview

**The Boilerplate** is a template designed to serve as a starting point for other projects. It provides base implementations for the most common environments where TypeScript is deployed, including iOS, Android, Electron, browser, and aws services.  

## Author's comments

The long-term vision for this project is to evolve into a federated microservices architecture. However, the focus right now is on delivering something functional and practical, rather than investing time in a complex system from the start. The goal is to build a working foundation that allows applications to be deployed quickly while leaving room for growth.

The initial design uses REST because it’s straightforward and quicker to implement compared to the setup and verbosity of GraphQL. There’s a parallel project in the works that will introduce GraphQL later, but for now, simplicity and speed are key.

This project is about streamlining development. The aim is to identify reusable components and bake them into a flexible and extensible system. As it grows, I plan to move to NX for repository management when pnpm workspaces start to feel limiting. It’s also important to keep the architecture simple and intuitive so that it’s not just easy for me to use but also accessible to others.

Please see [docs/main.md](docs/main.md) for details on usage and architecture.

---

## Technologies Used

- **Primary Language:** TypeScript
- **Frameworks/Libraries:** Node.js
- **Other Tools:** AWS CDK, pnpm, Docker

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

