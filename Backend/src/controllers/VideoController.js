import axios from "axios";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = process.env.BASE_URL || "https://escout-esports-scouting-platform-1.onrender.com"; // Use env var for production

/* ======================================================
   CONFIG: YOUTUBE PLAYLISTS & KEYWORDS
   ====================================================== */
const GAME_PLAYLISTS = {
  PUBG: ["UUHIS4ceYnZYpVXO31Fkg5_g", "UUibWZzkjMuzaYd0epLLjRpA"],
  "Free Fire": ["UUhLeCIE6M49IgW0anxMm4lw", "UUrPezsltlsZZiEkxTE2l39g"],
  Fortnite: ["UUEe2aqK4fgDYTOjkZvTvang"],
  Valorant: ["UU1_PJ9hWfuurTjmcBkNlo4A"],
  COD: ["UUVzejkZ0GVweFmMe8D_4w4A"],
};

const GAME_KEYWORDS = {
  PUBG: ["pubg", "bgmi", "battlegrounds"],
  "Free Fire": ["free fire", "ff"],
  Fortnite: ["fortnite"],
  Valorant: ["valorant"],
  COD: ["call of duty", "cod"],
};

// Helper: Convert ISO duration (PT4M13S) to seconds
const isoToSeconds = (iso) => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return (
    Number(match?.[1] || 0) * 3600 +
    Number(match?.[2] || 0) * 60 +
    Number(match?.[3] || 0)
  );
};

// Helper: Keyword matching
const containsGameKeyword = (text, game) => {
  const keywords = GAME_KEYWORDS[game];
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
};

/* ======================================================
   SECTION A: CREATORS ARCHIVE (YouTube API)
   Visibility: Public | Toggled via "Creators" button
   ====================================================== */
export const getCreatorsArchive = async (req, res) => {
  try {
    const videosByGame = {};

    for (const game in GAME_PLAYLISTS) {
      let allChannelsVideos = [];

      for (const playlistId of GAME_PLAYLISTS[game]) {
        let channelCollected = [];
        let pageToken = null;

        while (channelCollected.length < 10) {
          // 1. Fetch Playlist Items
          const playlistRes = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
            params: {
              part: "contentDetails",
              playlistId: playlistId,
              maxResults: 20,
              pageToken,
              key: YOUTUBE_API_KEY,
            },
          });

          pageToken = playlistRes.data.nextPageToken;

          const videoIds = playlistRes.data.items
            .map((item) => item.contentDetails?.videoId)
            .filter(Boolean).join(",");

          if (!videoIds) break;

          // 2. Fetch Video Details (for duration/stats)
          const videoRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
            params: {
              part: "snippet,statistics,contentDetails",
              id: videoIds,
              key: YOUTUBE_API_KEY,
            },
          });

          for (const video of videoRes.data.items) {
            if (channelCollected.length >= 10) break;
            const duration = isoToSeconds(video.contentDetails.duration);
            const isValid =
              duration > 150 &&
              video.snippet.liveBroadcastContent === "none" &&
              containsGameKeyword(video.snippet.title + " " + video.snippet.description, game);

            if (isValid) channelCollected.push(video);
          }
          if (!pageToken) break;
        }
        allChannelsVideos = [...allChannelsVideos, ...channelCollected];
      }

      // Sort newest first & Slice top 16
      allChannelsVideos.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
      videosByGame[game] = allChannelsVideos.slice(0, 16);
    }

    res.json(videosByGame);
  } catch (err) {
    console.error("YOUTUBE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch Creators Archive" });
  }
};

/* ======================================================
   SECTION B: PLAYERS DATABASE (MongoDB)
   Visibility: Public | Toggled via "Players" button
   ====================================================== */
