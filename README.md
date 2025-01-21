# Clash Of Clan War Tracker

This repository contains a Clash Of Clan War Tracker application, hardcoded for one clan at the moment. The project is written entirely in JavaScript.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Clash Of Clan War Tracker is designed to help you track the war status, performance, and other relevant metrics for your clan. This project is currently hardcoded for a specific clan but aims to provide a foundation for further customization and enhancements.

## Features

- Track war status and performance
- Display relevant metrics and statistics
- User-friendly interface
- Integration with Discord for notifications and updates

## Installation

To get started with the Clash Of Clan War Tracker, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Dev-Zenos/coc-war-tracker.git
    cd coc-war-tracker
    ```

2. **Install dependencies:**

    Ensure you have Node.js installed. Then, run:

    ```bash
    npm install
    ```

## Configuration

Before running the application, you need to set up your environment variables. Create a `.env` file in the root directory and add the following variables:

```env
DISCORD_BOT_TOKEN=your_discord_bot_token_here
MONGO_DB_ACCESS_TOKEN=your_mongo_db_access_token_here
CLAN_TAG=your_clan_tag_here
```

- `DISCORD_BOT_TOKEN`: Your Discord bot token to enable the bot to interact with your Discord server.
- `MONGO_DB_ACCESS_TOKEN`: Your MongoDB access token to connect to your MongoDB database.
- `CLAN_TAG`: The tag of your Clash of Clans clan to track.

## Usage

To run the application, use the following command:

```bash
node index.js
```

This will start the discord bot.

## Contributing

I welcome contributions to enhance the functionality and features of this project. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your forked repository.
5. Create a pull request to merge your changes into the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
```
