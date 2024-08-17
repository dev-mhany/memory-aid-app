import { Container, Typography, Box, Button } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function ThankYou() {
  const router = useRouter()

  return (
    <Container maxWidth='sm' sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant='h4' color='primary' gutterBottom>
        شكرًا لكم على إنشاء حساب المريض
      </Typography>
      <Typography variant='body1' color='textSecondary' paragraph>
        سيتم تنبيهكم في حالة حدوث أي حوادث.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant='contained' color='primary' onClick={() => router.push('/')}>
          العودة إلى الصفحة الرئيسية
        </Button>
      </Box>
    </Container>
  )
}
