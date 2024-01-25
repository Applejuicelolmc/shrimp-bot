# 🦐 Shrimp the discord bot 🦐

[![applejuicelolmc/shrimp-bot:latest](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/docker.yml/badge.svg)](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/docker.yml) 
[![CodeQL](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/Applejuicelolmc/shrimp-bot/actions/workflows/github-code-scanning/codeql)
![Last commit on main)](https://img.shields.io/github/last-commit/Applejuicelolmc/shrimp-bot/main)
![Commit activity on main](https://img.shields.io/github/commit-activity/m/Applejuicelolmc/shrimp-bot/main) 

[![Profile Picture](https://cdn.discordapp.com/avatars/483636847906521091/6fc100c817629fc08ca7bccf2d7134e7.webp?size=256)](https://letmegooglethat.com/?q=shrimp+emoji)

<details>
<summary>

## Table of Contents

</summary>

- [About Shrimp](#about-shrimp)
- [Features](#features)
  - [Commands (soon™)](#commands)
- [Setup](#setup)
  - [Bot configuration (soon™)](#bot-configuration)
- [Deploying the bot](#deploying-the-bot)
  - [Requirements](#requirements)
  - [Deployment methods](#deployment-methods)
    - [Starting your bot with portainer](#starting-your-bot-with-portainer)
    - [Starting your bot with docker compose](#starting-your-bot-locally-with-docker-compose)
    - [Running your bot with pnpm](#running-your-bot-with-pnpm)

</details>

## About Shrimp

This is a work in progress personal discord bot that I started as a little side project. Invitation link will be provided once I'm satisfied with how far this bot has come.

## Features

### Commands

Coming soon, once I automate command documentation

## Setup

### Bot configuration

Coming soon, once I can get settings working via mongodb

## Deploying the bot

### Requirements

- A working portainer/docker setup OR a system running linux (only when running locally)
- A working pnpm install (only  when running locally)
- NodeJS 16.9.0 or greater (only when running locally)
- Either a local Mongodb database or a Mongodb Atlas database

<details>
<summary>

### Deployment methods

</summary>

<details open>
<summary>

#### Starting your bot with portainer

</summary>

1. Make sure you have a working portainer setup
2. Copy the `example.env` to the computer you use to access portainer and rename it to `main.env`
3. Edit your new `main.env` file and add the neccesary tokens/id's described in it
4. In portainer: add a new container from dockerhub with this specific image: `applejuicelolmc/shrimp-bot:latest`
5. Go the advanced container settings and there: click on the `env` tab, there you can upload the `main.env` file
6. That's it now you should be able to deploy the container if all env variables are correct

</details>

<details>
<summary>

#### Starting your bot locally with docker compose

</summary>

1. Make sure the latest version of docker is installed
2. Clone this repository to your computer/server
3. rename the `example.env` file you can find in the root of this project to `main.env`
4. Edit your new `main.env` file and add the neccesary tokens/id's described in it
5. Start the bot by running `sudo docker compose up -d`

</details>

<details>
<summary>

#### Running your bot with pnpm

</summary>

1. Clone this repository to your computer/server
2. In your terminal, navigate to the folder where you stored this repository and run `pnpm install`
3. rename the `example.env` file you can find in the root of this project to `main.env`
4. Edit your new `main.env` file and add the neccesary tokens/id's described in it
5. Start your bot by running `pnpm start`
6. Removed some existing commands? Run `pnpm run reset` to reset the existing commands on all servers before adding the new commands (Gonna automate this sometime)

</details>

</details>

[Back to top](#-shrimp-the-discord-bot-)
