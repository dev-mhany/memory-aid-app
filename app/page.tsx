'use client'

import { useEffect, useState } from 'react'
import { Button, Container, Typography, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { auth, db, provider } from '../lib/firebaseConfig'
import { signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'
import PsychologyIcon from '@mui/icons-material/Psychology'
import SettingsIcon from '@mui/icons-material/Settings'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [patientInfo, setPatientInfo] = useState<any>(null)
  const [showIcons, setShowIcons] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async currentUser => {
      if (currentUser) {
        setUser(currentUser)
        const patientDocRef = doc(db, 'patients', currentUser.uid)
        const patientDoc = await getDoc(patientDocRef)
        if (patientDoc.exists()) {
          setPatientInfo(patientDoc.data())
        }
      } else {
        setUser(null)

        setPatientInfo(null)
      }
    })

    setTimeout(() => {
      setShowIcons(true)
    }, 3000)
    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Google Sign-In Error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      window.location.reload()
    } catch (error) {
      console.error('Sign-Out Error:', error)
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f0f8ff',
      }}
    >
      <Box
        className='animated-background'
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundSize: 'cover',
          zIndex: -1,
          animation: 'animateBackground 20s infinite linear',
        }}
      />
      <Container
        maxWidth='sm'
        sx={{
          textAlign: 'center',
          mt: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant='h3' color='primary' gutterBottom>
          ROBO_CARE يرحب بكم 🤖🎉
        </Typography>
        <Typography
          variant='body1'
          color='textSecondary'
          paragraph
          sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '18px' }}
        >
          هذا التطبيق مصمم لمساعدتك في إدارة وتنظيم يومك بسهولة. يمكنك إضافة مهامك اليومية أدناه ومتابعتها بسهولة. ابدأ
          بإضافة أول مهمة!
        </Typography>

        {!user ? (
          <Box sx={{ mt: 2 }}>
            <Button variant='contained' color='secondary' onClick={handleGoogleSignIn}>
              تسجيل الدخول باستخدام Google
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            {patientInfo ? (
              <>
                <Typography variant='h6' color='primary'>
                  مرحبًا، {user.displayName}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant='contained' color='primary' component={Link} href='/patient'>
                    عرض وتحديث معلومات المريض
                  </Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button variant='contained' color='secondary' onClick={handleSignOut}>
                    تسجيل الخروج
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ mt: 4 }}>
                <Button variant='contained' color='primary' component={Link} href='/patient'>
                  إنشاء حساب مريض الزهايمر
                </Button>
                <Box sx={{ mt: 2 }}>
                  <Button variant='contained' color='secondary' onClick={handleSignOut}>
                    تسجيل الخروج
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {showIcons && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Box
              sx={{
                margin: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <Link href='/family' passHref>
                <FamilyRestroomIcon sx={{ color: '#c71585', fontSize: '36px' }} />
                <Typography variant='h6' color='textPrimary'>
                  العائلة
                </Typography>
              </Link>
            </Box>
            <Box
              sx={{
                margin: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <Link href='/memory-game' passHref>
                <PsychologyIcon sx={{ color: '#4169e1', fontSize: '36px' }} />
                <Typography variant='h6' color='textPrimary'>
                  ألعاب لتحسين الذاكرة
                </Typography>
              </Link>
            </Box>
            <Box
              sx={{
                margin: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <Link href='/profile' passHref>
                <SettingsIcon
                  sx={{
                    color: '#4169e1',
                    fontSize: '36px',
                    padding: '10px',
                    border: '2px solid #4169e1',
                    borderRadius: '50%',
                  }}
                />
                <Typography variant='h6' color='textPrimary'>
                  إعدادات الحساب
                </Typography>
              </Link>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  )
}
