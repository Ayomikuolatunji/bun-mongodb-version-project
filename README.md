# MongoDB Versioning Using bun.sh and Typescript

This project demonstrates how to implement document versioning in MongoDB using TypeScript. We use `bun.sh` to manage our project dependencies and `MongoClient` for MongoDB. Docker is used to create a local MongoDB instance for testing.

## Prerequisites

Ensure you have the following installed on your system:

- [Bun](https://bun.sh) (v1.1.17)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

### Cloning the Repository

First, clone this repository to your local machine:

```bash
git clone <repository-url>
cd my-versioning-project
```

### Installing Dependencies

Install the required dependencies using Bun:

```bash
bun install
```

### Setting Up Environment Variables

Create a `.env` file in the project root and add the following variables:

```dotenv
MONGODB_URL="mongodb://root:example@localhost:27017"
DB_NAME="my-versioning-project"
```

### Setting Up MongoDB

Create a `docker-compose.yml` file in the project root to set up MongoDB and Mongo Express:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example

networks:
  default:
    name: mongodb_network
```

Start the MongoDB and Mongo Express services:

```bash
docker-compose up -d
```

Verify the containers are running:

```bash
docker ps
```

### Running the Project

Run the project using Bun:

```bash
bun run src/index.ts
```

## Project Structure

- `src/index.ts`: Main entry point for the project.
- `src/services/listingService.ts`: Contains the logic for connecting to MongoDB, creating listings, updating listings, and retrieving listing versions.
- `src/models/listing.ts`: Defines the TypeScript types for listings and listing versions.
- `src/services/listingService.test.ts`: Contains tests for the listing service functions.

## Running Tests

To run tests:

```bash
bun test
```

## Code Details

### Connecting to MongoDB

In `src/services/listingService.ts`, we define a `connectDB` function to connect to the MongoDB instance.

### Creating and Updating Listings

We define functions to create and update listings in `src/services/listingService.ts`.

### Test Cases

Refer to the `src/services/listingService.test.ts` file for detailed test cases that ensure the listing service works correctly. The test file includes cases for creating a new listing, updating a listing, retrieving listing versions, and getting a listing by ID.