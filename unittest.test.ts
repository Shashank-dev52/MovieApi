import request from 'supertest';
import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();

// Mock Axios
jest.mock('axios');

// Sample data for testing
const mockMovieData = {
    data: {
        results: [
            {
                id: 1,
                original_title: "Mock Movie 1",
                release_date: "2023-01-01",
                vote_average: 8.0
            },
            {
                id: 2,
                original_title: "Mock Movie 2",
                release_date: "2023-02-01",
                vote_average: 7.5
            }
        ]
    }
};

const mockCreditsData = {
    data: {
        crew: [
            { name: "Editor 1", known_for_department: "Editing" },
            { name: "Editor 2", known_for_department: "Editing" }
        ]
    }
};

// Set up the route
const TMDB_URL = 'https://api.themoviedb.org/3';
const TMDB_API_TOKEN = 'mock_token';

interface Movie {
    original_title: string;
    release_date: string;
    vote_average: number;
    id: number;
}

interface Credit {
    known_for_department: string;
    name: string;
}

app.get('/movies/:year', async (req: Request, res: Response) => {
    const { year } = req.params;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1;

    try {
        const movie_data = await axios.get(`${TMDB_URL}/discover/movie?language=en-US`, {
            params: {
                primary_release_year: year,
                sort_by: 'popularity.desc',
                page
            },
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_API_TOKEN}`
            }
        });

        // Explicitly type the response data as Movie[]
        const movies: Movie[] = movie_data.data.results;

        // Fetch credits data concurrently
        const moviePromises = movies.map(async (movie: Movie) => { // Explicitly type movie here
            let editors_data: string[] = [];
            try {
                const credits_data = await axios.get(`${TMDB_URL}/movie/${movie.id}/credits?language=en-US`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${TMDB_API_TOKEN}`
                    }
                });

                editors_data = credits_data.data.crew
                    .filter((credit: any) => credit.known_for_department.toLowerCase().includes('editing'))
                    .map((credit: any) => credit.name);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error(`Failed to fetch credits for movie ${movie.id}: ${error.message}`);
                }
            }

            return {
                title: movie.original_title,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                editors: editors_data
            };
        });

        const response = await Promise.all(moviePromises);

        res.status(200).json(response);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Failed to fetch movies: ${error.message}`);
        }
        res.status(500).json({ error: `Failed to fetch movie with year: ${year}` });
    }
});

// Test cases

describe('GET /movies/:year', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return movies and editors successfully', async () => {
        (axios.get as jest.Mock).mockImplementation((url: string) => {
            if (url.includes('/discover/movie')) {
                return Promise.resolve(mockMovieData);
            }
            if (url.includes('/credits')) {
                return Promise.resolve(mockCreditsData);
            }
            return Promise.reject(new Error('Invalid URL'));
        });

        const response = await request(app).get('/movies/2023');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                title: "Mock Movie 1",
                release_date: "2023-01-01",
                vote_average: 8.0,
                editors: ["Editor 1", "Editor 2"]
            },
            {
                title: "Mock Movie 2",
                release_date: "2023-02-01",
                vote_average: 7.5,
                editors: ["Editor 1", "Editor 2"]
            }
        ]);
    });


});
