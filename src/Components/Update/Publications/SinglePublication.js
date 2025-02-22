import { Button, Card, CardContent, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function SinglePublication({pub}) {
    const navigate = useNavigate();
    return (
        <Card key={pub.id} className="shadow-lg rounded-lg">
            <CardContent>
                <Typography variant="subtitle1" lineHeight={1.15}>{pub.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {pub.publisher.title}
                </Typography>
                <Typography variant="body2">
                    {new Date(pub.publicationDate).toDateString()}
                </Typography>
                <Typography variant="body2" mb={2}>
                    <strong>Authors:</strong>{" "}
                    {pub.authors.map((author) => {
                           return (
                            <a style={{color:'blue'}} href={'https://web.bike-csecu.com/Team/'+author.id} target='__blank'> {author.name} |</a> 
                            )
                        }
                        )
                    }
                </Typography>
                <Button
                    variant="contained"
                    fullWidth
                    className="mt-2"
                    onClick={() => navigate(`/update/publications/${pub.id}`, { state: pub })}
                >
                    Update
                </Button>
            </CardContent>
        </Card>
    )
}
