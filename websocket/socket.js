const WebSocket = require("ws");
const { searchPostsByTitle } = require("../controllers/postController");

const parseIncomingQuery = (message) => {
  try {
    const parsed = JSON.parse(message.toString());
    return parsed.query || "";
  } catch (error) {
    return message.toString();
  }
};

const initializeWebSocketServer = (server) => {
  const wss = new WebSocket.Server({
    server,
    path: "/ws",
  });

  wss.on("connection", (socket) => {
    socket.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket server connected. Send a search query to filter post titles.",
      })
    );

    socket.on("message", async (message) => {
      try {
        const query = parseIncomingQuery(message);
        const posts = await searchPostsByTitle(query);

        socket.send(
          JSON.stringify({
            type: "searchResults",
            query,
            count: posts.length,
            data: posts,
          })
        );
      } catch (error) {
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Failed to search posts.",
          })
        );
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket client error:", error.message);
    });
  });

  wss.on("listening", () => {
    console.log("WebSocket server attached at /ws");
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error.message);
  });

  return wss;
};

module.exports = initializeWebSocketServer;
