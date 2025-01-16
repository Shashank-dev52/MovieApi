require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const TMDB_URL = 'https://api.themoviedb.org/3';
const TMDB_API_TOKEN = process.env.TMDB_API_TOKEN;

app.get('/movies/:year', async (req, res) => {
    const { year } = req.params;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1; // Convert to number safely

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
        const movies = movie_data.data.results
        const response = [];
        for (var movie of movies){
            const editors_data = []
            try{

                const credits_data = await axios.get(`${TMDB_URL}/movie/${movie.id}/credits?language=en-US`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${TMDB_API_TOKEN}`
                    },
                });
                const credits = credits_data.data.crew
                for(var credit of credits){
                    if(credit.known_for_department.toLowerCase().includes('editor')){
                        editors_data.push(credit.name)
                    }
                }

            } catch (error) {
                console.error(error.message);
            }
            const m_data = {

                title: movie.original_title,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                editors:editors_data
            }
            response.push(m_data)
        }
        res.status(200).json(response);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: `Failed to fetch movie with year: ${year}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});