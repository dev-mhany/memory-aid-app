'use client'
import { ReactNode } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4169e1',
    },
    secondary: {
      main: '#ff4500',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
})

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='ar'>
      <head>
        <title>Memory Aid App</title>
      </head>
      <body style={{ backgroundColor: '#f0f8ff', margin: 0, padding: 0 }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 'calc(100vh - 120px)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div className='animated-background'></div>
            {children}
          </Box>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