export const getPlayersDatabase = async (req, res) => {
  try {
    // 1. Fetch ALL videos from DB
    const videos = await Video.find()
      .populate("uploadedBy", "userName name coverImage role") 
      .sort({ createdAt: -1 });

    const grouped = {};

    // 2. Normalize to match YouTube Structure
    videos.forEach((v) => {
      const gameKey = v.game || "Other";
      if (!grouped[gameKey]) grouped[gameKey] = [];

      grouped[gameKey].push({
        id: { videoId: v._id }, // Mapping _id to match YouTube's structure
        snippet: {
          title: v.title,
          thumbnails: {
            high: { url: `${BASE_URL}${v.thumbnail}` },
            medium: { url: `${BASE_URL}${v.thumbnail}` },
          },
          // Safe navigation in case user was deleted
          channelTitle: v.uploadedBy?.userName || v.uploadedBy?.name || "Arena Player",
          publishedAt: v.createdAt,
          description: "Community upload",
        },
        statistics: {
          viewCount: v.views || 0,
          likeCount: v.likes.length,
          commentCount: v.commentsCount || 0,
        },
        // Custom flags for Frontend handling
        isPlayerVideo: true,
        uploaderId: v.uploadedBy?._id, // Add ID for profile routing
        videoUrl: `${BASE_URL}${v.videoUrl}`,
        likesAttributes: v.likes, // Pass full array to check if user liked
        // userProfilePic removed as User model does not have it
      });
    });

    res.json(grouped);
  } catch (err) {
    console.error("PLAYERS DB ERROR:", err);
    res.status(500).json({ error: "Failed to fetch Players Database" });
  }
};

/* ======================================================
   SECTION C: PUBLIC PLAYER PROFILE 
   ====================================================== */
import { User } from "../models/user.model.js";

export const getPlayerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v -refreshToken -passwordResetOtp");
    if (!user) {
      return res.status(404).json({ error: "Player not found" });
    }

    const rawVideos = await Video.find({ uploadedBy: req.params.id }).sort({ createdAt: -1 });
    
    // Normalize videos to match Frontend expectations 
    const videos = rawVideos.map((v) => ({
      id: { videoId: v._id },
      snippet: {
        title: v.title,
        thumbnails: {
          high: { url: `${BASE_URL}${v.thumbnail}` },
          medium: { url: `${BASE_URL}${v.thumbnail}` },
        },
        channelTitle: user.userName,
        publishedAt: v.createdAt,
      },
      statistics: {
        viewCount: v.views || 0,
        likeCount: v.likes.length,
      },
      isPlayerVideo: true,
      uploaderId: user._id,
      videoUrl: `${BASE_URL}${v.videoUrl}`,
      game: v.game
    }));

    res.json({ user, videos });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ error: "Failed to fetch player profile" });
  }
};

/* ======================================================
   DASHBOARD: MY VIDEOS
   Visibility: Private | User's Personal Management
   ====================================================== */
export const getDashboardVideos = async (req, res) => {
  try {
    // Filter by the logged-in user's ID
    const videos = await Video.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ videos });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard videos" });
  }
};

/* ======================================================
   UTILITIES: UPLOAD, LIKE, COMMENT
   ====================================================== */

export const addVideo = async (req, res) => {
  try {
    const { title, game } = req.body;
    if (!req.files?.video || !req.files?.thumbnail) {
      return res.status(400).json({ message: "Files missing" });
    }

    const newVideo = await Video.create({
      title,
      game,
      videoUrl: `/public/temp/${req.files.video[0].filename}`,
      thumbnail: `/public/temp/${req.files.thumbnail[0].filename}`,
      uploadedBy: req.user._id,
    });

    res.status(201).json(newVideo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Enforce ownership: Only the uploader can delete
    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await video.deleteOne();
    res.json({ message: "Video deleted successfully", videoId: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const userId = req.user._id;
    const liked = video.likes.some(id => id.toString() === userId.toString());

    if (liked) {
      video.likes = video.likes.filter(id => id.toString() !== userId.toString());
    } else {
      video.likes.push(userId);
    }

    await video.save();
    res.json({ likes: video.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.create({
      videoId: req.params.id,
      userId: req.user._id,
      text,
    });
    // Increment comment count on Video model for efficiency
    await Video.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.id })
      .populate("userId", "name") // Assuming User model has 'name'
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const incrementView = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json({ views: video.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};