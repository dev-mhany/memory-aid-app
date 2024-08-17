'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { db, auth } from '../../lib/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

type FamilyMember = {
  id: string
  name: string
  relationship: string
  contact: string
}

export default function Family() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    contact: '',
  })
  const [editMemberId, setEditMemberId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const currentUser = auth.currentUser
      if (currentUser) {
        setUserId(currentUser.uid)
        const patientDocRef = doc(db, 'patients', currentUser.uid)
        const patientDoc = await getDoc(patientDocRef)
        if (patientDoc.exists()) {
          const data = patientDoc.data()
          if (data && data.familyMembers) {
            setFamilyMembers(data.familyMembers)
          }
        }
      }
    }

    fetchFamilyMembers()
  }, [])

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditMemberId(null)
    setNewMember({ name: '', relationship: '', contact: '' })
  }

  const handleSaveMember = async () => {
    let updatedFamilyMembers: FamilyMember[]
    if (editMemberId) {
      updatedFamilyMembers = familyMembers.map(member =>
        member.id === editMemberId ? { ...newMember, id: editMemberId } : member
      )
    } else {
      const newId = new Date().getTime().toString() // Generate a simple unique ID
      updatedFamilyMembers = [...familyMembers, { ...newMember, id: newId }]
    }

    if (userId) {
      const patientDocRef = doc(db, 'patients', userId)
      await updateDoc(patientDocRef, { familyMembers: updatedFamilyMembers })
    }

    setFamilyMembers(updatedFamilyMembers)
    handleCloseDialog()
  }

  const handleEditMember = (member: FamilyMember) => {
    setNewMember({
      name: member.name,
      relationship: member.relationship,
      contact: member.contact,
    })
    setEditMemberId(member.id)
    handleOpenDialog()
  }

  const handleDeleteMember = async (id: string) => {
    const updatedFamilyMembers = familyMembers.filter(member => member.id !== id)
    if (userId) {
      const patientDocRef = doc(db, 'patients', userId)
      await updateDoc(patientDocRef, { familyMembers: updatedFamilyMembers })
    }
    setFamilyMembers(updatedFamilyMembers)
  }

  return (
    <Container maxWidth='sm' sx={{ mt: 5, textAlign: 'center' }}>
      <Typography variant='h4' color='primary' gutterBottom>
        أفراد العائلة
      </Typography>
      <List>
        {familyMembers.map(member => (
          <ListItem
            key={member.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ListItemText primary={member.name} secondary={`${member.relationship} - ${member.contact}`} />
            <Box>
              <Button variant='outlined' color='primary' sx={{ mr: 1 }} onClick={() => handleEditMember(member)}>
                تعديل
              </Button>
              <Button variant='outlined' color='secondary' onClick={() => handleDeleteMember(member.id)}>
                حذف
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 3 }}>
        <Button variant='contained' color='primary' onClick={handleOpenDialog}>
          إضافة فرد جديد
        </Button>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMemberId ? 'تعديل بيانات فرد العائلة' : 'إضافة فرد جديد'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='اسم'
            type='text'
            fullWidth
            variant='outlined'
            value={newMember.name}
            onChange={e => setNewMember({ ...newMember, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='علاقة'
            type='text'
            fullWidth
            variant='outlined'
            value={newMember.relationship}
            onChange={e => setNewMember({ ...newMember, relationship: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='وسيلة الاتصال'
            type='text'
            fullWidth
            variant='outlined'
            value={newMember.contact}
            onChange={e => setNewMember({ ...newMember, contact: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            إلغاء
          </Button>
          <Button onClick={handleSaveMember} color='primary'>
            {editMemberId ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
