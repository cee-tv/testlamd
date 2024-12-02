"use client";
import React from "react";

function MainComponent() {
  const [player, setPlayer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const videoRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChannels, setShowChannels] = useState(false);
  const [isChangingChannel, setIsChangingChannel] = useState(false);
  const channels = [
    {
      name: "Channel 1",
      manifestUrl:
        "https://qp-pldt-live-grp-02-prod.akamaized.net/out/u/cg_a2z.mpd",
      keyId: "f703e4c8ec9041eeb5028ab4248fa094",
      key: "c22f2162e176eee6273a5d0b68d19530",
    },
    {
      name: "Channel 2",
      manifestUrl:
        "https://qp-pldt-live-grp-02-prod.akamaized.net/out/u/tv5_hd.mpd",
      keyId: "2615129ef2c846a9bbd43a641c7303ef",
      key: "07c7f996b1734ea288641a68e1cfdc4d",
    },
  ];
  const loadChannel = async (channel) => {
    if (!player || !channel) return;

    try {
      setIsChangingChannel(true);
      const clearKey = {
        keyIds: [channel.keyId],
        keys: [channel.key],
      };

      await player.configure({
        drm: {
          clearKeys: {
            [channel.keyId]: channel.key,
          },
        },
      });

      await player.load(channel.manifestUrl);
      setSelectedChannel(channel);
      setShowChannels(false);
      videoRef.current.play();
    } catch (error) {
      console.error("Error loading channel:", error);
      setIsChangingChannel(false);
    }
  };

  useEffect(() => {
    const initPlayer = async () => {
      const shaka = window.shaka;
      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) {
        console.error("Browser not supported!");
        return;
      }

      try {
        const shakaPlayer = new shaka.Player(videoRef.current);
        shakaPlayer.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 15,
            bufferBehind: 30,
          },
        });

        setPlayer(shakaPlayer);

        shakaPlayer.addEventListener("error", (event) => {
          console.error(
            "Error code",
            event.detail.code,
            "object",
            event.detail
          );
        });

        if (channels.length > 0) {
          setTimeout(() => {
            loadChannel(channels[0]);
          }, 100);
        }
      } catch (e) {
        console.error("Player failed to load", e);
      }
    };
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/shaka-player.compiled.js";
    script.async = true;
    script.onload = initPlayer;
    document.body.appendChild(script);

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] relative">
      {showChannels && (
        <div className="fixed top-0 left-0 w-[250px] h-full bg-[#1a1a1a]/95 backdrop-blur-lg shadow-2xl z-10 transition-all duration-300">
          <h2 className="text-white font-bold p-4 text-xl">Live TV</h2>
          <div className="relative px-4 mb-4">
            <i className="fas fa-search absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-[#2a2a2a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
          <div
            className="space-y-1 px-2 overflow-y-auto custom-scrollbar"
            style={{ height: "calc(100vh - 120px)" }}
          >
            {filteredChannels.map((channel) => (
              <button
                key={channel.name}
                onClick={() => loadChannel(channel)}
                className={`w-full p-3 text-left rounded-lg transition-all text-sm ${
                  selectedChannel?.name === channel.name
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                    : "bg-[#2a2a2a]/60 text-gray-300 hover:bg-[#2a2a2a]"
                }`}
              >
                <div className="flex items-center">
                  <i className="fas fa-tv mr-2"></i>
                  <span className="font-medium">{channel.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        {isChangingChannel && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <video
          ref={videoRef}
          className="w-full h-screen object-contain"
          controls
          autoPlay
          playsInline
          onPlaying={() => {
            setIsChangingChannel(false);
          }}
        />
      </div>
      <button
        onClick={() => setShowChannels(!showChannels)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all z-20"
      >
        <i
          className={`fas ${showChannels ? "fa-times" : "fa-bars"} text-lg`}
        ></i>
      </button>
    </div>
  );
}

export default MainComponent;