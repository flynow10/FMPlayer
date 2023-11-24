# Getting Started

This page will take you through how to setup the FMPlayer for development. Deploying your own version of this project will take extra work.

## Prerequisites

- [Node JS](https://nodejs.org/en) v18
  - This project works with NVM, so running `nvm use` in the project directory will install the necessary node version.
- [Yarn](https://classic.yarnpkg.com/lang/en/) v1
- [Git](https://git-scm.com/)
- A text editor
  - This project works best with [VSCode](https://code.visualstudio.com/) as it has many extensions that enhance the development process.

## Things to note

### Song files

When running the project locally, features that require aws will be disabled. This means that uploading songs will ONLY update the database. You will be required to manually add any actual song files to the static directory.

### Ably Realtime

This project uses an ably realtime connection (even in development) to inform clients about changes to the database. While an account is not required to run the project, the web client will NOT display new changes to the database without reloading the page! This is not a bug, but an update to allow the ably client to run completely locally is in progress.

### Configuration

At the moment there are two location for configuration. This tutorial will walk you through all the required configuration which is found in the `.env` file. The second is for developer options and can be found in `./config/debug.config.ts`

## Steps

---

To get started, clone the repository:

```sh
git clone https://github.com/flynow10/FMPlayer.git
```

---

Next, install a mysql database. This is necessary to store the metadata of your music library. You can find the community edition [here](https://www.mysql.com/products/community/).

Once installed, use connect to the database using the `mysql` command and create a new database named `fmplayer` with the command:

```sql
CREATE DATABASE fmplayer;
```

---

Next, make a copy of the `.env.example` file and name it `.env`. Open `.env` in your text editor.

The only required change is to make sure you have the correct msql connection string, but other fields to note are also documented in the example file.

---

Next, in the project directory, run the following commands:

```sh
yarn
yarn prisma migrate dev
yarn prisma db seed
```

`yarn` installs the required node dependencies.
The other two commands create the required tables and insert some test data into the database.

---

Finally run the dev command:

```sh
yarn dev
```

If all goes well, you should now be able to use and develop the project on your local machine.

---
