import axios from "axios";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

export const fetchPopularVideos = async (channelId) => {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: {
      part: "snippet",
      channelId,
      order: "date",
      maxResults: 15,
      type: "video",
      key: process.env.YOUTUBE_API_KEY,
    },
  });

  return response.data.items;
};
