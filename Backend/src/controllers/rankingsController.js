import Video from "../models/Video.js";
import { User } from "../models/user.model.js";

/*
  RANKING ALGORITHM
  Score starts at 0.
  +10 points per Video Uploaded
  +1 point per View
  +5 points per Like
*/

export const getPlatformRankings = async (req, res) => {
    try {
        const { game } = req.query;

        // Build Match Stage
        const matchStage = {};
        if (game && game.toUpperCase() !== "ALL") {
            // Case-insensitive match (e.g. "Valorant" matches "VALORANT")
            // Also handle BGMI/PUBG aliasing if needed, but strict regex for now
            matchStage.game = { $regex: new RegExp(`^${game}$`, "i") };
        }

        const rankingsPipeline = [
            // 1. FILTER BY GAME (if specified)
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),

            {
                $group: {
                    _id: "$uploadedBy",
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                    totalLikes: { $sum: { $size: "$likes" } }, // likes is an array of userIds
                },
            },
            {
                $lookup: {
                    from: "users", // MongoDB collection name for User model (ensure it matches)
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: "$userDetails",
            },
            {
                $project: {
                    _id: 1,
                    alias: "$userDetails.userName",
                    realName: "$userDetails.userName", // Using userName for both
                    img: "$userDetails.coverImage",
                    totalVideos: 1,
                    totalViews: 1,
                    totalLikes: 1,
                    score: {
                        $add: [
                            { $multiply: ["$totalVideos", 10] },
                            { $multiply: ["$totalViews", 1] },
                            { $multiply: ["$totalLikes", 5] },
                        ],
                    },
                },
            },
            { $sort: { score: -1 } }, // Descending Order
        ];

        const rankings = await Video.aggregate(rankingsPipeline);

        // Add Rank index
        const rankedData = rankings.map((r, index) => ({
            ...r,
            rank: index + 1,
            // Mocking team/winnings for now to match UI structure, or we can adapt UI
            team: "Platform Agent",
            winnings: `${r.score} PTS`
        }));

        res.json(rankedData);
    } catch (err) {
        console.error("RANKING ERROR:", err);
        res.status(500).json({ message: "Failed to calculate rankings" });
    }
};
