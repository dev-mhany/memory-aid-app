'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { db } from '../../lib/firebaseConfig'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

type FamilyMember = {
  id: string
  name: string
  relationship: string
  contact: string
}

type Patient = {
  id: string
  name: string
  age: string
  condition: string
  lastGameMistakes: number
  lastGameTime: number
  dailyRoutine: string
  favoriteSongs: string
  importantEvents: string
  familyMembers: FamilyMember[]
}

const ADMIN_PASSWORD = '123456'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPatients = async () => {
        const patientsCollection = collection(db, 'patients')
        const patientsSnapshot = await getDocs(patientsCollection)
        const patientsList = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient))
        setPatients(patientsList)
      }

      fetchPatients()
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect password')
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditPatient(patient)
    setOpenDialog(true)
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'patients', id))
    setPatients(patients.filter(patient => patient.id !== id))
  }

  const handleSave = async () => {
    if (editPatient) {
      const patientDocRef = doc(db, 'patients', editPatient.id)
      await updateDoc(patientDocRef, {
        name: editPatient.name,
        age: editPatient.age,
        condition: editPatient.condition,
        lastGameMistakes: editPatient.lastGameMistakes,
        lastGameTime: editPatient.lastGameTime,
        dailyRoutine: editPatient.dailyRoutine,
        favoriteSongs: editPatient.favoriteSongs,
        importantEvents: editPatient.importantEvents,
        familyMembers: editPatient.familyMembers,
      })

      setPatients(prevPatients => prevPatients.map(patient => (patient.id === editPatient.id ? editPatient : patient)))
      setOpenDialog(false)
    }
  }

  const handleFamilyMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    if (editPatient) {
      const updatedFamilyMembers = [...editPatient.familyMembers]
      updatedFamilyMembers[index] = { ...updatedFamilyMembers[index], [field]: value }
      setEditPatient(prev => (prev ? { ...prev, familyMembers: updatedFamilyMembers } : prev))
    }
  }

  const handleAddFamilyMember = () => {
    if (editPatient) {
      setEditPatient(prev =>
        prev
          ? {
              ...prev,
              familyMembers: [
                ...prev.familyMembers,
                { id: new Date().getTime().toString(), name: '', relationship: '', contact: '' },
              ],
            }
          : prev
      )
    }
  }

  const handleDeleteFamilyMember = (index: number) => {
    if (editPatient) {
      const updatedFamilyMembers = [...editPatient.familyMembers]
      updatedFamilyMembers.splice(index, 1)
      setEditPatient(prev => (prev ? { ...prev, familyMembers: updatedFamilyMembers } : prev))
    }
  }

  return (
    <Container maxWidth='lg' sx={{ mt: 5, textAlign: 'center' }}>
      {!isAuthenticated ? (
        <Box>
          <Typography variant='h4' color='primary' gutterBottom>
            Admin Login
          </Typography>
          <TextField
            type='password'
            label='Password'
            variant='outlined'
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            fullWidth
          />
          <Button variant='contained' color='primary' onClick={handleLogin}>
            Login
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant='h4' color='primary' gutterBottom>
            All Patients
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Last Game Mistakes</TableCell>
                  <TableCell>Last Game Time (s)</TableCell>
                  <TableCell>Daily Routine</TableCell>
                  <TableCell>Favorite Songs</TableCell>
                  <TableCell>Important Events</TableCell>
                  <TableCell>Family Members</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map(patient => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.condition}</TableCell>
                    <TableCell>{patient.lastGameMistakes}</TableCell>
                    <TableCell>{patient.lastGameTime}</TableCell>
                    <TableCell>{patient.dailyRoutine}</TableCell>
                    <TableCell>{patient.favoriteSongs}</TableCell>
                    <TableCell>{patient.importantEvents}</TableCell>
                    <TableCell>
                      <List>
                        {patient.familyMembers.map(member => (
                          <ListItem key={member.id}>
                            <ListItemText
                              primary={member.name}
                              secondary={`Relationship: ${member.relationship}, Contact: ${member.contact}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell>
                      <Button variant='outlined' color='primary' sx={{ mr: 1 }} onClick={() => handleEdit(patient)}>
                        Edit
                      </Button>
                      <Button variant='outlined' color='secondary' onClick={() => handleDelete(patient.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Patient</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            label='Name'
            type='text'
            fullWidth
            variant='outlined'
            value={editPatient?.name || ''}
            onChange={e => setEditPatient(prev => (prev ? { ...prev, name: e.target.value } : prev))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Age'
            type='text'
            fullWidth
            variant='outlined'
            value={editPatient?.age || ''}
            onChange={e => setEditPatient(prev => (prev ? { ...prev, age: e.target.value } : prev))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Condition'
            type='text'
            fullWidth
            variant='outlined'
            value={editPatient?.condition || ''}
            onChange={e => setEditPatient(prev => (prev ? { ...prev, condition: e.target.value } : prev))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Last Game Mistakes'
            type='number'
            fullWidth
            variant='outlined'
            value={editPatient?.lastGameMistakes || ''}
            onChange={e =>
              setEditPatient(prev => (prev ? { ...prev, lastGameMistakes: parseInt(e.target.value) } : prev))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Last Game Time (s)'
            type='number'
            fullWidth
            variant='outlined'
            value={editPatient?.lastGameTime || ''}
            onChange={e => setEditPatient(prev => (prev ? { ...prev, lastGameTime: parseInt(e.target.value) } : prev))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Daily Routine'
            type='text'
            fullWidth
            variant='outlined'
            value={editPatient?.dailyRoutine || ''}
            onChange={e => setEditPatient(prev => (prev ? { ...prev, dailyRoutine: e.target.value } : prev))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Favorite Songs'
            type='text'
            fullWidth
            variant='outlined'
            value={editPatient?.favoriteSongs || ''}
            onChange={e => setEditPatient(prev => (prev ? { ...prev, favoriteSongs: e.target.value } : prev))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Important Events'
            type='text'
            fullWidth
            variant='outlined'
            value={editPatient?.importantEvents || ''}
            onChange={e => setEditPatient(prev => (prev ? { ...prev, importantEvents: e.target.value } : prev))}
            sx={{ mb: 2 }}
          />
          <Typography variant='h6' sx={{ mt: 2 }}>
            Family Members
          </Typography>
          {editPatient?.familyMembers.map((member, index) => (
            <Box key={member.id} sx={{ mb: 2 }}>
              <TextField
                margin='dense'
                label='Name'
                type='text'
                fullWidth
                variant='outlined'
                value={member.name}
                onChange={e => handleFamilyMemberChange(index, 'name', e.target.value)}
                sx={{ mb: 1 }}
              />
              <TextField
                margin='dense'
                label='Relationship'
                type='text'
                fullWidth
                variant='outlined'
                value={member.relationship}
                onChange={e => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                sx={{ mb: 1 }}
              />
              <TextField
                margin='dense'
                label='Contact'
                type='text'
                fullWidth
                variant='outlined'
                value={member.contact}
                onChange={e => handleFamilyMemberChange(index, 'contact', e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => handleDeleteFamilyMember(index)}
                sx={{ mt: 1 }}
              >
                Delete Family Member
              </Button>
            </Box>
          ))}
          <Button variant='outlined' color='primary' onClick={handleAddFamilyMember}>
            Add Family Member
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSave} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
