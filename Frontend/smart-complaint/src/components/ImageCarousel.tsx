import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface CarouselImage {
  url: string;
  title: string;
  description: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageCarousel({ images, autoPlay = true, interval = 5000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: 3 }}>
      {/* Images */}
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Box sx={{ textAlign: 'center', px: 4 }}>
              <Typography variant="h3" fontWeight={700} mb={2} sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                {image.title}
              </Typography>
              <Typography variant="h6" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)', maxWidth: 600, mx: 'auto' }}>
                {image.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={goToPrevious}
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.2)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.3)',
          }
        }}
      >
        <ChevronLeft fontSize="large" />
      </IconButton>

      <IconButton
        onClick={goToNext}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255,255,255,0.2)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.3)',
          }
        }}
      >
        <ChevronRight fontSize="large" />
      </IconButton>

      {/* Dots Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'white',
                transform: 'scale(1.2)'
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
}