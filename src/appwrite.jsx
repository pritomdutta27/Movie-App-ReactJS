import { Client, TablesDB, Query, ID } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);

export const getTrendingMovies = async () =>{
    try {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [
                Query.limit(5),
                Query.orderDesc("count")
            ]
        });
        return result.rows;
    }catch (e) {
        console.error("Appwrite error:", e);
    }
}

export const updateSearchCount = async ({ searchTerm, movie }) => {
    const term = searchTerm?.trim();

    if (!term || !movie) {
        console.warn("Missing search term or movie");
        return;
    }

    try {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            queries: [
                Query.equal("searchTerm", term),
            ],
        });

        // 2. if it does, update the count
        if (result.rows.length > 0) {
            const row = result.rows[0];

            await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: row.$id,
                data: {
                    count: (row.count ?? 0) + 1,
                },
            });

            console.log("Search count updated");
        } else {
            //3. if it doesn't, create a new document with the search term and count as 1
            await tablesDB.createRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: ID.unique(),
                data: {
                    searchTerm: term,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                },
            });

            console.log("Search record created");
        }
    } catch (error) {
        console.error("Appwrite error:", error);
    }
};