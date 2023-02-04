# 🎲🧙 dicewizard.net

dicewizard.net is a free, open-source website for virtual tabletop gaming. With this website, you can roll dice and share the results with your friends using websockets. No more need to physically roll dice or use a random number generator – this website has got you covered in a suitably retro style!

## Features
- Roll one or multiple dice with customizable number of sides
- Real-time updates using websockets
- Share the results with friends in a virtual tabletop gaming session
- Easy to use and navigate user interface

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

To run this project, you need to have Node.js and npm installed on your computer. You can download them from the official website: https://nodejs.org/

### Installing

1. Clone the repository to your local machine:

```
git clone https://github.com/jasoncabot/dicewizard.net.git
```

2. Navigate to the project directories and install dependencies

```
cd client
yarn
cd ../server
yarn
```

4. Start the server locally:

```
cd server
yarn dev
```

5. Start the client locally:

```
cd client
yarn start
```

5. Open your web browser and go to `http://localhost:3000/`

## Built With

- [Cloudflare Workers](https://workers.cloudflare.com) - JavaScript runtime
- [Cloudflare Pages](https://pages.cloudflare.com) - Developer focused static site hosting
- [Cloudflare Durable Objects](https://www.cloudflare.com/en-gb/products/durable-objects/) - Realtime communication using WebSockets

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
