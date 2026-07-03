'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Page1 from '@/components/Page1'
import Page2 from '@/components/Page2'
import Page3 from '@/components/Page3'
import { BUILDINGS, Building } from '@/data/buildings'
import { Cut, CutSelection } from '@/components/Page2'
import type { PurchaseType } from '@/components/PurchaseTypeToggle'

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
  const [selections, setSelections] = useState<CutSelection[]>([])
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('subscription')
  const [formData, setFormData] = useState<FormData>({
    unit: '', firstName: '', lastName: '', email: '', phone: ''
  })

  const [checkoutBanner, setCheckoutBanner] = useState<'success' | 'cancelled' | null>(null)

  // Read ?b= and ?checkout= URL params on load
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
    // Stripe sends the customer back here after checkout — show a real
    // confirmation instead of silently landing on Step 1.
    const checkout = params.get('checkout')
    if (checkout === 'success' || checkout === 'cancelled') {
      setCheckoutBanner(checkout)
      const url = new URL(window.location.href)
      url.searchParams.delete('checkout')
      url.searchParams.delete('session_id')
      window.history.replaceState({}, '', url.toString())
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

  const goTo3 = (fd: FormData, sels: CutSelection[]) => {
    setFormData(fd)
    setSelections(sels)
    setSelectedCut(sels[0]?.cut ?? null)
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
      <Nav step={step} onLogoClick={goTo1} />
      {checkoutBanner && (
        <div
          role="status"
          style={{
            position: 'fixed', top: 56, left: 0, right: 0, zIndex: 290,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '13px 44px', fontSize: 13, lineHeight: 1.5,
            background: checkoutBanner === 'success' ? 'rgba(58,138,90,0.16)' : 'rgba(184,134,58,0.14)',
            borderBottom: `1px solid ${checkoutBanner === 'success' ? 'rgba(77,179,118,0.4)' : 'rgba(184,134,58,0.4)'}`,
            color: 'var(--cream)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <span>
            {checkoutBanner === 'success'
              ? <>✅ <strong>Payment confirmed.</strong> Your order is in — a confirmation email with your delivery date is on its way.</>
              : <>Checkout cancelled — your card was not charged. Your selections are still here whenever you&apos;re ready.</>}
          </span>
          <button
            onClick={() => setCheckoutBanner(null)}
            aria-label="Dismiss"
            style={{ background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', fontSize: 16, padding: '4px 8px' }}
          >
            ×
          </button>
        </div>
      )}
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
          purchaseType={purchaseType}
          onPurchaseTypeChange={setPurchaseType}
          initialSelections={selections}
          initialForm={formData}
          onBack={goTo1}
          onContinue={goTo3}
        />
      )}
      {step === 3 && selectedBuilding && selections.length > 0 && (
        <Page3
          building={selectedBuilding}
          selections={selections}
          form={formData}
          purchaseType={purchaseType}
          onPurchaseTypeChange={setPurchaseType}
          onBack={goTo2Back}
        />
      )}
    </>
  )
}
