'use client'

import { useEffect, useState } from 'react'
import { Container, Typography, Box, Button } from '@mui/material'
import { db, auth } from '../../lib/firebaseConfig'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [patientInfo, setPatientInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async currentUser => {
      if (currentUser) {
        setUser(currentUser)

        const patientDocRef = doc(db, 'patients', currentUser.uid)
        const patientDoc = await getDoc(patientDocRef)
        if (patientDoc.exists()) {
          setPatientInfo(patientDoc.data())
        } else {
          router.push('/patient')
        }
      } else {
        router.push('/')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleDelete = async () => {
    if (user) {
      try {
        const patientDocRef = doc(db, 'patients', user.uid)
        await deleteDoc(patientDocRef)
        alert('تم حذف معلومات المريض بنجاح')
        router.push('/patient')
      } catch (e) {
        console.error('Error deleting document: ', e)
      }
    }
  }

  return (
    <Container
      maxWidth='sm'
      sx={{
        mt: 5,
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {patientInfo && (
        <>
          <Typography variant='h4' color='primary' gutterBottom>
            معلومات المريض
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant='body1'>
              <strong>اسم المريض:</strong> <span style={{ marginRight: '16px' }}>{patientInfo.name}</span>
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <strong>عمر المريض:</strong> <span style={{ marginRight: '16px' }}>{patientInfo.age}</span>
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <strong>حالة المريض:</strong> <span style={{ marginRight: '16px' }}>{patientInfo.condition}</span>
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <strong>الأغاني المفضلة للمريض:</strong>{' '}
              <span style={{ marginRight: '16px' }}>{patientInfo.favoriteSongs}</span>
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <strong>الأحداث المهمة وتواريخها:</strong>{' '}
              <span style={{ marginRight: '16px' }}>{patientInfo.importantEvents}</span>
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <strong>روتين يومي للمريض:</strong>{' '}
              <span style={{ marginRight: '16px' }}>{patientInfo.dailyRoutine}</span>
            </Typography>
          </Box>

          <Box sx={{ mt: 5 }}>
            <Typography variant='h4' color='primary' gutterBottom>
              إحصائيات آخر لعبة
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <strong>عدد الأخطاء:</strong> <span style={{ marginRight: '16px' }}>{patientInfo.lastGameMistakes}</span>
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <strong>الوقت المستغرق:</strong>{' '}
              <span style={{ marginRight: '16px' }}>{patientInfo.lastGameTime} ثانية</span>
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button variant='contained' color='primary' fullWidth onClick={() => router.push('/patient')}>
              تعديل المعلومات
            </Button>
            <Button variant='outlined' color='error' fullWidth sx={{ mt: 2 }} onClick={handleDelete}>
              حذف الحساب
            </Button>
          </Box>
        </>
      )}
    </Container>
  )
}
