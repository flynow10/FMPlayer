# Getting Started

This page will take you through how to setup the FMPlayer for development. Deploying your own version of this project will take extra work.

### Prerequisites

- [Node JS](https://nodejs.org/en) v18
  - This project works with NVM, so running `nvm use` in the project directory will install the necessary node version.
- [Yarn](https://classic.yarnpkg.com/lang/en/) v1
- [Git](https://git-scm.com/)
- A text editor
  - This project works best with [VSCode](https://code.visualstudio.com/) as it has many extensions that enhance the development process.

### Steps

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

Be sure to fill in the password hash, jwt secret key, and check that the database url is correct.

Although it isn't required if you would like to use the realtime updates features you will need an [Ably](https://ably.com/) account and your root key.

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

## Things to note

When running the project locally, features that require aws will be disabled. This means that uploading songs will ONLY update the database. You will be required to manually add any actual song files to the static directory.
