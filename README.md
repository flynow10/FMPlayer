<p align="center" >
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://music.wagologies.com/favicon-dark-mode.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://music.wagologies.com/favicon-light-mode.svg">
    <img alt="Functional Music Player logo" src="https://music.wagologies.com/icon.svg" width="96" color="white">
  </picture>
  <h3 align="center">The Functional Music Player</h3>
</p>

## FMPlayer

This is a music player that is based on the concept of functional programming. It allows the creation of playlist that follow complex rules when played.

## Getting started

This project uses a myriad of services to accomplish various tasks. The biggest are listed here:

- Hosting: **[Vercel](https://vercel.com/)**
- Front End: **[Vite](https://vitejs.dev/) / [React](https://react.dev/)**
- Metadata storage: **[MySQL Database](https://www.mysql.com/)**
  - Database Connection: **[Vercel Serverless](https://vercel.com/docs/functions/serverless-functions)**
  - ORM: **[Prisma](https://www.prisma.io/client)**
- Audio Storage: **[AWS S3 Buckets](https://aws.amazon.com/s3/)**
- Audio Conversion: **[AWS Lambda](https://aws.amazon.com/lambda/)**
- Realtime Updates: **[Ably](https://ably.com/)**

The main feature of this project is the ability to write functional logic for how your music is played. The basic grammar for said logic is documented [here](grammar-planning.md).

Please see the [getting started](getting-started.md) page for how to setup this project

## How to Contribute

1. Create a new branch
2. Build your feature
3. Create a pull request on the **preview** branch

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
