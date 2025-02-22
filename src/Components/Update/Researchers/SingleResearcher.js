import { Card, CardContent, CardMedia, Typography } from '@mui/material'
import React from 'react'
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function SingleResearcher({ researcher }) {

    const navigate = useNavigate();

    return (
        <Card key={researcher.id} className="shadow-lg rounded-lg">
            <CardMedia component="img" sx={{ height: '200px',objectFit:'contain'}} image={researcher.profilePhoto} alt={researcher.name} />
            <CardContent>
                <Typography variant="subtitle1" lineHeight={1} my={1}>{researcher.name}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/update/researchers/${researcher.id}`, { state: researcher })}
                >
                    Update
                </Button>
            </CardContent>
        </Card>
    )
}
