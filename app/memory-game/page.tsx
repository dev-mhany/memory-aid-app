'use client'

import React, { useState, useEffect } from 'react'
import { Container, Box, Typography, Button } from '@mui/material'
import { db, auth } from '../../lib/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'

type CardData = {
  id: number
  name: string
  flipped: boolean
  matched: boolean
}

type User = {
  uid: string
}

const emojis: Record<string, string> = {
  TV: '📺',
  VT: '🎥',
  hbird: '🐦',
  name: '💼',
  seal: '🦭',
  tracks: '🎶',
}

const CardComponent: React.FC<{
  id: number
  name: string
  flipped: boolean
  matched: boolean
  onClick: (name: string, id: number) => void
}> = ({ id, name, flipped, matched, onClick }) => {
  return (
    <Box
      onClick={() => (flipped || matched ? undefined : onClick(name, id))}
      sx={{
        width: '20%',
        height: '112px',
        padding: '10px',
        margin: '16px',
        boxSizing: 'border-box',
        textAlign: 'center',
        transition: '0.6s',
        transformStyle: 'preserve-3d',
        position: 'relative',
        transform: flipped || matched ? 'rotateY(180deg)' : 'none',
        '& .back, & .front': {
          backfaceVisibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '10px',
          transition: '0.6s',
          backgroundColor: '#e7e7e7',
        },
        '& .back': {
          fontSize: '50px',
          lineHeight: '120px',
          cursor: 'pointer',
          color: '#6d1124',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: matched ? 0 : 1,
        },
        '& .front': {
          transform: 'rotateY(180deg)',
          lineHeight: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: matched || flipped ? 1 : 0,
          animation: matched ? 'selected 0.8s ease 1 forwards' : 'none',
        },
      }}
    >
      <Box className='back'>❓</Box>
      <Box className='front'>{emojis[name]}</Box>
    </Box>
  )
}

const GameBoard: React.FC = () => {
  const initialCards: Array<keyof typeof emojis> = [
    'TV',
    'TV',
    'VT',
    'VT',
    'hbird',
    'hbird',
    'name',
    'name',
    'seal',
    'seal',
    'tracks',
    'tracks',
  ]

  const shuffle = (array: string[]): string[] => {
    let currentIndex = array.length
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
  }

  const [cardList, setCardList] = useState<CardData[]>([])
  const [flippedCards, setFlippedCards] = useState<CardData[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
        setUser(currentUser as User)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timerRunning) {
      timer = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timerRunning])

  // Shuffle cards only on the client side to prevent hydration errors
  useEffect(() => {
    setCardList(
      shuffle(initialCards).map((name, index) => ({
        id: index,
        name,
        flipped: false,
        matched: false,
      }))
    )
  }, [])

  const handleClick = (name: string, index: number) => {
    const updatedCards = cardList.map(card => (card.id === index ? { ...card, flipped: true } : card))

    const clickedCard = updatedCards.find(card => card.id === index)

    if (clickedCard) {
      setFlippedCards(prev => [...prev, clickedCard])
    }

    setCardList(updatedCards)

    if (flippedCards.length === 1) {
      setTimeout(() => checkMatch([flippedCards[0], clickedCard!]), 750)
    }
  }

  const checkMatch = (flipped: CardData[]) => {
    const [firstCard, secondCard] = flipped
    const updatedCards = cardList.map(card => {
      if (card.id === firstCard.id || card.id === secondCard.id) {
        if (firstCard.name === secondCard.name && firstCard.id !== secondCard.id) {
          return { ...card, matched: true }
        } else {
          setMistakes(prev => prev + 1)
          return { ...card, flipped: false }
        }
      }
      return card
    })

    setCardList(updatedCards)
    setFlippedCards([])
    if (updatedCards.every(card => card.matched)) {
      setGameOver(true)
      setTimerRunning(false)
      saveGameData()
    }
  }

  const saveGameData = async () => {
    if (user) {
      try {
        const patientDocRef = doc(db, 'patients', user.uid)
        await setDoc(
          patientDocRef,
          {
            lastGameTime: timeElapsed,
            lastGameMistakes: mistakes,
          },
          { merge: true }
        )
      } catch (e) {
        console.error('Error saving game data: ', e)
      }
    }
  }

  const restartGame = () => {
    setCardList(
      shuffle(initialCards).map((name, index) => ({
        id: index,
        name,
        flipped: false,
        matched: false,
      }))
    )
    setFlippedCards([])
    setGameOver(false)
    setMistakes(0)
    setTimeElapsed(0)
    setTimerRunning(true)
  }

  return (
    <Container maxWidth='md' sx={{ mt: 5 }}>
      <Box className='centered'>
        <Typography variant='h4' sx={{ mb: 2 }}>
          Memory Game
        </Typography>
        <Typography variant='h6'>Time: {timeElapsed} seconds</Typography>
        <Typography variant='h6'>Mistakes: {mistakes}</Typography>
      </Box>
      <Box
        className='game-board'
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          perspective: '1000px',
          mb: -2,
        }}
      >
        {!gameOver ? (
          cardList.map(card => (
            <CardComponent
              key={card.id}
              id={card.id}
              name={card.name}
              flipped={card.flipped}
              matched={card.matched}
              onClick={handleClick}
            />
          ))
        ) : (
          <Box className='centered'>
            <Typography variant='h5'>Game Over! 🎉</Typography>
            <Button
              className='restart-button'
              onClick={restartGame}
              sx={{ mt: 2, backgroundColor: '#6d1124', color: '#fff' }}
            >
              Restart Game
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default GameBoard
