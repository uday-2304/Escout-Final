// Mock Tournament API Service
export const TournamentAPI = {
    getAll: async () => {
        return [
            {
                id: "1",
                title: "BGMI Pro League",
                game: "BGMI",
                status: "Upcoming",
                prizePool: "$50,000",
                date: "2024-03-15",
                region: "India",
                img: "https://via.placeholder.com/400x200"
            },
            {
                id: "2",
                title: "Valorant Challengers",
                game: "Valorant",
                status: "Live",
                prizePool: "$100,000",
                date: "2024-02-20",
                region: "NA",
                img: "https://via.placeholder.com/400x200"
            }
        ];
    },

    getById: async (id) => {
        return {
            id,
            title: "Tournament Details",
            description: "Mock details"
        };
    }
};