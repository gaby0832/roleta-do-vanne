const tmdbToken = process.env.TMDB_APIKEY;
const tmdbUrl = "https://api.themoviedb.org/3/";

export const getSearchList = async (query: string | null) => {
    return await fetchSearchMidias(query);
}

const fetchSearchMidias = async (query: string | null) => {
    if (query) {
        const response = await fetch(`${tmdbUrl}search/movie?query=${query}&include_adult=false&language=pt-BR&page=1`, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${tmdbToken}`,
            },
        });

        const result = await response.json();
        if (result.results && result.results.length <= 0) {
            return { message: "Nenhum resultado encontrado", error: true };
        } else {
            return result;
        }
    } else {
        return { error: "Nenhuma query encontrada" };
    }
};
