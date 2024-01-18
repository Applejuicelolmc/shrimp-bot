# 🦐 Shrimp the discord bot 🦐

![Last commit on main)](https://img.shields.io/github/last-commit/Applejuicelolmc/shrimp-bot/main) ![Commit activity on main](https://img.shields.io/github/commit-activity/m/Applejuicelolmc/shrimp-bot/main)

[![Profile Picture](https://cdn.discordapp.com/avatars/483636847906521091/6fc100c817629fc08ca7bccf2d7134e7.webp?size=256)](https://letmegooglethat.com/?q=shrimp+emoji)

## Table of Contents

- [About Shrimp](#about-shrimp)
- [Features](#features)
  - [Commands (soon™)](#commands)
- [Setup](#setup)
  - [Bot configuration (soon™)](#bot-configuration)
- [Locally hosting the bot](#locally-hosting-this-bot-on-your-computer)
  - [Requirements](#requirements)
  - [Starting the bot with docker](#starting-your-bot-with-docker-compose)
  - [Preparation and starting the bot](#preparation-and-starting-your-bot-locally)

## About Shrimp

This is a work in progress personal discord bot that I started as a little side project. Invitation link will be provided once I'm satisfied with how far this bot has become

## Features

### Commands

Coming soon, somewhere in the future™

## Setup

### Bot configuration

Coming soon, somewhere in the future™

## Locally hosting this bot on your computer

### Requirements

- A system running linux (windows coming soon once I figure out how to make os specific startup scripts :P)
- NodeJS 16.9.0 or greater
- Either a local Mongodb database or a Mongodb Atlas database

### Starting your bot with docker compose

This is a very basic implementation of docker, so currently you cannot update to the latest version with docker, yet ;)

1. Make sure the latest version of docker is installed
2. Clone this repository to your computer/server
3. rename the `example.env` file you can find in the root of this project to `main.env`
4. Edit your new `main.env` file and add the neccesary tokens/id's described in it
5. Start the bot by running `sudo docker compose up -d`

### Preparation and starting your bot locally

1. Clone this repository to your computer/server
2. In your terminal, navigate to the folder where you stored this repository and run `npm install`
3. rename the `example.env` file you can find in the root of this project to `main.env`
4. Edit your new `main.env` file and add the neccesary tokens/id's described in it
5. Start your bot by running `npm start`
6. Removed some existing commands? Run `npm run reset` to reset the existing commands on all servers before adding the new commands

[Back to top](#-shrimp-the-discord-bot-)
