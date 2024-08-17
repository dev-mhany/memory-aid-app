import { Box, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 2,
        backgroundColor: '#4169e1',
        color: '#fff',
        marginTop: 'auto',
      }}
    >
      <Typography variant='body2'>&copy; {new Date().getFullYear()} Memory Aid App. All rights reserved.</Typography>
    </Box>
  )
}
