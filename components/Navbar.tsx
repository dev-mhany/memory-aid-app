'use client'

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebaseConfig'
import { User } from 'firebase/auth'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await auth.signOut()
    router.push('/')
  }

  return (
    <AppBar position='static' sx={{ backgroundColor: '#4169e1' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant='h6'>Memory Aid App</Typography>
        <Box>
          <Button color='inherit' component={Link} href='/'>
            Home
          </Button>
          <Button color='inherit' component={Link} href='/memory-game'>
            Memory Game
          </Button>
          {user ? (
            <Button color='inherit' component={Link} href='/profile'>
              Profile
            </Button>
          ) : (
            <Button color='inherit' component={Link} href='/patient'>
              Patient
            </Button>
          )}
          {user ? (
            <Button color='inherit' onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Button color='inherit' component={Link} href='/signin'>
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
