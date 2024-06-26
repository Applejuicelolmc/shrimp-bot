# 🦐 Shrimp the discord bot 🦐

[![applejuicelolmc/shrimp-bot:latest](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/docker.yml/badge.svg)](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/docker.yml)
[![CodeQL](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/github-code-scanning/codeql)
![Last commit on main)](https://img.shields.io/github/last-commit/Applejuicelolmc/shrimp-bot/main)
![commits](https://badgen.net/github/commits/applejuicelolmc/shrimp-bot/main)
![Repo Size](https://img.shields.io/github/repo-size/Applejuicelolmc/shrimp-bot)

![Profile Picture](https://cdn.discordapp.com/avatars/483636847906521091/a_d88ccd63c07b9179e952e2881e8b9d4e.gif?size=512)

[![NodeJS](https://img.shields.io/badge/Node.js-v18.15.3-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![PNPM](https://img.shields.io/badge/Pnpm-v8.14.3-FF6C37?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]( https://www.typescriptlang.org/)
[![Mongodb](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/repository/docker/applejuicelolmc/shrimp-bot/general)

<details>
<summary>

## Table of Contents

</summary>

- [About Shrimp](#about-shrimp)
- [Features](#features)
  - [Commands](#commands)
- [Setup](#setup)
  - [Bot configuration (soon™)](#bot-configuration)
- [Deploying the bot](#deploying-the-bot)
  - [Requirements](#requirements)
  - [Deployment methods](#deployment-methods)
    - [Starting your bot with portainer](#1️⃣-starting-your-bot-with-portainer)
    - [Starting your bot with docker compose](#2️⃣-starting-your-bot-locally-with-docker-compose)
    - [Running your bot with pnpm](#3️⃣-running-your-bot-with-pnpm)

</details>

## About Shrimp

This is a work in progress personal discord bot that I started as a little side project. Invitation link will be provided once I'm satisfied with how far this bot has come.

## Features

### Commands

Here's a list of all the commands that are currently available for the bot: [Commands](/readme/commands.md)

## Setup

### Bot configuration

Coming soon, once I can get settings working via mongodb

## Deploying the bot

### Requirements

- A working portainer/docker setup OR a system running linux (only when running locally)
- A working pnpm install (only  when running locally)
- NodeJS 16.9.0 or greater (only when running locally)
- Either a local Mongodb database or a Mongodb Atlas database

<details open>
<summary>

### Deployment methods

</summary>

#### 1️⃣ Starting your bot with portainer

[![Portainer](https://img.shields.io/badge/Portainer-2496ED?style=for-the-badge&logo=portainer&logoColor=white)](https://www.portainer.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/repository/docker/applejuicelolmc/shrimp-bot/general)

1. Make sure you have a working portainer setup
2. Copy the `example.env` to the computer you use to access portainer and rename it to `main.env`
3. Edit your new `main.env` file and add the neccesary tokens/id's described in it
4. In portainer: add a new container from dockerhub with this specific image: `applejuicelolmc/shrimp-bot:latest`
5. Go the advanced container settings and there: click on the `env` tab, there you can upload the `main.env` file
6. That's it now you should be able to deploy the container if all env variables are correct

#### 2️⃣ Starting your bot locally with docker compose

[![Docker-Compose](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

1. Make sure the latest version of docker is installed
2. Clone this repository to your computer/server
3. rename the `example.env` file you can find in the root of this project to `main.env`
4. Edit your new `main.env` file and add the neccesary tokens/id's described in it
5. Start the bot by running `sudo docker compose up -d`

#### 3️⃣ Running your bot with pnpm

[![NodeJS](https://img.shields.io/badge/Node.js-v18.15.3-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![PNPM](https://img.shields.io/badge/Pnpm-v8.14.3-FF6C37?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

1. Clone this repository to your computer/server
2. In your terminal, navigate to the folder where you stored this repository and run `pnpm install`
3. rename the `example.env` file you can find in the root of this project to `main.env`
4. Edit your new `main.env` file and add the neccesary tokens/id's described in it
5. Start your bot by running `pnpm start`
6. Removed some existing commands? Run `pnpm run reset` to reset the existing commands on all servers before adding the new commands (Gonna automate this sometime)

</details>

[Back to top](#-shrimp-the-discord-bot-)
