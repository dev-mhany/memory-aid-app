'use client'
import { useState, useEffect } from 'react'
import { Container, TextField, Button, Typography, Box } from '@mui/material'
import { db, auth, provider } from '../../lib/firebaseConfig'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'

type PatientData = {
  name: string
  age: string
  condition: string
  favoriteSongs: string
  importantEvents: string
  dailyRoutine: string
}

export default function SignIn() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    age: '',
    condition: '',
    favoriteSongs: '',
    importantEvents: '',
    dailyRoutine: '',
  })
  const [isExisting, setIsExisting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async currentUser => {
      if (currentUser) {
        setUser(currentUser)
        const patientDocRef = doc(db, 'patients', currentUser.uid)
        const patientDoc = await getDoc(patientDocRef)
        if (patientDoc.exists()) {
          setFormData(patientDoc.data() as PatientData)
          setIsExisting(true)
        }
      } else {
        setUser(null)
        setIsExisting(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Sign-in popup was canceled.')
      } else {
        console.error('Google Sign-In Error:', error)
        alert('حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      try {
        const patientDocRef = doc(db, 'patients', user.uid)
        await setDoc(patientDocRef, formData)
        alert('تم تحديث معلومات المريض بنجاح')
        router.push('/profile')
      } catch (e) {
        console.error('Error updating document: ', e)
      }
    }
  }

  return (
    <Container maxWidth='sm' sx={{ mt: 5, direction: 'rtl' }}>
      {!user ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h5' color='textSecondary' gutterBottom>
            الرجاء تسجيل الدخول باستخدام Google لإدخال معلومات المريض.
          </Typography>
          <Button variant='contained' color='secondary' onClick={handleGoogleSignIn}>
            تسجيل الدخول باستخدام Google
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant='h4' color='primary' gutterBottom>
            {isExisting ? 'تحديث معلومات المريض' : 'إنشاء حساب مريض الزهايمر'}
          </Typography>
          <Box component='form' onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              label='اسم المريض'
              name='name'
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              margin='normal'
            />
            <TextField
              label='عمر المريض'
              name='age'
              type='number'
              fullWidth
              required
              value={formData.age}
              onChange={handleChange}
              margin='normal'
            />
            <TextField
              label='حالة المريض'
              name='condition'
              fullWidth
              required
              value={formData.condition}
              onChange={handleChange}
              margin='normal'
            />
            <TextField
              label='الأغاني المفضلة للمريض'
              name='favoriteSongs'
              multiline
              rows={4}
              fullWidth
              required
              value={formData.favoriteSongs}
              onChange={handleChange}
              margin='normal'
            />
            <TextField
              label='الأحداث المهمة وتواريخها'
              name='importantEvents'
              multiline
              rows={4}
              fullWidth
              required
              value={formData.importantEvents}
              onChange={handleChange}
              margin='normal'
            />
            <TextField
              label='روتين يومي للمريض'
              name='dailyRoutine'
              multiline
              rows={4}
              fullWidth
              required
              value={formData.dailyRoutine}
              onChange={handleChange}
              margin='normal'
            />
            <Button variant='contained' color='primary' type='submit' fullWidth sx={{ mt: 3 }}>
              {isExisting ? 'تحديث المعلومات' : 'إنشاء حساب'}
            </Button>
          </Box>
        </>
      )}
    </Container>
  )
}
