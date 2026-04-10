'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Page1 from '@/components/Page1'
import Page2 from '@/components/Page2'
import Page3 from '@/components/Page3'
import { BUILDINGS, Building } from '@/data/buildings'
import { Cut } from '@/data/cuts'

interface FormData {
  unit: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [selectedCut, setSelectedCut] = useState<Cut | null>(null)
  const [formData, setFormData] = useState<FormData>({
    unit: '', firstName: '', lastName: '', email: '', phone: ''
  })

  // Read ?b= URL param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const bKey = (params.get('b') || '').toLowerCase()
    if (bKey) {
      const b = BUILDINGS.find(b => b.key === bKey)
      if (b) {
        setSelectedKey(bKey)
        setSelectedBuilding(b)
      }
    }
  }, [])

  const handleSelectBuilding = (key: string) => {
    const b = BUILDINGS.find(b => b.key === key)
    setSelectedKey(key)
    setSelectedBuilding(b || null)
    // Update URL without reload
    const url = new URL(window.location.href)
    url.searchParams.set('b', key)
    window.history.replaceState({}, '', url.toString())
    // Immediately advance to step 2
    window.scrollTo(0, 0)
    setStep(2)
  }

  const goTo2 = () => {
    window.scrollTo(0, 0)
    setStep(2)
  }

  const goTo3 = (fd: FormData, cut: Cut) => {
    setFormData(fd)
    setSelectedCut(cut)
    window.scrollTo(0, 0)
    setStep(3)
  }

  const goTo1 = () => {
    window.scrollTo(0, 0)
    setStep(1)
  }

  const goTo2Back = () => {
    window.scrollTo(0, 0)
    setStep(2)
  }

  return (
    <>
      <Nav step={step} />
      {step === 1 && (
        <Page1
          selectedKey={selectedKey}
          onSelect={handleSelectBuilding}
          onContinue={goTo2}
        />
      )}
      {step === 2 && selectedKey && (
        <Page2
          buildingKey={selectedKey}
          onBack={goTo1}
          onContinue={goTo3}
        />
      )}
      {step === 3 && selectedBuilding && selectedCut && (
        <Page3
          building={selectedBuilding}
          cut={selectedCut}
          form={formData}
          onBack={goTo2Back}
        />
      )}
    </>
  )
}
